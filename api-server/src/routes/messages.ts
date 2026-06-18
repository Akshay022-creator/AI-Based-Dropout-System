import { Router } from "express";
import { db, proctorMessagesTable, profilesTable, parentStudentTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { SendProctorMessageBody } from "@workspace/api-zod";

const router = Router();

// GET /conversations — list all conversation partners with last message
router.get("/conversations", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [me] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!me) return res.status(401).json({ error: "Not authenticated" });

  let partnerIds: number[] = [];

  if (me.role === "faculty") {
    const myStudents = await db.select().from(profilesTable).where(eq(profilesTable.proctorId, userId));
    for (const student of myStudents) {
      const links = await db.select().from(parentStudentTable).where(eq(parentStudentTable.studentId, student.id));
      for (const link of links) partnerIds.push(link.parentId);
    }
  } else if (me.role === "parent") {
    const links = await db.select().from(parentStudentTable).where(eq(parentStudentTable.parentId, userId));
    for (const link of links) {
      const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, link.studentId));
      if (student?.proctorId) partnerIds.push(student.proctorId);
    }
  }

  partnerIds = [...new Set(partnerIds)];

  const conversations = [];
  for (const partnerId of partnerIds) {
    const [partner] = await db.select().from(profilesTable).where(eq(profilesTable.id, partnerId));
    if (!partner) continue;

    const [lastMsg] = await db
      .select()
      .from(proctorMessagesTable)
      .where(or(
        and(eq(proctorMessagesTable.senderId, userId), eq(proctorMessagesTable.receiverId, partnerId)),
        and(eq(proctorMessagesTable.senderId, partnerId), eq(proctorMessagesTable.receiverId, userId))
      ))
      .orderBy(desc(proctorMessagesTable.createdAt))
      .limit(1);

    let studentInfo = null;
    if (me.role === "faculty") {
      const link = await db.select().from(parentStudentTable).where(eq(parentStudentTable.parentId, partnerId)).limit(1);
      if (link[0]) {
        const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, link[0].studentId));
        if (student) studentInfo = { name: student.name, usn: student.usn };
      }
    }

    conversations.push({
      partnerId,
      partnerName: partner.name,
      partnerRole: partner.role,
      studentInfo,
      lastMessage: lastMsg?.message ?? null,
      lastTime: lastMsg?.createdAt ?? null,
      lastSenderId: lastMsg?.senderId ?? null,
    });
  }

  conversations.sort((a, b) => {
    if (!a.lastTime && !b.lastTime) return 0;
    if (!a.lastTime) return 1;
    if (!b.lastTime) return -1;
    return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
  });

  return res.json(conversations);
});

// GET / — get all messages (optionally filtered by conversation partner)
router.get("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const withUserId = req.query.withUserId ? Number(req.query.withUserId) : null;

  const condition = withUserId
    ? or(
        and(eq(proctorMessagesTable.senderId, userId), eq(proctorMessagesTable.receiverId, withUserId)),
        and(eq(proctorMessagesTable.senderId, withUserId), eq(proctorMessagesTable.receiverId, userId))
      )
    : or(
        eq(proctorMessagesTable.senderId, userId),
        eq(proctorMessagesTable.receiverId, userId)
      );

  const messages = await db
    .select()
    .from(proctorMessagesTable)
    .where(condition)
    .orderBy(proctorMessagesTable.createdAt);

  return res.json(messages);
});

// POST / — send a message
router.post("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const parsed = SendProctorMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [created] = await db.insert(proctorMessagesTable).values({
    senderId: userId,
    receiverId: parsed.data.receiverId,
    message: parsed.data.message,
  }).returning();

  return res.status(201).json(created);
});

// DELETE /:id — delete own message
router.delete("/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [msg] = await db.select().from(proctorMessagesTable).where(eq(proctorMessagesTable.id, id));
  if (!msg) return res.status(404).json({ error: "Message not found" });
  if (msg.senderId !== userId) return res.status(403).json({ error: "Can only delete your own messages" });

  await db.delete(proctorMessagesTable).where(eq(proctorMessagesTable.id, id));
  return res.json({ success: true });
});

export default router;

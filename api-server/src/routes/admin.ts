import { Router } from "express";
import { db, profilesTable, proctorMessagesTable, subjectRecordsTable, academicsTable, timetablesTable, learningResourcesTable, parentStudentTable, settingsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  db.select().from(profilesTable).where(eq(profilesTable.id, userId)).then(([user]) => {
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    (req as any).adminUser = user;
    next();
  }).catch(() => res.status(500).json({ error: "DB error" }));
}

router.get("/stats", requireAdmin, async (req, res) => {
  const [userRows] = await db.select({ total: count() }).from(profilesTable);
  const roleBreakdown = await db
    .select({ role: profilesTable.role, cnt: count() })
    .from(profilesTable)
    .groupBy(profilesTable.role);
  const [msgRows] = await db.select({ total: count() }).from(proctorMessagesTable);
  const [subjectRows] = await db.select({ total: count() }).from(subjectRecordsTable);
  const [academicRows] = await db.select({ total: count() }).from(academicsTable);

  const atRiskStudents = await db
    .select({ id: subjectRecordsTable.studentId, att: sql<string>`AVG(${subjectRecordsTable.attendance})`, cie: sql<string>`AVG((${subjectRecordsTable.cie1}::numeric + ${subjectRecordsTable.cie2}::numeric) / 2)` })
    .from(subjectRecordsTable)
    .groupBy(subjectRecordsTable.studentId);
  const atRiskCount = atRiskStudents.filter(s => Number(s.att) < 75 || (Number(s.cie) / 20 * 100) < 60).length;

  return res.json({
    users: userRows?.total ?? 0,
    messages: msgRows?.total ?? 0,
    subjectRecords: subjectRows?.total ?? 0,
    academics: academicRows?.total ?? 0,
    atRiskStudents: atRiskCount,
    roleBreakdown: Object.fromEntries(roleBreakdown.map(r => [r.role, r.cnt])),
  });
});

router.get("/users", requireAdmin, async (req, res) => {
  const users = await db
    .select({
      id: profilesTable.id,
      email: profilesTable.email,
      name: profilesTable.name,
      role: profilesTable.role,
      usn: profilesTable.usn,
      section: profilesTable.section,
      semester: profilesTable.semester,
      phone: profilesTable.phone,
      branch: profilesTable.branch,
      createdAt: profilesTable.createdAt,
      proctorId: profilesTable.proctorId,
    })
    .from(profilesTable)
    .orderBy(profilesTable.role, profilesTable.name);
  return res.json(users);
});

router.patch("/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role, phone, section, branch, semester } = req.body as any;
  const [updated] = await db
    .update(profilesTable)
    .set({ name, email, role, phone, section, branch, semester })
    .where(eq(profilesTable.id, id))
    .returning();
  return res.json(updated);
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const adminId = (req as any).adminUser?.id;
  if (id === adminId) return res.status(400).json({ error: "Cannot delete yourself" });
  await db.delete(proctorMessagesTable).where(eq(proctorMessagesTable.senderId, id));
  await db.delete(proctorMessagesTable).where(eq(proctorMessagesTable.receiverId, id));
  await db.delete(parentStudentTable).where(eq(parentStudentTable.parentId, id));
  await db.delete(parentStudentTable).where(eq(parentStudentTable.studentId, id));
  await db.delete(subjectRecordsTable).where(eq(subjectRecordsTable.studentId, id));
  await db.delete(academicsTable).where(eq(academicsTable.studentId, id));
  await db.delete(profilesTable).where(eq(profilesTable.id, id));
  return res.json({ success: true });
});

router.post("/reset-password/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body as { password: string };
  if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  const hash = await bcrypt.hash(password, 10);
  await db.update(profilesTable).set({ passwordHash: hash }).where(eq(profilesTable.id, id));
  return res.json({ success: true });
});

router.post("/reseed", requireAdmin, async (req, res) => {
  try {
    const { forceSeedDemoData } = await import("../lib/demo-seed");
    await forceSeedDemoData();
    return res.json({ success: true, message: "Demo data re-seeded successfully" });
  } catch (err: any) {
    req.log.error({ err }, "Reseed failed");
    return res.status(500).json({ error: err.message ?? "Reseed failed" });
  }
});

// GET /settings — get all settings as key-value object
router.get("/settings", requireAdmin, async (req, res) => {
  const rows = await db.select().from(settingsTable);
  const result = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return res.json(result);
});

// PUT /settings — upsert one or more settings
router.put("/settings", requireAdmin, async (req, res) => {
  const updates = req.body as Record<string, string>;
  if (typeof updates !== "object" || Array.isArray(updates)) {
    return res.status(400).json({ error: "Body must be a key-value object" });
  }
  for (const [key, value] of Object.entries(updates)) {
    await db
      .insert(settingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
  }
  const rows = await db.select().from(settingsTable);
  return res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
});

export default router;

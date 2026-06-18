import { Router } from "express";
import { db, learningResourcesTable, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateResourceBody, ApproveResourceBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const { stream, semester, subject, status } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (stream) conditions.push(eq(learningResourcesTable.stream, stream));
  if (semester) conditions.push(eq(learningResourcesTable.semester, parseInt(semester)));
  if (subject) conditions.push(eq(learningResourcesTable.subject, subject));
  if (status) conditions.push(eq(learningResourcesTable.status, status as any));

  const records = conditions.length > 0
    ? await db.select().from(learningResourcesTable).where(and(...conditions))
    : await db.select().from(learningResourcesTable);

  return res.json(records);
});

router.post("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!profile) return res.status(401).json({ error: "User not found" });

  const isFaculty = profile.role === "faculty" || profile.role === "admin";

  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [created] = await db.insert(learningResourcesTable).values({
    ...parsed.data,
    uploadedById: userId,
    status: isFaculty ? "approved" : "pending",
    reviewedById: isFaculty ? userId : null,
  }).returning();
  return res.status(201).json(created);
});

router.put("/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const parsed = ApproveResourceBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [updated] = await db
    .update(learningResourcesTable)
    .set({ status: parsed.data.status, reviewedById: userId })
    .where(eq(learningResourcesTable.id, id))
    .returning();

  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  await db.delete(learningResourcesTable).where(eq(learningResourcesTable.id, id));
  return res.json({ message: "Deleted" });
});

export default router;

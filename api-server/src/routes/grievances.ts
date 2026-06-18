import { Router } from "express";
import { db, supportReportsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateGrievanceBody, UpdateGrievanceStatusBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const { status, priority } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (status) conditions.push(eq(supportReportsTable.status, status as any));
  if (priority) conditions.push(eq(supportReportsTable.priority, priority as any));

  const records = conditions.length > 0
    ? await db.select().from(supportReportsTable).where(and(...conditions))
    : await db.select().from(supportReportsTable);

  return res.json(records);
});

router.post("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  const parsed = CreateGrievanceBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [created] = await db.insert(supportReportsTable).values({
    ...parsed.data,
    studentId: parsed.data.isAnonymous ? null : userId,
  }).returning();
  return res.status(201).json(created);
});

router.put("/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const parsed = UpdateGrievanceStatusBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [updated] = await db
    .update(supportReportsTable)
    .set({ status: parsed.data.status })
    .where(eq(supportReportsTable.id, id))
    .returning();

  return res.json(updated);
});

export default router;

import { Router } from "express";
import { db, timetablesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateTimetableBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const { section, batch } = req.query as { section?: string; batch?: string };
  const conditions = [];
  if (section) conditions.push(eq(timetablesTable.section, section));
  if (batch) conditions.push(eq(timetablesTable.batch, batch));

  const entries = conditions.length > 0
    ? await db.select().from(timetablesTable).where(and(...conditions))
    : await db.select().from(timetablesTable);

  return res.json(entries);
});

router.post("/", async (req, res) => {
  const parsed = CreateTimetableBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [created] = await db.insert(timetablesTable).values(parsed.data).returning();
  return res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const parsed = CreateTimetableBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [updated] = await db.update(timetablesTable).set(parsed.data).where(eq(timetablesTable.id, id)).returning();
  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  await db.delete(timetablesTable).where(eq(timetablesTable.id, id));
  return res.json({ message: "Deleted" });
});

export default router;

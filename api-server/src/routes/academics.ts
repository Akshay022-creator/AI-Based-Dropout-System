import { Router } from "express";
import { db, academicsTable, subjectRecordsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateAcademicsBody } from "@workspace/api-zod";

const router = Router();

router.get("/:studentId", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  if (isNaN(studentId)) return res.status(400).json({ error: "Invalid ID" });

  const [rec] = await db
    .select()
    .from(academicsTable)
    .where(eq(academicsTable.studentId, studentId))
    .limit(1);

  if (!rec) {
    // Return default zeros if no record exists yet
    return res.json({ id: 0, studentId, sgpa: "0.00", cgpa: "0.00", overallAttendance: "0.00", updatedAt: new Date().toISOString() });
  }

  return res.json(rec);
});

router.put("/:studentId", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  if (isNaN(studentId)) return res.status(400).json({ error: "Invalid ID" });

  const parsed = UpdateAcademicsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { sgpa, cgpa, overallAttendance } = parsed.data;
  const updates: any = { updatedAt: new Date() };
  if (sgpa !== undefined) updates.sgpa = String(sgpa);
  if (cgpa !== undefined) updates.cgpa = String(cgpa);
  if (overallAttendance !== undefined) updates.overallAttendance = String(overallAttendance);

  const existing = await db.select().from(academicsTable).where(eq(academicsTable.studentId, studentId)).limit(1);

  if (existing.length === 0) {
    const [created] = await db.insert(academicsTable).values({ studentId, ...updates }).returning();
    return res.json(created);
  }

  const [updated] = await db.update(academicsTable).set(updates).where(eq(academicsTable.studentId, studentId)).returning();
  return res.json(updated);
});

router.get("/:studentId/subjects", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  if (isNaN(studentId)) return res.status(400).json({ error: "Invalid ID" });

  const records = await db
    .select()
    .from(subjectRecordsTable)
    .where(eq(subjectRecordsTable.studentId, studentId));

  return res.json(records);
});

export default router;

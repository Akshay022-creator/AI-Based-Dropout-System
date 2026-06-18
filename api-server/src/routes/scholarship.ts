import { Router } from "express";
import { db, scholarshipApplicationsTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/scholarship/application
router.get("/application", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const [app] = await db
    .select()
    .from(scholarshipApplicationsTable)
    .where(eq(scholarshipApplicationsTable.studentId, userId))
    .limit(1);

  if (!app) return res.json(null);
  return res.json({
    ...app,
    generalInfo: app.generalInfo ? JSON.parse(app.generalInfo) : null,
    academicInfo: app.academicInfo ? JSON.parse(app.academicInfo) : null,
    documents: app.documents ? JSON.parse(app.documents) : null,
  });
});

// PUT /api/scholarship/application
router.put("/application", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!profile || profile.role !== "student") return res.status(403).json({ error: "Students only" });

  const { step, generalInfo, academicInfo, documents, submitted } = req.body;

  const updates: any = {
    currentStep: step ?? 1,
    updatedAt: new Date(),
  };
  if (generalInfo !== undefined) updates.generalInfo = JSON.stringify(generalInfo);
  if (academicInfo !== undefined) updates.academicInfo = JSON.stringify(academicInfo);
  if (documents !== undefined) updates.documents = JSON.stringify(documents);
  if (submitted) updates.submittedAt = new Date();

  const existing = await db
    .select()
    .from(scholarshipApplicationsTable)
    .where(eq(scholarshipApplicationsTable.studentId, userId))
    .limit(1);

  if (existing.length === 0) {
    const [created] = await db
      .insert(scholarshipApplicationsTable)
      .values({ studentId: userId, ...updates })
      .returning();
    return res.json({
      ...created,
      generalInfo: created.generalInfo ? JSON.parse(created.generalInfo) : null,
      academicInfo: created.academicInfo ? JSON.parse(created.academicInfo) : null,
      documents: created.documents ? JSON.parse(created.documents) : null,
    });
  }

  const [updated] = await db
    .update(scholarshipApplicationsTable)
    .set(updates)
    .where(eq(scholarshipApplicationsTable.studentId, userId))
    .returning();

  return res.json({
    ...updated,
    generalInfo: updated.generalInfo ? JSON.parse(updated.generalInfo) : null,
    academicInfo: updated.academicInfo ? JSON.parse(updated.academicInfo) : null,
    documents: updated.documents ? JSON.parse(updated.documents) : null,
  });
});

export default router;

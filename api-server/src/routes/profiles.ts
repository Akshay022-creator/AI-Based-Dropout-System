import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const { role, section } = req.query as { role?: string; section?: string };

  let query = db.select({
    id: profilesTable.id,
    email: profilesTable.email,
    name: profilesTable.name,
    role: profilesTable.role,
    usn: profilesTable.usn,
    section: profilesTable.section,
    semester: profilesTable.semester,
    batchPreference: profilesTable.batchPreference,
    isCr: profilesTable.isCr,
    proctorId: profilesTable.proctorId,
    createdAt: profilesTable.createdAt,
  }).from(profilesTable);

  const conditions = [];
  if (role) conditions.push(eq(profilesTable.role, role as any));
  if (section) conditions.push(eq(profilesTable.section, section));

  const profiles = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  return res.json(profiles);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [profile] = await db.select({
    id: profilesTable.id,
    email: profilesTable.email,
    name: profilesTable.name,
    role: profilesTable.role,
    usn: profilesTable.usn,
    section: profilesTable.section,
    semester: profilesTable.semester,
    batchPreference: profilesTable.batchPreference,
    isCr: profilesTable.isCr,
    proctorId: profilesTable.proctorId,
    createdAt: profilesTable.createdAt,
  }).from(profilesTable).where(eq(profilesTable.id, id)).limit(1);

  if (!profile) return res.status(404).json({ error: "Profile not found" });
  return res.json(profile);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const updates: any = {};
  const { name, section, semester, batchPreference, isCr, proctorId } = parsed.data;
  if (name !== undefined) updates.name = name;
  if (section !== undefined) updates.section = section;
  if (semester !== undefined) updates.semester = semester;
  if (batchPreference !== undefined) updates.batchPreference = batchPreference;
  if (isCr !== undefined) updates.isCr = isCr;
  if (proctorId !== undefined) updates.proctorId = proctorId;

  if (Object.keys(updates).length === 0) {
    const [p] = await db.select().from(profilesTable).where(eq(profilesTable.id, id)).limit(1);
    const { passwordHash, ...safe } = p;
    return res.json(safe);
  }

  const [updated] = await db.update(profilesTable).set(updates).where(eq(profilesTable.id, id)).returning();
  const { passwordHash, ...safe } = updated;
  return res.json(safe);
});

export default router;

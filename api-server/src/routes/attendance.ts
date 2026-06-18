import { Router } from "express";
import { db, attendanceSessionsTable, attendanceEntriesTable, subjectRecordsTable, academicsTable, profilesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

async function requireFaculty(req: any, res: any): Promise<any | null> {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return null; }
  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!user || (user.role !== "faculty" && user.role !== "admin")) {
    res.status(403).json({ error: "Faculty only" }); return null;
  }
  return user;
}

const router = Router();

// GET /api/attendance/sessions?subject=&section=&semester=
router.get("/sessions", async (req, res) => {
  const { subject, section, semester } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (subject) conditions.push(eq(attendanceSessionsTable.subject, subject));
  if (section) conditions.push(eq(attendanceSessionsTable.section, section));
  if (semester) conditions.push(eq(attendanceSessionsTable.semester, parseInt(semester)));

  const sessions = await db
    .select()
    .from(attendanceSessionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${attendanceSessionsTable.sessionDate} DESC`)
    .limit(50);

  return res.json(sessions);
});

// GET /api/attendance/sessions/:id/entries
router.get("/sessions/:id/entries", async (req, res) => {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) return res.status(400).json({ error: "Invalid ID" });

  const entries = await db
    .select({
      id: attendanceEntriesTable.id,
      sessionId: attendanceEntriesTable.sessionId,
      studentId: attendanceEntriesTable.studentId,
      status: attendanceEntriesTable.status,
      markedAt: attendanceEntriesTable.markedAt,
      studentName: profilesTable.name,
      usn: profilesTable.usn,
    })
    .from(attendanceEntriesTable)
    .leftJoin(profilesTable, eq(attendanceEntriesTable.studentId, profilesTable.id))
    .where(eq(attendanceEntriesTable.sessionId, sessionId));

  return res.json(entries);
});

// GET /api/attendance/students?section=&semester= — list students for a section
router.get("/students", async (req, res) => {
  const { section, semester } = req.query as Record<string, string>;
  if (!section) return res.status(400).json({ error: "section required" });

  const students = await db
    .select()
    .from(profilesTable)
    .where(
      and(
        eq(profilesTable.role, "student"),
        eq(profilesTable.section, section),
        semester ? eq(profilesTable.semester, parseInt(semester)) : undefined as any,
      )
    );

  return res.json(students.filter(Boolean));
});

// POST /api/attendance/sessions — create session + save entries
router.post("/sessions", async (req, res) => {
  const user = await requireFaculty(req, res);
  if (!user) return;

  const { subject, section, semester, sessionDate, entries } = req.body as {
    subject: string;
    section: string;
    semester: number;
    sessionDate: string;
    entries: { studentId: number; status: "present" | "absent" }[];
  };

  if (!subject || !section || !semester || !sessionDate || !entries) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Delete any existing session for same date/subject/section
  const existing = await db
    .select()
    .from(attendanceSessionsTable)
    .where(
      and(
        eq(attendanceSessionsTable.subject, subject),
        eq(attendanceSessionsTable.section, section),
        eq(attendanceSessionsTable.sessionDate, sessionDate),
      )
    )
    .limit(1);

  let sessionId: number;
  if (existing.length > 0) {
    sessionId = existing[0].id;
    await db.delete(attendanceEntriesTable).where(eq(attendanceEntriesTable.sessionId, sessionId));
  } else {
    const [session] = await db
      .insert(attendanceSessionsTable)
      .values({ subject, section, semester, sessionDate, facultyId: user.id })
      .returning();
    sessionId = session.id;
  }

  // Insert entries
  if (entries.length > 0) {
    await db.insert(attendanceEntriesTable).values(
      entries.map((e) => ({ sessionId, studentId: e.studentId, status: e.status }))
    );
  }

  // Recalculate attendance % for each student in this subject
  for (const entry of entries) {
    const allEntries = await db
      .select()
      .from(attendanceEntriesTable)
      .innerJoin(attendanceSessionsTable, eq(attendanceEntriesTable.sessionId, attendanceSessionsTable.id))
      .where(
        and(
          eq(attendanceEntriesTable.studentId, entry.studentId),
          eq(attendanceSessionsTable.subject, subject),
        )
      );

    const total = allEntries.length;
    const present = allEntries.filter((r) => r.attendance_entries.status === "present").length;
    const pct = total > 0 ? (present / total) * 100 : 0;

    // Update subject_records attendance
    const existing = await db
      .select()
      .from(subjectRecordsTable)
      .where(and(eq(subjectRecordsTable.studentId, entry.studentId), eq(subjectRecordsTable.subject, subject)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(subjectRecordsTable)
        .set({ attendance: String(pct.toFixed(2)) })
        .where(and(eq(subjectRecordsTable.studentId, entry.studentId), eq(subjectRecordsTable.subject, subject)));
    }

    // Update overall attendance
    const allSubjects = await db
      .select()
      .from(subjectRecordsTable)
      .where(eq(subjectRecordsTable.studentId, entry.studentId));

    if (allSubjects.length > 0) {
      const avg = allSubjects.reduce((sum, s) => sum + Number(s.attendance), 0) / allSubjects.length;
      await db
        .update(academicsTable)
        .set({ overallAttendance: String(avg.toFixed(2)), updatedAt: new Date() })
        .where(eq(academicsTable.studentId, entry.studentId));
    }
  }

  return res.status(201).json({ message: "Attendance saved", sessionId });
});

export default router;

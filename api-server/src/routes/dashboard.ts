import { Router } from "express";
import { db, profilesTable, academicsTable, subjectRecordsTable, timetablesTable, supportReportsTable, learningResourcesTable, parentStudentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const DAILY_QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Education is the most powerful weapon which you can use to change the world. — Nelson Mandela",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "Learning never exhausts the mind. — Leonardo da Vinci",
  "The expert in anything was once a beginner. — Helen Hayes",
];

const router = Router();

const profileFields = {
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
};

function computeDropoutRisk(att: number, sgpa: number): { score: number; level: "low" | "medium" | "high" | "critical" } {
  const attScore = att < 65 ? 40 : att < 75 ? 30 : att < 85 ? 15 : 0;
  const sgpaScore = sgpa < 4 ? 40 : sgpa < 5 ? 30 : sgpa < 6 ? 15 : sgpa < 7 ? 5 : 0;
  const score = Math.min(100, attScore + sgpaScore);
  const level = score >= 60 ? "critical" : score >= 35 ? "high" : score >= 15 ? "medium" : "low";
  return { score, level };
}

router.get("/student", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [profile] = await db.select(profileFields).from(profilesTable).where(eq(profilesTable.id, userId)).limit(1);
  const [academics] = await db.select().from(academicsTable).where(eq(academicsTable.studentId, userId)).limit(1);
  const subjectRecords = await db.select().from(subjectRecordsTable).where(eq(subjectRecordsTable.studentId, userId));
  const upcomingTimetable = profile?.section
    ? await db.select().from(timetablesTable).where(eq(timetablesTable.section, profile.section)).limit(6)
    : [];
  const recentGrievances = await db.select().from(supportReportsTable).where(eq(supportReportsTable.studentId, userId)).limit(3);
  const dailyQuote = DAILY_QUOTES[new Date().getDay() % DAILY_QUOTES.length];

  return res.json({
    profile: profile ?? { id: userId, email: "", name: "Student", role: "student", usn: null, section: null, semester: null, batchPreference: null, isCr: false, proctorId: null, createdAt: new Date().toISOString() },
    academics: academics ?? { id: 0, studentId: userId, sgpa: "0.00", cgpa: "0.00", overallAttendance: "0.00", updatedAt: new Date().toISOString() },
    subjectRecords,
    upcomingTimetable,
    recentGrievances,
    dailyQuote,
  });
});

router.get("/faculty", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [profile] = await db.select(profileFields).from(profilesTable).where(eq(profilesTable.id, userId)).limit(1);
  const allStudents = await db.select({ id: profilesTable.id, section: profilesTable.section }).from(profilesTable).where(eq(profilesTable.role, "student"));
  const allAcademics = await db.select().from(academicsTable);
  const pendingResources = await db.select({ id: learningResourcesTable.id }).from(learningResourcesTable).where(eq(learningResourcesTable.status, "pending"));
  const openGrievances = await db.select({ id: supportReportsTable.id }).from(supportReportsTable).where(eq(supportReportsTable.status, "open"));

  const sectionMap: Record<string, number[]> = {};
  for (const student of allStudents) {
    if (!student.section) continue;
    const academic = allAcademics.find((a) => a.studentId === student.id);
    if (!sectionMap[student.section]) sectionMap[student.section] = [];
    sectionMap[student.section].push(academic ? Number(academic.overallAttendance) : 0);
  }
  const attendanceSummary = Object.entries(sectionMap).map(([section, vals]) => ({
    section,
    averageAttendance: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  const atRiskCount = allAcademics.filter((a) => Number(a.overallAttendance) < 85 || Number(a.sgpa) < 6).length;
  const highPerformersCount = allAcademics.filter((a) => Number(a.sgpa) >= 8.5).length;

  return res.json({
    profile: profile ?? { id: userId, email: "", name: "Faculty", role: "faculty", usn: null, section: null, semester: null, batchPreference: null, isCr: false, proctorId: null, createdAt: new Date().toISOString() },
    totalStudents: allStudents.length,
    atRiskCount,
    highPerformersCount,
    pendingResourcesCount: pendingResources.length,
    openGrievancesCount: openGrievances.length,
    attendanceSummary,
  });
});

router.get("/parent", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [profile] = await db.select(profileFields).from(profilesTable).where(eq(profilesTable.id, userId)).limit(1);
  const links = await db.select().from(parentStudentTable).where(eq(parentStudentTable.parentId, userId));

  const children = await Promise.all(links.map(async (link) => {
    const [childProfile] = await db.select(profileFields).from(profilesTable).where(eq(profilesTable.id, link.studentId)).limit(1);
    const [academics] = await db.select().from(academicsTable).where(eq(academicsTable.studentId, link.studentId)).limit(1);
    const subjectRecords = await db.select().from(subjectRecordsTable).where(eq(subjectRecordsTable.studentId, link.studentId));

    const safeAcademics = academics ?? { id: 0, studentId: link.studentId, sgpa: "0.00", cgpa: "0.00", overallAttendance: "0.00", updatedAt: new Date().toISOString() };
    const att = Number(safeAcademics.overallAttendance);
    const sgpa = Number(safeAcademics.sgpa);
    const risk = computeDropoutRisk(att, sgpa);

    const alerts: { type: string; message: string; severity: "critical" | "warning" | "info" }[] = [];
    if (att < 75) alerts.push({ type: "attendance", message: `Critical: ${childProfile?.name ?? "Your child"}'s attendance is ${att.toFixed(1)}% — immediate intervention required.`, severity: "critical" });
    else if (att < 85) alerts.push({ type: "attendance", message: `${childProfile?.name ?? "Your child"}'s attendance is ${att.toFixed(1)}% — below the 85% threshold.`, severity: "warning" });
    if (sgpa < 5) alerts.push({ type: "marks", message: `${childProfile?.name ?? "Your child"}'s SGPA is ${sgpa.toFixed(2)} — academic performance needs attention.`, severity: "critical" });

    // Per-subject alerts
    for (const subj of subjectRecords) {
      const subjAtt = Number(subj.attendance);
      if (subjAtt < 75) {
        alerts.push({ type: "subject_attendance", message: `${subj.subject}: attendance is ${subjAtt.toFixed(1)}% — critically low.`, severity: "critical" });
      }
    }

    return { profile: childProfile, academics: safeAcademics, subjectRecords, alerts, dropoutRisk: risk };
  }));

  return res.json({
    profile: profile ?? { id: userId, email: "", name: "Parent", role: "parent", usn: null, section: null, semester: null, batchPreference: null, isCr: false, proctorId: null, createdAt: new Date().toISOString() },
    children,
  });
});

export default router;

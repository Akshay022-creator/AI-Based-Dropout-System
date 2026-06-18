import bcrypt from "bcrypt";
import { db, profilesTable, academicsTable, subjectRecordsTable, timetablesTable, learningResourcesTable, parentStudentTable, proctorMessagesTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

async function runSeed(password: string) {
  const [faculty1] = await db.insert(profilesTable).values({
    email: "dr.mehta@rnsit.ac.in",
    passwordHash: password,
    name: "Dr. Rajesh Mehta",
    role: "faculty",
    section: "CS-A",
    branch: "Computer Science",
    phone: "9380838591",
  }).returning();

  const [faculty2] = await db.insert(profilesTable).values({
    email: "prof.sharma@rnsit.ac.in",
    passwordHash: password,
    name: "Prof. Anita Sharma",
    role: "faculty",
    section: "CS-B",
    branch: "Computer Science",
    phone: "9380838592",
  }).returning();

  // Students under Dr. Mehta (CS-A)
  const [student1] = await db.insert(profilesTable).values({
    email: "arjun.kumar@rnsit.ac.in",
    passwordHash: password,
    name: "Arjun Kumar",
    role: "student",
    usn: "1RN21CS001",
    section: "CS-A",
    semester: 5,
    batchPreference: "morning",
    isCr: true,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838591",
  }).returning();

  const [student2] = await db.insert(profilesTable).values({
    email: "priya.singh@rnsit.ac.in",
    passwordHash: password,
    name: "Priya Singh",
    role: "student",
    usn: "1RN21CS002",
    section: "CS-A",
    semester: 5,
    batchPreference: "morning",
    isCr: false,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838593",
  }).returning();

  // At-risk students under Dr. Mehta (CS-A) — visible in demo faculty Alert Center
  const [student3] = await db.insert(profilesTable).values({
    email: "ravi.nair@rnsit.ac.in",
    passwordHash: password,
    name: "Ravi Nair",
    role: "student",
    usn: "1RN21CS003",
    section: "CS-A",
    semester: 5,
    batchPreference: "evening",
    isCr: false,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838594",
  }).returning();

  const [student4] = await db.insert(profilesTable).values({
    email: "amit.verma@rnsit.ac.in",
    passwordHash: password,
    name: "Amit Verma",
    role: "student",
    usn: "1RN21CS004",
    section: "CS-A",
    semester: 5,
    batchPreference: "morning",
    isCr: false,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838595",
  }).returning();

  // More at-risk students under Dr. Mehta (CS-A) — all visible in demo Alert Center
  const [student5] = await db.insert(profilesTable).values({
    email: "sneha.reddy@rnsit.ac.in",
    passwordHash: password,
    name: "Sneha Reddy",
    role: "student",
    usn: "1RN21CS005",
    section: "CS-A",
    semester: 5,
    batchPreference: "morning",
    isCr: false,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838596",
  }).returning();

  const [student6] = await db.insert(profilesTable).values({
    email: "rohan.das@rnsit.ac.in",
    passwordHash: password,
    name: "Rohan Das",
    role: "student",
    usn: "1RN21CS006",
    section: "CS-A",
    semester: 5,
    batchPreference: "evening",
    isCr: false,
    proctorId: faculty1.id,
    branch: "Computer Science",
    phone: "9380838597",
  }).returning();

  // Parents
  const [parent1] = await db.insert(profilesTable).values({
    email: "parent.kumar@example.com",
    passwordHash: password,
    name: "Suresh Kumar",
    role: "parent",
    phone: "9380838591",
  }).returning();

  const [parent2] = await db.insert(profilesTable).values({
    email: "parent.nair@example.com",
    passwordHash: password,
    name: "Krishnan Nair",
    role: "parent",
    phone: "9380838591",
  }).returning();

  const [parent3] = await db.insert(profilesTable).values({
    email: "parent.verma@example.com",
    passwordHash: password,
    name: "Suresh Verma",
    role: "parent",
    phone: "9380838591",
  }).returning();

  const [parent4] = await db.insert(profilesTable).values({
    email: "parent.reddy@example.com",
    passwordHash: password,
    name: "Ramesh Reddy",
    role: "parent",
    phone: "9380838591",
  }).returning();

  const [parent5] = await db.insert(profilesTable).values({
    email: "parent.das@example.com",
    passwordHash: password,
    name: "Bikash Das",
    role: "parent",
    phone: "9380838591",
  }).returning();

  // Link parents to students
  await db.insert(parentStudentTable).values({ parentId: parent1.id, studentId: student1.id });
  await db.insert(parentStudentTable).values({ parentId: parent2.id, studentId: student3.id });
  await db.insert(parentStudentTable).values({ parentId: parent3.id, studentId: student4.id });
  await db.insert(parentStudentTable).values({ parentId: parent4.id, studentId: student5.id });
  await db.insert(parentStudentTable).values({ parentId: parent5.id, studentId: student6.id });

  // Academics
  await db.insert(academicsTable).values({ studentId: student1.id, sgpa: "8.42", cgpa: "8.15", overallAttendance: "87.5" });
  await db.insert(academicsTable).values({ studentId: student2.id, sgpa: "9.10", cgpa: "8.90", overallAttendance: "92.0" });
  await db.insert(academicsTable).values({ studentId: student3.id, sgpa: "5.80", cgpa: "6.10", overallAttendance: "68.3" });
  await db.insert(academicsTable).values({ studentId: student4.id, sgpa: "5.20", cgpa: "5.80", overallAttendance: "65.0" });
  await db.insert(academicsTable).values({ studentId: student5.id, sgpa: "6.10", cgpa: "6.40", overallAttendance: "70.5" });
  await db.insert(academicsTable).values({ studentId: student6.id, sgpa: "5.50", cgpa: "5.90", overallAttendance: "62.0" });

  const arjunSubjects = [
    { subject: "Data Structures & Algorithms", attendance: "88.5", cie1: "18", cie2: "19", aat1: "9", aat2: "10", lab: "24", see: "75" },
    { subject: "Database Management Systems", attendance: "82.0", cie1: "16", cie2: "18", aat1: "8", aat2: "9", lab: "22", see: "68" },
    { subject: "Computer Networks", attendance: "91.0", cie1: "20", cie2: "19", aat1: "10", aat2: "10", lab: null, see: "80" },
    { subject: "Operating Systems", attendance: "79.5", cie1: "14", cie2: "17", aat1: "8", aat2: "8", lab: "20", see: "65" },
    { subject: "Software Engineering", attendance: "94.0", cie1: "19", cie2: "20", aat1: "10", aat2: "9", lab: null, see: "82" },
    { subject: "Machine Learning", attendance: "83.5", cie1: "17", cie2: "16", aat1: "9", aat2: "8", lab: "23", see: "71" },
  ];
  for (const s of arjunSubjects) await db.insert(subjectRecordsTable).values({ studentId: student1.id, ...s } as any);

  const priyaSubjects = [
    { subject: "Data Structures & Algorithms", attendance: "95.0", cie1: "20", cie2: "20", aat1: "10", aat2: "10", lab: "25", see: "88" },
    { subject: "Database Management Systems", attendance: "93.5", cie1: "19", cie2: "20", aat1: "10", aat2: "9", lab: "24", see: "85" },
    { subject: "Computer Networks", attendance: "90.0", cie1: "20", cie2: "18", aat1: "10", aat2: "10", lab: null, see: "86" },
  ];
  for (const s of priyaSubjects) await db.insert(subjectRecordsTable).values({ studentId: student2.id, ...s } as any);

  // At-risk: Ravi — low attendance + low CIE
  const raviSubjects = [
    { subject: "Computer Networks", attendance: "68.0", cie1: "10", cie2: "11", aat1: "6", aat2: "7", lab: null, see: "45" },
    { subject: "Operating Systems", attendance: "65.5", cie1: "9", cie2: "10", aat1: "5", aat2: "6", lab: "18", see: "42" },
    { subject: "Machine Learning", attendance: "71.0", cie1: "11", cie2: "10", aat1: "6", aat2: "5", lab: null, see: "48" },
  ];
  for (const s of raviSubjects) await db.insert(subjectRecordsTable).values({ studentId: student3.id, ...s } as any);

  // At-risk: Amit
  const amitSubjects = [
    { subject: "Data Structures & Algorithms", attendance: "62.0", cie1: "8", cie2: "9", aat1: "5", aat2: "4", lab: "16", see: "40" },
    { subject: "Database Management Systems", attendance: "67.5", cie1: "10", cie2: "8", aat1: "5", aat2: "5", lab: "17", see: "38" },
    { subject: "Computer Networks", attendance: "60.0", cie1: "7", cie2: "9", aat1: "4", aat2: "5", lab: null, see: "35" },
  ];
  for (const s of amitSubjects) await db.insert(subjectRecordsTable).values({ studentId: student4.id, ...s } as any);

  // At-risk: Sneha
  const snehaSubjects = [
    { subject: "Operating Systems", attendance: "72.0", cie1: "11", cie2: "10", aat1: "6", aat2: "6", lab: "19", see: "47" },
    { subject: "Software Engineering", attendance: "69.5", cie1: "9", cie2: "11", aat1: "5", aat2: "6", lab: null, see: "43" },
    { subject: "Machine Learning", attendance: "73.0", cie1: "12", cie2: "10", aat1: "6", aat2: "5", lab: null, see: "50" },
  ];
  for (const s of snehaSubjects) await db.insert(subjectRecordsTable).values({ studentId: student5.id, ...s } as any);

  // At-risk: Rohan
  const rohanSubjects = [
    { subject: "Computer Networks", attendance: "58.0", cie1: "7", cie2: "8", aat1: "4", aat2: "4", lab: null, see: "33" },
    { subject: "Operating Systems", attendance: "61.0", cie1: "8", cie2: "7", aat1: "4", aat2: "5", lab: "15", see: "36" },
    { subject: "Data Structures & Algorithms", attendance: "63.5", cie1: "9", cie2: "8", aat1: "5", aat2: "4", lab: "16", see: "39" },
  ];
  for (const s of rohanSubjects) await db.insert(subjectRecordsTable).values({ studentId: student6.id, ...s } as any);

  const timetableEntries = [
    { section: "CS-A", batch: "morning", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", subject: "Data Structures & Algorithms", facultyId: faculty1.id, room: "301" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Monday", startTime: "10:00", endTime: "11:00", subject: "Database Management Systems", facultyId: faculty1.id, room: "301" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Monday", startTime: "11:15", endTime: "12:15", subject: "Computer Networks", facultyId: faculty2.id, room: "302" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Tuesday", startTime: "09:00", endTime: "10:00", subject: "Operating Systems", facultyId: faculty1.id, room: "303" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Tuesday", startTime: "10:00", endTime: "11:00", subject: "Machine Learning", facultyId: faculty2.id, room: "304" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "11:00", subject: "DSA Lab", facultyId: faculty1.id, room: "Lab-1" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Thursday", startTime: "09:00", endTime: "10:00", subject: "Software Engineering", facultyId: faculty1.id, room: "301" },
    { section: "CS-A", batch: "morning", dayOfWeek: "Friday", startTime: "09:00", endTime: "10:00", subject: "Data Structures & Algorithms", facultyId: faculty1.id, room: "301" },
    { section: "CS-A", batch: "evening", dayOfWeek: "Monday", startTime: "14:00", endTime: "15:00", subject: "Data Structures & Algorithms", facultyId: faculty1.id, room: "305" },
    { section: "CS-B", batch: "morning", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", subject: "Computer Networks", facultyId: faculty2.id, room: "305" },
  ];
  for (const t of timetableEntries) await db.insert(timetablesTable).values(t);

  await db.insert(learningResourcesTable).values({
    title: "DSA Handwritten Notes - Chapter 5: Trees",
    description: "Complete handwritten notes on Binary Trees, BST, AVL Trees with diagrams",
    stream: "Computer Science", semester: 5, subject: "Data Structures & Algorithms",
    chapter: "Chapter 5", type: "notes", url: "https://drive.google.com/example",
    status: "approved", uploadedById: student1.id, reviewedById: faculty1.id,
  });

  await db.insert(learningResourcesTable).values({
    title: "DBMS Video Lecture - Normalization",
    description: "YouTube playlist covering 1NF, 2NF, 3NF, BCNF with examples",
    stream: "Computer Science", semester: 5, subject: "Database Management Systems",
    chapter: "Chapter 3", type: "video", url: "https://youtube.com/example",
    status: "approved", uploadedById: student2.id, reviewedById: faculty1.id,
  });

  await db.insert(learningResourcesTable).values({
    title: "Operating Systems Practice Questions",
    description: "Previous year VTU questions with solutions",
    stream: "Computer Science", semester: 5, subject: "Operating Systems",
    chapter: "All Chapters", type: "assignment", url: "https://drive.google.com/example2",
    status: "pending", uploadedById: student1.id,
  });

  await db.insert(proctorMessagesTable).values({
    senderId: faculty1.id, receiverId: parent1.id,
    message: "Hello, I am Dr. Mehta, Arjun's mentor. His academic performance this semester is very good. Please encourage him to maintain his attendance above 85%.",
  });
  await db.insert(proctorMessagesTable).values({
    senderId: parent1.id, receiverId: faculty1.id,
    message: "Thank you, Dr. Mehta. We will make sure he attends all classes. Is there anything specific we should focus on?",
  });
  await db.insert(proctorMessagesTable).values({
    senderId: faculty1.id, receiverId: parent1.id,
    message: "His DBMS and OS attendance is slightly low. Please ensure he attends these classes regularly. His CIE scores are good otherwise.",
  });
}

export async function seedDemoDataIfEmpty() {
  try {
    const existing = await db.select({ id: profilesTable.id }).from(profilesTable).limit(1);
    if (existing.length > 0) {
      logger.info("Demo data already present — skipping seed");
      return;
    }
    logger.info("No users found — seeding demo data...");
    const password = await bcrypt.hash("password123", 10);

    // Admin user
    await db.insert(profilesTable).values({
      email: "admin@rnsit.ac.in",
      passwordHash: password,
      name: "System Administrator",
      role: "admin",
    });

    await runSeed(password);
    logger.info("Demo data seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed demo data — server will still start");
  }
}

export async function forceSeedDemoData() {
  const password = await bcrypt.hash("password123", 10);

  // Clear all data in dependency order
  await db.delete(proctorMessagesTable);
  await db.delete(parentStudentTable);
  await db.delete(subjectRecordsTable);
  await db.delete(academicsTable);
  await db.delete(timetablesTable);
  await db.delete(learningResourcesTable);
  await db.delete(profilesTable);

  // Re-create admin user
  await db.insert(profilesTable).values({
    email: "admin@rnsit.ac.in",
    passwordHash: password,
    name: "System Administrator",
    role: "admin",
  });

  await runSeed(password);

  // Restore default demo phones list (preserves any admin customisation if already set)
  await db
    .insert(settingsTable)
    .values({ key: "alert_redirect_phones", value: JSON.stringify(["9380838591"]), updatedAt: new Date() })
    .onConflictDoNothing();

  logger.info("Demo data force-reseeded successfully");
}

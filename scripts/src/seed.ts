import { db, profilesTable, academicsTable, subjectRecordsTable, timetablesTable, learningResourcesTable, parentStudentTable, proctorMessagesTable } from "@workspace/db";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding Guardian Network database...");

  const password = await bcrypt.hash("password123", 10);

  // Clear existing data
  await db.delete(proctorMessagesTable);
  await db.delete(parentStudentTable);
  await db.delete(subjectRecordsTable);
  await db.delete(academicsTable);
  await db.delete(timetablesTable);
  await db.delete(learningResourcesTable);
  await db.delete(profilesTable);

  // Faculty - Dr. Mehta (proctor)
  const [faculty1] = await db.insert(profilesTable).values({
    email: "dr.mehta@rnsit.ac.in",
    passwordHash: password,
    name: "Dr. Rajesh Mehta",
    role: "faculty",
    section: "CS-A",
  }).returning();

  const [faculty2] = await db.insert(profilesTable).values({
    email: "prof.sharma@rnsit.ac.in",
    passwordHash: password,
    name: "Prof. Anita Sharma",
    role: "faculty",
    section: "CS-B",
  }).returning();

  // Student - Arjun Kumar
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
  }).returning();

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
  }).returning();

  // Parent - Suresh Kumar (parent of Arjun)
  const [parent1] = await db.insert(profilesTable).values({
    email: "parent.kumar@example.com",
    passwordHash: password,
    name: "Suresh Kumar",
    role: "parent",
  }).returning();

  // Link parent to student
  await db.insert(parentStudentTable).values({ parentId: parent1.id, studentId: student1.id });

  // Academics for students
  await db.insert(academicsTable).values({ studentId: student1.id, sgpa: "8.42", cgpa: "8.15", overallAttendance: "87.5" });
  await db.insert(academicsTable).values({ studentId: student2.id, sgpa: "9.10", cgpa: "8.90", overallAttendance: "92.0" });
  await db.insert(academicsTable).values({ studentId: student3.id, sgpa: "5.80", cgpa: "6.10", overallAttendance: "72.3" }); // at-risk

  // Subject records for Arjun
  const subjects = [
    { subject: "Data Structures & Algorithms", attendance: "88.5", cie1: "18", cie2: "19", aat1: "9", aat2: "10", lab: "24", see: "75" },
    { subject: "Database Management Systems", attendance: "82.0", cie1: "16", cie2: "18", aat1: "8", aat2: "9", lab: "22", see: "68" },
    { subject: "Computer Networks", attendance: "91.0", cie1: "20", cie2: "19", aat1: "10", aat2: "10", lab: null, see: "80" },
    { subject: "Operating Systems", attendance: "79.5", cie1: "14", cie2: "17", aat1: "8", aat2: "8", lab: "20", see: "65" },
    { subject: "Software Engineering", attendance: "94.0", cie1: "19", cie2: "20", aat1: "10", aat2: "9", lab: null, see: "82" },
    { subject: "Machine Learning", attendance: "83.5", cie1: "17", cie2: "16", aat1: "9", aat2: "8", lab: "23", see: "71" },
  ];

  for (const s of subjects) {
    await db.insert(subjectRecordsTable).values({ studentId: student1.id, ...s } as any);
  }

  // Subject records for Priya
  const priyaSubjects = [
    { subject: "Data Structures & Algorithms", attendance: "95.0", cie1: "20", cie2: "20", aat1: "10", aat2: "10", lab: "25", see: "88" },
    { subject: "Database Management Systems", attendance: "93.5", cie1: "19", cie2: "20", aat1: "10", aat2: "9", lab: "24", see: "85" },
    { subject: "Computer Networks", attendance: "90.0", cie1: "20", cie2: "18", aat1: "10", aat2: "10", lab: null, see: "86" },
  ];

  for (const s of priyaSubjects) {
    await db.insert(subjectRecordsTable).values({ studentId: student2.id, ...s } as any);
  }

  // Timetable for CS-A morning batch
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

  for (const t of timetableEntries) {
    await db.insert(timetablesTable).values(t);
  }

  // Learning resources
  await db.insert(learningResourcesTable).values({
    title: "DSA Handwritten Notes - Chapter 5: Trees",
    description: "Complete handwritten notes on Binary Trees, BST, AVL Trees with diagrams",
    stream: "Computer Science",
    semester: 5,
    subject: "Data Structures & Algorithms",
    chapter: "Chapter 5",
    type: "notes",
    url: "https://drive.google.com/example",
    status: "approved",
    uploadedById: student1.id,
    reviewedById: faculty1.id,
  });

  await db.insert(learningResourcesTable).values({
    title: "DBMS Video Lecture - Normalization",
    description: "YouTube playlist covering 1NF, 2NF, 3NF, BCNF with examples",
    stream: "Computer Science",
    semester: 5,
    subject: "Database Management Systems",
    chapter: "Chapter 3",
    type: "video",
    url: "https://youtube.com/example",
    status: "approved",
    uploadedById: student2.id,
    reviewedById: faculty1.id,
  });

  await db.insert(learningResourcesTable).values({
    title: "Operating Systems Practice Questions",
    description: "Previous year VTU questions with solutions",
    stream: "Computer Science",
    semester: 5,
    subject: "Operating Systems",
    chapter: "All Chapters",
    type: "assignment",
    url: "https://drive.google.com/example2",
    status: "pending",
    uploadedById: student1.id,
  });

  // Proctor messages
  await db.insert(proctorMessagesTable).values({
    senderId: faculty1.id,
    receiverId: parent1.id,
    message: "Hello, I am Dr. Mehta, Arjun's mentor. His academic performance this semester is very good. Please encourage him to maintain his attendance above 85%.",
  });

  await db.insert(proctorMessagesTable).values({
    senderId: parent1.id,
    receiverId: faculty1.id,
    message: "Thank you, Dr. Mehta. We will make sure he attends all classes. Is there anything specific we should focus on?",
  });

  await db.insert(proctorMessagesTable).values({
    senderId: faculty1.id,
    receiverId: parent1.id,
    message: "His DBMS and OS attendance is slightly low. Please ensure he attends these classes regularly. His CIE scores are good otherwise.",
  });

  console.log("Seed completed successfully!");
  console.log(`Created: faculty (2), students (3), parent (1)`);
  console.log(`Demo credentials (all): password123`);
  console.log(`  Student: arjun.kumar@rnsit.ac.in`);
  console.log(`  Parent:  parent.kumar@example.com`);
  console.log(`  Faculty: dr.mehta@rnsit.ac.in`);

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });

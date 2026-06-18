import { pgTable, serial, integer, timestamp, text, numeric, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const academicsTable = pgTable("student_academics", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique(),
  sgpa: numeric("sgpa", { precision: 4, scale: 2 }).notNull().default("0"),
  cgpa: numeric("cgpa", { precision: 4, scale: 2 }).notNull().default("0"),
  overallAttendance: numeric("overall_attendance", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subjectRecordsTable = pgTable("subject_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subject: text("subject").notNull(),
  attendance: numeric("attendance", { precision: 5, scale: 2 }).notNull().default("0"),
  cie1: numeric("cie1", { precision: 5, scale: 2 }),
  cie2: numeric("cie2", { precision: 5, scale: 2 }),
  aat1: numeric("aat1", { precision: 5, scale: 2 }),
  aat2: numeric("aat2", { precision: 5, scale: 2 }),
  lab: numeric("lab", { precision: 5, scale: 2 }),
  see: numeric("see", { precision: 5, scale: 2 }),
});

export const attendanceSessionsTable = pgTable("attendance_sessions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  section: text("section").notNull(),
  semester: integer("semester").notNull(),
  sessionDate: date("session_date").notNull(),
  facultyId: integer("faculty_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attendanceEntriesTable = pgTable("attendance_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull().default("present"),
  markedAt: timestamp("marked_at").notNull().defaultNow(),
});

export const scholarshipApplicationsTable = pgTable("scholarship_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique(),
  currentStep: integer("current_step").notNull().default(1),
  generalInfo: text("general_info"),
  academicInfo: text("academic_info"),
  documents: text("documents"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAcademicSchema = createInsertSchema(academicsTable).omit({ id: true, updatedAt: true });
export type InsertAcademic = z.infer<typeof insertAcademicSchema>;
export type Academic = typeof academicsTable.$inferSelect;

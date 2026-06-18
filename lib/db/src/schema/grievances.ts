import { pgTable, serial, integer, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);
export const grievanceStatusEnum = pgEnum("grievance_status", ["open", "in_progress", "resolved"]);
export const routedToEnum = pgEnum("routed_to", ["proctor", "hod", "dean"]);

export const supportReportsTable = pgTable("support_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: priorityEnum("priority").notNull().default("medium"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: grievanceStatusEnum("status").notNull().default("open"),
  routedTo: routedToEnum("routed_to").notNull().default("proctor"),
  studentId: integer("student_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGrievanceSchema = createInsertSchema(supportReportsTable).omit({ id: true, createdAt: true });
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type Grievance = typeof supportReportsTable.$inferSelect;

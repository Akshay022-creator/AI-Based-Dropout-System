import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timetablesTable = pgTable("timetables", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  batch: text("batch").notNull().default("morning"),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subject: text("subject").notNull(),
  facultyId: integer("faculty_id"),
  room: text("room"),
});

export const insertTimetableSchema = createInsertSchema(timetablesTable).omit({ id: true });
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetablesTable.$inferSelect;

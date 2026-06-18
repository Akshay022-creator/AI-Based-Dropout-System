import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resourceTypeEnum = pgEnum("resource_type", ["notes", "video", "assignment"]);
export const resourceStatusEnum = pgEnum("resource_status", ["pending", "approved", "rejected"]);

export const learningResourcesTable = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  stream: text("stream").notNull(),
  semester: integer("semester").notNull(),
  subject: text("subject").notNull(),
  chapter: text("chapter"),
  type: resourceTypeEnum("type").notNull().default("notes"),
  url: text("url"),
  status: resourceStatusEnum("status").notNull().default("pending"),
  uploadedById: integer("uploaded_by_id").notNull(),
  reviewedById: integer("reviewed_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResourceSchema = createInsertSchema(learningResourcesTable).omit({ id: true, createdAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof learningResourcesTable.$inferSelect;

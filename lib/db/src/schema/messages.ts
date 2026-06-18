import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const proctorMessagesTable = pgTable("proctor_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProctorMessageSchema = createInsertSchema(proctorMessagesTable).omit({ id: true, createdAt: true });
export type InsertProctorMessage = z.infer<typeof insertProctorMessageSchema>;
export type ProctorMessage = typeof proctorMessagesTable.$inferSelect;

import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// FPA Chapter request model
export const chapterRequests = pgTable("chapter_requests", {
  id: serial("id").primaryKey(),
  chapterName: text("chapter_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  preferredDate: date("preferred_date").notNull(),
  alternateDate: date("alternate_date"),
  estimatedAttendees: integer("estimated_attendees").notNull(),
  instructorName: text("instructor_name").notNull(),
  additionalInfo: text("additional_info"),
  status: text("status").notNull().default("pending"), // pending, approved, denied, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChapterRequestSchema = createInsertSchema(chapterRequests).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Workshop sessions model
export const workshopSessions = pgTable("workshop_sessions", {
  id: serial("id").primaryKey(),
  chapterName: text("chapter_name").notNull(),
  workshopDate: date("workshop_date").notNull(),
  instructorName: text("instructor_name").notNull(),
  maxAttendees: integer("max_attendees").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, in_progress, completed
  requestId: integer("request_id").references(() => chapterRequests.id),
  reportedToCfpBoard: boolean("reported_to_cfp_board").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkshopSessionSchema = createInsertSchema(workshopSessions).omit({
  id: true,
  status: true,
  reportedToCfpBoard: true,
  createdAt: true,
});

// Participants model
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  cfpId: text("cfp_id").notNull(),
  email: text("email").notNull(),
  sessionId: integer("session_id").references(() => workshopSessions.id),
  attendanceConfirmed: boolean("attendance_confirmed").notNull().default(true),
  reportedToCfpBoard: boolean("reported_to_cfp_board").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  reportedToCfpBoard: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChapterRequest = typeof chapterRequests.$inferSelect;
export type InsertChapterRequest = z.infer<typeof insertChapterRequestSchema>;

export type WorkshopSession = typeof workshopSessions.$inferSelect;
export type InsertWorkshopSession = z.infer<typeof insertWorkshopSessionSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

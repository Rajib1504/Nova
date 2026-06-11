import { pgTable, text, timestamp, varchar, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emails = pgTable('emails', {
  id: varchar('id', { length: 255 }).primaryKey(), // Gmail message ID
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  threadId: varchar('thread_id', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }),
  fromAddress: varchar('from_address', { length: 255 }),
  toAddress: text('to_address'), // JSON array string or comma separated
  snippet: text('snippet'),
  body: text('body'), 
  date: timestamp('date'),
  isRead: boolean('is_read').default(false),
  labels: jsonb('labels'), // e.g., ['INBOX', 'UNREAD']
  priority: varchar('priority', { length: 50 }), // LLM-determined priority
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const calendarEvents = pgTable('calendar_events', {
  id: varchar('id', { length: 255 }).primaryKey(), // Google Calendar event ID
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  summary: varchar('summary', { length: 500 }),
  description: text('description'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  location: text('location'),
  attendees: jsonb('attendees'),
  htmlLink: text('html_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

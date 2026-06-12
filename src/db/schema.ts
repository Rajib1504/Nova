import { pgTable, text, timestamp, varchar, boolean, jsonb, vector } from 'drizzle-orm/pg-core';

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
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-small / ada-002 dimensions
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

export const corsairIntegrations = pgTable('corsair_integrations', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  name: text('name').notNull(),
  config: jsonb('config').notNull().default({}),
  dek: text('dek'),
});

export const corsairAccounts = pgTable('corsair_accounts', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  tenantId: text('tenant_id').notNull(),
  integrationId: text('integration_id').notNull().references(() => corsairIntegrations.id),
  config: jsonb('config').notNull().default({}),
  dek: text('dek'),
});

export const corsairEntities = pgTable('corsair_entities', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  accountId: text('account_id').notNull().references(() => corsairAccounts.id),
  entityId: text('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  version: text('version').notNull(),
  data: jsonb('data').notNull().default({}),
});

export const corsairEvents = pgTable('corsair_events', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  accountId: text('account_id').notNull().references(() => corsairAccounts.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull().default({}),
  status: text('status'),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 255 }).notNull(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
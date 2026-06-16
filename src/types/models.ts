export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  htmlLink?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  fromAddress: string;
  toAddress?: string;
  snippet?: string;
  body?: string;
  date: string;
  isRead: boolean;
  priority: string;
  labels: string[];
}

export interface EmailThread {
  threadId: string;
  emails: EmailMessage[];
  latestDate: number;
  isPriority: boolean;
  subject: string;
  latestSender: string;
}

export interface GoogleCalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; };
  end?: { dateTime?: string; date?: string; };
  location?: string;
  attendees?: any[];
  htmlLink?: string;
}

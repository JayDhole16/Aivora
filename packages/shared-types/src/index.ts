export type UUID = string & { readonly __brand: unique symbol };

export type OrgId = UUID;
export type UserId = UUID;
export type ServiceId = UUID;
export type StaffId = UUID;
export type AppointmentId = UUID;
export type ConversationId = UUID;
export type MessageId = UUID;
export type CallLogId = UUID;
export type CredentialId = UUID;
export type KnowledgeBaseEntryId = UUID;
export type BusinessProfileId = UUID;
export type PhoneNumberId = UUID;
export type VoiceAgentConfigId = UUID;
export type WhatsAppBotConfigId = UUID;
export type WebsiteConfigId = UUID;
export type NotificationId = UUID;
export type SubscriptionId = UUID;
export type UsageRecordId = UUID;
export type AuditLogId = UUID;
export type TemplateId = UUID;

export type OrgRole = 'owner' | 'admin' | 'agent' | 'viewer';

export interface Organization {
  id: OrgId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface User {
  id: UserId;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  id: UUID;
  orgId: OrgId;
  userId: UserId;
  role: OrgRole;
  invitedBy: UserId | null;
  invitedAt: Date | null;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfile {
  id: BusinessProfileId;
  orgId: OrgId;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  logoUrl: string | null;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseEntry {
  id: KnowledgeBaseEntryId;
  orgId: OrgId;
  title: string;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  source: 'manual' | 'document_upload' | 'website_scrape';
  sourceDocumentId: UUID | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: ServiceId;
  orgId: OrgId;
  type: 'voice' | 'whatsapp' | 'website';
  name: string;
  status: 'draft' | 'preview' | 'live' | 'paused';
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceAgentConfig {
  id: VoiceAgentConfigId;
  orgId: OrgId;
  serviceId: ServiceId;
  personaName: string;
  greetingScript: string;
  voiceId: string;
  escalationNumber: string | null;
  businessHoursOverride: BusinessHours | null;
  bargeInEnabled: boolean;
  maxCallDurationSeconds: number;
  recordingEnabled: boolean;
  consentMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  open: string;
  close: string;
  breaks: { start: string; end: string }[];
}

export interface AppointmentService {
  id: UUID;
  orgId: OrgId;
  name: string;
  description: string | null;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  priceCents: number | null;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: StaffId;
  orgId: OrgId;
  name: string;
  email: string | null;
  phone: string | null;
  workingHours: BusinessHours;
  servicesOffered: ServiceId[];
  calendarConnectionId: UUID | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: AppointmentId;
  orgId: OrgId;
  serviceId: ServiceId;
  staffId: StaffId | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: ConversationId;
  orgId: OrgId;
  serviceId: ServiceId | null;
  channel: 'voice' | 'whatsapp' | 'web';
  customerIdentifier: string;
  status: 'active' | 'ended' | 'escalated';
  metadata: Record<string, unknown>;
  isSandbox: boolean;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date | null;
}

export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls: ToolCall[] | null;
  toolCallId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface CallLog {
  id: CallLogId;
  orgId: OrgId;
  conversationId: ConversationId | null;
  phoneNumberId: PhoneNumberId | null;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer';
  durationSeconds: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  outcome: 'booked' | 'escalated' | 'message_taken' | 'hangup' | 'failed' | null;
  costCents: number | null;
  isSandbox: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Credential {
  id: CredentialId;
  orgId: OrgId;
  type: 'twilio' | 'meta_whatsapp' | 'openai' | 'anthropic' | 'deepgram' | 'elevenlabs' | 'azure_tts' | 'google_calendar' | 'outlook_calendar' | 's3_storage' | 'other';
  name: string;
  secretRef: string;
  config: Record<string, unknown>;
  status: 'connected' | 'disconnected' | 'error' | 'validating';
  lastValidatedAt: Date | null;
  validationError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneNumber {
  id: PhoneNumberId;
  orgId: OrgId;
  serviceId: ServiceId | null;
  provider: 'twilio';
  providerSid: string;
  phoneNumber: string;
  friendlyName: string | null;
  capabilities: Record<string, boolean>;
  status: 'active' | 'released' | 'pending';
  monthlyCostCents: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: NotificationId;
  orgId: OrgId;
  type: 'appointment_reminder_24h' | 'appointment_reminder_1h' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_rescheduled' | 'call_missed' | 'voicemail_received' | 'whatsapp_inbound' | 'system';
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
  recipient: string;
  subject: string | null;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  relatedEntityType: 'appointment' | 'conversation' | 'call_log' | null;
  relatedEntityId: UUID | null;
  scheduledFor: Date;
  sentAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: UUID;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, unknown>;
  limits: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: SubscriptionId;
  orgId: OrgId;
  planId: UUID;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  id: UsageRecordId;
  orgId: OrgId;
  subscriptionId: SubscriptionId | null;
  metric: 'voice_minutes' | 'whatsapp_messages' | 'website_visits' | 'appointments_booked' | 'kb_searches' | 'api_calls';
  quantity: number;
  periodStart: Date;
  periodEnd: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLog {
  id: AuditLogId;
  orgId: OrgId | null;
  actorId: UserId | null;
  actorType: 'user' | 'system' | 'api_key';
  action: string;
  resourceType: string;
  resourceId: UUID | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface TemplateLibrary {
  id: TemplateId;
  category: 'voice_agent' | 'whatsapp_bot' | 'website' | 'kb_entry' | 'appointment_service' | 'notification';
  name: string;
  description: string | null;
  content: Record<string, unknown>;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarConnection {
  id: UUID;
  orgId: OrgId;
  provider: 'google' | 'outlook';
  externalAccountId: string;
  accessTokenRef: string;
  refreshTokenRef: string | null;
  expiresAt: Date | null;
  scope: string[];
  status: 'connected' | 'disconnected' | 'error';
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppBotConfig {
  id: WhatsAppBotConfigId;
  orgId: OrgId;
  serviceId: ServiceId;
  webhookUrl: string | null;
  verifyToken: string | null;
  businessAccountId: string | null;
  phoneNumberId: string | null;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppTemplate {
  id: UUID;
  orgId: OrgId;
  whatsappBotConfigId: WhatsAppBotConfigId | null;
  name: string;
  language: string;
  category: 'marketing' | 'utility' | 'authentication';
  components: Record<string, unknown>[];
  status: 'pending' | 'approved' | 'rejected';
  externalId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteConfig {
  id: WebsiteConfigId;
  orgId: OrgId;
  serviceId: ServiceId;
  subdomain: string | null;
  customDomain: string | null;
  theme: string;
  themeConfig: Record<string, unknown>;
  seoConfig: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteVersion {
  id: UUID;
  websiteConfigId: WebsiteConfigId;
  version: number;
  content: Record<string, unknown>;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}
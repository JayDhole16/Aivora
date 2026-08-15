// ─── Core domain types — match the API contract exactly ───────────────────────

export type ServiceType = 'voice' | 'whatsapp' | 'website';
export type ServiceStatus = 'draft' | 'testing' | 'live' | 'paused';
export type ConnectionStatus = 'not_connected' | 'pending_verification' | 'connected' | 'needs_attention';
export type Role = 'owner' | 'admin' | 'agent' | 'viewer';
export type IndustryVertical =
  | 'salon'
  | 'clinic'
  | 'restaurant'
  | 'gym'
  | 'real_estate'
  | 'home_services'
  | 'other';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industryVertical: IndustryVertical;
  timezone: string;
  address?: string;
  languages?: string[];
  logoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  org: Organization;
  onboardingCompleted: boolean;
  avatarUrl?: string;
}

export interface Service {
  id: string;
  orgId: string;
  type: ServiceType;
  name: string;
  status: ServiceStatus;
  deployedAt?: string;
  // stats
  callsThisWeek?: number;
  messagesThisWeek?: number;
  visitsThisWeek?: number;
}

export interface KnowledgeBaseEntry {
  id: string;
  type: 'faq' | 'policy' | 'service' | 'pricing' | 'hours' | 'custom';
  title: string;
  content: string;
  source: 'manual' | 'document_upload' | 'auto_parsed';
}

export interface Credential {
  id: string;
  serviceId?: string;
  provider: string;
  purpose: string;
  status: ConnectionStatus;
  lastValidatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface AppointmentService {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents?: number;
  bufferMinutes?: number;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  workingHours: Record<string, { open: string; close: string }[]>;
  services?: string[]; // AppointmentService ids
}

export interface Appointment {
  id: string;
  sourceChannel: 'voice' | 'whatsapp' | 'website';
  staffId: string;
  appointmentServiceId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  start: string;
  end: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
}

export interface Conversation {
  id: string;
  channel: 'voice' | 'whatsapp' | 'website_chat';
  status: 'active' | 'resolved' | 'escalated';
  resolutionType?: 'ai_resolved' | 'human_resolved' | 'abandoned';
  customerIdentifier: string;
  customerName?: string;
  startedAt: string;
  lastMessageAt?: string;
  summary?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'ai' | 'agent';
  content: string;
  createdAt: string;
  type?: 'text' | 'audio' | 'image';
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsKPI {
  callsTotal: number;
  callsDelta: number; // % change vs last period
  messagesTotal: number;
  messagesDelta: number;
  bookingsTotal: number;
  bookingsDelta: number;
  aiResolutionRate: number; // 0-1
  aiResolutionDelta: number;
}

export interface AnalyticsTrend {
  date: string;
  calls: number;
  messages: number;
  bookings: number;
}

export interface ChannelBreakdown {
  channel: 'voice' | 'whatsapp' | 'website_chat';
  total: number;
  resolved: number;
  escalated: number;
  avgDurationSeconds?: number;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';

export interface Plan {
  tier: PlanTier;
  name: string;
  priceMonthly: number; // cents
  voiceMinutesIncluded: number;
  whatsappConversationsIncluded: number;
  phoneNumbersIncluded: number;
  features: string[];
}

export interface Usage {
  voiceMinutesUsed: number;
  voiceMinutesIncluded: number;
  whatsappConversationsUsed: number;
  whatsappConversationsIncluded: number;
  phoneNumbersUsed: number;
  phoneNumbersIncluded: number;
}

export interface Invoice {
  id: string;
  amount: number; // cents
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  periodStart: string;
  periodEnd: string;
  pdfUrl?: string;
}

// ─── Team ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'deactivated';
}

// ─── Voice config ─────────────────────────────────────────────────────────────

export type AfterHoursBehavior = 'voicemail' | 'callback_request' | 'route_to_human';
export type ToneStyle = 'professional' | 'friendly' | 'formal' | 'casual';

export interface VoiceConfig {
  serviceId: string;
  greetingScript: string;
  tone: ToneStyle;
  afterHoursBehavior: AfterHoursBehavior;
  escalationNumber?: string;
  phoneNumber?: string;
  areaCode?: string;
  calendarConnected: boolean;
  calendarProvider?: 'google' | 'microsoft';
  businessHours: Record<string, { open: string; close: string; closed?: boolean }>;
  // Advanced
  twilioAccountSid?: string;
  customPrompt?: string;
}

// ─── WhatsApp config ──────────────────────────────────────────────────────────

export type TemplateStatus = 'pending' | 'approved' | 'rejected';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  body: string;
  status: TemplateStatus;
  rejectionReason?: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  submittedAt: string;
}

export interface WhatsAppConfig {
  serviceId: string;
  connected: boolean;
  connectionMethod?: 'facebook_oauth' | 'manual';
  greeting: string;
  tone: ToneStyle;
  handoffKeywords: string[];
  businessHours: Record<string, { open: string; close: string; closed?: boolean }>;
  templates: WhatsAppTemplate[];
  // Advanced manual fields
  wabaId?: string;
  phoneNumberId?: string;
}

// ─── Website config ───────────────────────────────────────────────────────────

export type WebsiteTemplate = 'salon' | 'clinic' | 'restaurant' | 'gym' | 'real_estate' | 'home_services' | 'generic' | 'blank';

export interface WebsiteSection {
  id: string;
  type: 'hero' | 'services' | 'about' | 'gallery' | 'testimonials' | 'contact' | 'booking' | 'faq';
  title?: string;
  content?: string;
  imageUrl?: string;
  enabled: boolean;
  order: number;
}

export interface WebsiteConfig {
  serviceId: string;
  template: WebsiteTemplate;
  sections: WebsiteSection[];
  primaryColor?: string;
  bookingWidgetEnabled: boolean;
  chatWidgetEnabled: boolean;
  subdomain: string;
  customDomain?: string;
  domainVerified?: boolean;
  publishedAt?: string;
  stagingUrl: string;
}

// ─── API error shape ──────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

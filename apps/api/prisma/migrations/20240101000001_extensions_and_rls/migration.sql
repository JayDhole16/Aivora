-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the app.current_org_id setting for RLS
-- This is set per-transaction by the NestJS TenantContextService

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrgMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeBaseEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VoiceAgentConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppointmentService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CallLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Credential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhoneNumber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppBotConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsiteConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsiteVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecretStore" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organization (special - users can see orgs they belong to)
CREATE POLICY org_member_access ON "Organization"
  FOR ALL
  USING (
    id IN (
      SELECT "orgId" FROM "OrgMember" WHERE "userId" = current_setting('app.current_user_id')::uuid
    )
  );

-- RLS Policies for OrgMember
CREATE POLICY org_member_org_isolation ON "OrgMember"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for BusinessProfile
CREATE POLICY business_profile_org_isolation ON "BusinessProfile"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for KnowledgeBaseEntry
CREATE POLICY kb_entry_org_isolation ON "KnowledgeBaseEntry"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Service
CREATE POLICY service_org_isolation ON "Service"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for VoiceAgentConfig
CREATE POLICY voice_agent_config_org_isolation ON "VoiceAgentConfig"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for AppointmentService
CREATE POLICY appointment_service_org_isolation ON "AppointmentService"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Staff
CREATE POLICY staff_org_isolation ON "Staff"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Appointment
CREATE POLICY appointment_org_isolation ON "Appointment"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Conversation
CREATE POLICY conversation_org_isolation ON "Conversation"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Message (via conversation)
CREATE POLICY message_org_isolation ON "Message"
  FOR ALL
  USING (
    "conversationId" IN (
      SELECT id FROM "Conversation" WHERE "orgId" = current_setting('app.current_org_id')::uuid
    )
  );

-- RLS Policies for CallLog
CREATE POLICY call_log_org_isolation ON "CallLog"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Credential
CREATE POLICY credential_org_isolation ON "Credential"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for PhoneNumber
CREATE POLICY phone_number_org_isolation ON "PhoneNumber"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Notification
CREATE POLICY notification_org_isolation ON "Notification"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for Subscription
CREATE POLICY subscription_org_isolation ON "Subscription"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for UsageRecord
CREATE POLICY usage_record_org_isolation ON "UsageRecord"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for AuditLog
CREATE POLICY audit_log_org_isolation ON "AuditLog"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for CalendarConnection
CREATE POLICY calendar_connection_org_isolation ON "CalendarConnection"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for WhatsAppBotConfig
CREATE POLICY whatsapp_bot_config_org_isolation ON "WhatsAppBotConfig"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for WhatsAppTemplate
CREATE POLICY whatsapp_template_org_isolation ON "WhatsAppTemplate"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for WebsiteConfig
CREATE POLICY website_config_org_isolation ON "WebsiteConfig"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- RLS Policies for WebsiteVersion (via websiteConfig)
CREATE POLICY website_version_org_isolation ON "WebsiteVersion"
  FOR ALL
  USING (
    "websiteConfigId" IN (
      SELECT id FROM "WebsiteConfig" WHERE "orgId" = current_setting('app.current_org_id')::uuid
    )
  );

-- RLS Policies for SecretStore
CREATE POLICY secret_store_org_isolation ON "SecretStore"
  FOR ALL
  USING ("orgId" = current_setting('app.current_org_id')::uuid);

-- Create ivfflat index for KnowledgeBaseEntry embeddings (cosine similarity)
-- Note: This index should be created after data is populated for best results
-- CREATE INDEX CONCURRENTLY kb_entry_embedding_idx ON "KnowledgeBaseEntry" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Exclusion constraint for Appointment double-booking prevention
-- This prevents overlapping appointments for the same staff member
ALTER TABLE "Appointment" ADD CONSTRAINT appointment_no_double_booking
  EXCLUDE USING gist (
    "staffId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  ) WHERE (status = 'confirmed');

-- Indexes for performance
CREATE INDEX idx_appointment_staff_time ON "Appointment" ("staffId", "startTime", "endTime") WHERE (status = 'confirmed');
CREATE INDEX idx_conversation_org_customer ON "Conversation" ("orgId", "customerIdentifier");
CREATE INDEX idx_call_log_org_created ON "CallLog" ("orgId", "createdAt" DESC);
CREATE INDEX idx_notification_org_scheduled ON "Notification" ("orgId", "scheduledFor");
CREATE INDEX idx_audit_log_org_created ON "AuditLog" ("orgId", "createdAt" DESC);

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updatedAt triggers to all tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT IN ('_prisma_migrations')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %I;
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t, t, t);
  END LOOP;
END $$;
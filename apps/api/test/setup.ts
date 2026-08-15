import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data in reverse order of dependencies
  const models = [
    'auditLog',
    'usageRecord',
    'subscription',
    'subscriptionPlan',
    'notification',
    'callLog',
    'message',
    'conversation',
    'appointment',
    'staff',
    'appointmentService',
    'voiceAgentConfig',
    'service',
    'knowledgeBaseEntry',
    'businessProfile',
    'credential',
    'phoneNumber',
    'secretStore',
    'calendarConnection',
    'whatsAppTemplate',
    'whatsAppBotConfig',
    'websiteVersion',
    'websiteConfig',
    'templateLibrary',
    'orgMember',
    'organization',
    'user',
  ];

  for (const model of models) {
    try {
      await prisma[model].deleteMany({
        where: {
          OR: [
            { email: { contains: 'test-' } },
            { name: { contains: 'Test ' } },
            { slug: { contains: 'test-' } },
          ],
        },
      });
    } catch (e) {
      // Model might not exist or have different fields
    }
  }
});

global.prisma = prisma;
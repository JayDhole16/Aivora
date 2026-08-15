import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create subscription plans
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'starter-plan' },
    update: {},
    create: {
      id: 'starter-plan',
      name: 'Starter',
      description: 'Perfect for small businesses getting started',
      priceCents: 2900,
      currency: 'USD',
      interval: 'month',
      features: { voiceMinutes: 500, whatsappMessages: 1000, websites: 1 },
      limits: { voiceMinutes: 500, whatsappMessages: 1000, websites: 1 },
      isActive: true,
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'professional-plan' },
    update: {},
    create: {
      id: 'professional-plan',
      name: 'Professional',
      description: 'For growing businesses with higher volume',
      priceCents: 9900,
      currency: 'USD',
      interval: 'month',
      features: { voiceMinutes: 5000, whatsappMessages: 10000, websites: 3 },
      limits: { voiceMinutes: 5000, whatsappMessages: 10000, websites: 3 },
      isActive: true,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'enterprise-plan' },
    update: {},
    create: {
      id: 'enterprise-plan',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      priceCents: 29900,
      currency: 'USD',
      interval: 'month',
      features: { voiceMinutes: 50000, whatsappMessages: 100000, websites: 10 },
      limits: { voiceMinutes: 50000, whatsappMessages: 100000, websites: 10 },
      isActive: true,
    },
  });

  // Create template library entries
  await prisma.templateLibrary.upsert({
    where: { id: 'voice-agent-basic' },
    update: {},
    create: {
      id: 'voice-agent-basic',
      category: 'voice_agent',
      name: 'Basic Voice Receptionist',
      description: 'A simple voice receptionist that greets callers and takes messages',
      content: {
        personaName: 'Alex',
        greetingScript: 'Hello! Thank you for calling. How can I help you today?',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        consentMessage: 'This call may be recorded for quality purposes.',
        maxCallDurationSeconds: 300,
        recordingEnabled: true,
        bargeInEnabled: false,
      },
      isOfficial: true,
    },
  });

  await prisma.templateLibrary.upsert({
    where: { id: 'voice-agent-booking' },
    update: {},
    create: {
      id: 'voice-agent-booking',
      category: 'voice_agent',
      name: 'Appointment Booking Voice Agent',
      description: 'Voice agent that can check availability and book appointments',
      content: {
        personaName: 'Sarah',
        greetingScript: 'Hello! Thanks for calling. I can help you book an appointment or answer questions. How can I assist?',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        consentMessage: 'This call may be recorded for quality purposes.',
        maxCallDurationSeconds: 300,
        recordingEnabled: true,
        bargeInEnabled: true,
      },
      isOfficial: true,
    },
  });

  await prisma.templateLibrary.upsert({
    where: { id: 'kb-entry-return-policy' },
    update: {},
    create: {
      id: 'kb-entry-return-policy',
      category: 'kb_entry',
      name: 'Return Policy Template',
      description: 'Standard return policy for retail businesses',
      content: {
        title: 'Return Policy',
        content: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Refunds will be issued to the original payment method within 5-10 business days.',
        metadata: { category: 'policy', tags: ['returns', 'refunds'] },
      },
      isOfficial: true,
    },
  });

  await prisma.templateLibrary.upsert({
    where: { id: 'kb-entry-hours' },
    update: {},
    create: {
      id: 'kb-entry-hours',
      category: 'kb_entry',
      name: 'Business Hours Template',
      description: 'Standard business hours information',
      content: {
        title: 'Business Hours',
        content: 'We are open Monday through Friday 9am to 6pm, Saturday 10am to 4pm, and closed on Sundays.',
        metadata: { category: 'info', tags: ['hours', 'schedule'] },
      },
      isOfficial: true,
    },
  });

  await prisma.templateLibrary.upsert({
    where: { id: 'appointment-service-consultation' },
    update: {},
    create: {
      id: 'appointment-service-consultation',
      category: 'appointment_service',
      name: 'Consultation Appointment',
      description: 'Standard 30-minute consultation service',
      content: {
        name: 'Consultation',
        description: '30-minute consultation with our expert',
        durationMinutes: 30,
        bufferBeforeMinutes: 5,
        bufferAfterMinutes: 5,
        priceCents: 0,
        currency: 'USD',
      },
      isOfficial: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${3} subscription plans created`);
  console.log(`   - ${5} template library entries created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
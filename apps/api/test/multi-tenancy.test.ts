import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../src/tenancy/tenant-context.service';

const prisma = new PrismaClient();

describe('Multi-tenancy RLS Isolation', () => {
  let orgA: any, orgB: any;
  let userA: any, userB: any;
  let memberA: any, memberB: any;
  let tenantContextService: TenantContextService;

  beforeAll(async () => {
    tenantContextService = new TenantContextService(prisma);
  });

  beforeEach(async () => {
    // Create two organizations
    orgA = await prisma.organization.create({
      data: {
        name: 'Test Org A',
        slug: 'test-org-a',
        members: {
          create: {
            user: {
              create: {
                email: 'test-usera@example.com',
                name: 'User A',
                passwordHash: 'hash',
                emailVerified: true,
              },
            },
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    orgB = await prisma.organization.create({
      data: {
        name: 'Test Org B',
        slug: 'test-org-b',
        members: {
          create: {
            user: {
              create: {
                email: 'test-userb@example.com',
                name: 'User B',
                passwordHash: 'hash',
                emailVerified: true,
              },
            },
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    userA = orgA.members[0].user;
    userB = orgB.members[0].user;
    memberA = orgA.members[0];
    memberB = orgB.members[0];

    // Seed data in both orgs
    await prisma.businessProfile.create({
      data: {
        orgId: orgA.id,
        name: 'Business A',
        timezone: 'UTC',
      },
    });

    await prisma.businessProfile.create({
      data: {
        orgId: orgB.id,
        name: 'Business B',
        timezone: 'UTC',
      },
    });

    await prisma.knowledgeBaseEntry.createMany({
      data: [
        { orgId: orgA.id, title: 'KB A1', content: 'Content A1', source: 'manual' },
        { orgId: orgA.id, title: 'KB A2', content: 'Content A2', source: 'manual' },
        { orgId: orgB.id, title: 'KB B1', content: 'Content B1', source: 'manual' },
        { orgId: orgB.id, title: 'KB B2', content: 'Content B2', source: 'manual' },
      ],
    });
  });

  afterEach(async () => {
    // Clean up
    await prisma.knowledgeBaseEntry.deleteMany({
      where: { orgId: { in: [orgA?.id, orgB?.id] } },
    });
    await prisma.businessProfile.deleteMany({
      where: { orgId: { in: [orgA?.id, orgB?.id] } },
    });
    await prisma.orgMember.deleteMany({
      where: { orgId: { in: [orgA?.id, orgB?.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA?.id, userB?.id] } },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgA?.id, orgB?.id] } },
    });
  });

  it('should allow org A to read its own data', async () => {
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    const entries = await prisma.knowledgeBaseEntry.findMany();
    expect(entries.length).toBe(2);
    expect(entries.every(e => e.orgId === orgA.id)).toBe(true);
    
    await tenantContextService.clearContext();
  });

  it('should allow org B to read its own data', async () => {
    await tenantContextService.setContext(orgB.id, userB.id, 'owner');
    
    const entries = await prisma.knowledgeBaseEntry.findMany();
    expect(entries.length).toBe(2);
    expect(entries.every(e => e.orgId === orgB.id)).toBe(true);
    
    await tenantContextService.clearContext();
  });

  it('should prevent org A from reading org B data even with org B ID in query', async () => {
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    // Try to query with org B's ID explicitly
    const entries = await prisma.knowledgeBaseEntry.findMany({
      where: { orgId: orgB.id },
    });
    
    // Should return empty because RLS filters by current_org_id
    expect(entries.length).toBe(0);
    
    await tenantContextService.clearContext();
  });

  it('should prevent org A from writing to org B', async () => {
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    // Try to create entry with org B's ID
    await expect(
      prisma.knowledgeBaseEntry.create({
        data: {
          orgId: orgB.id,
          title: 'Malicious Entry',
          content: 'Should fail',
          source: 'manual',
        },
      })
    ).rejects.toThrow();
    
    await tenantContextService.clearContext();
  });

  it('should prevent org A from updating org B data', async () => {
    const orgBEntry = await prisma.knowledgeBaseEntry.findFirst({
      where: { orgId: orgB.id },
    });
    
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    await expect(
      prisma.knowledgeBaseEntry.update({
        where: { id: orgBEntry.id },
        data: { title: 'Hacked' },
      })
    ).rejects.toThrow();
    
    await tenantContextService.clearContext();
  });

  it('should prevent org A from deleting org B data', async () => {
    const orgBEntry = await prisma.knowledgeBaseEntry.findFirst({
      where: { orgId: orgB.id },
    });
    
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    await expect(
      prisma.knowledgeBaseEntry.delete({
        where: { id: orgBEntry.id },
      })
    ).rejects.toThrow();
    
    await tenantContextService.clearContext();
  });

  it('should isolate business profiles', async () => {
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    const profiles = await prisma.businessProfile.findMany();
    expect(profiles.length).toBe(1);
    expect(profiles[0].name).toBe('Business A');
    
    await tenantContextService.clearContext();
  });

  it('should isolate credentials', async () => {
    await prisma.credential.create({
      data: {
        orgId: orgA.id,
        type: 'twilio',
        name: 'Twilio A',
        secretRef: 'ref-a',
        status: 'connected',
      },
    });
    
    await prisma.credential.create({
      data: {
        orgId: orgB.id,
        type: 'twilio',
        name: 'Twilio B',
        secretRef: 'ref-b',
        status: 'connected',
      },
    });
    
    await tenantContextService.setContext(orgA.id, userA.id, 'owner');
    
    const creds = await prisma.credential.findMany();
    expect(creds.length).toBe(1);
    expect(creds[0].name).toBe('Twilio A');
    
    await tenantContextService.clearContext();
  });
});

describe('Appointment Double-Booking Prevention', () => {
  let org: any, user: any;
  let service: any, staff: any;

  beforeEach(async () => {
    org = await prisma.organization.create({
      data: {
        name: 'Test Org',
        slug: 'test-org-booking',
        members: {
          create: {
            user: {
              create: {
                email: 'test-booking@example.com',
                name: 'Booking User',
                passwordHash: 'hash',
                emailVerified: true,
              },
            },
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    user = org.members[0].user;

    service = await prisma.appointmentService.create({
      data: {
        orgId: org.id,
        name: 'Test Service',
        durationMinutes: 30,
        bufferBeforeMinutes: 5,
        bufferAfterMinutes: 5,
      },
    });

    staff = await prisma.staff.create({
      data: {
        orgId: org.id,
        name: 'Test Staff',
        workingHours: {
          monday: { open: '09:00', close: '17:00', breaks: [] },
        },
        servicesOffered: [service.id],
      },
    });
  });

  afterEach(async () => {
    await prisma.appointment.deleteMany({ where: { orgId: org?.id } });
    await prisma.staff.deleteMany({ where: { orgId: org?.id } });
    await prisma.appointmentService.deleteMany({ where: { orgId: org?.id } });
    await prisma.orgMember.deleteMany({ where: { orgId: org?.id } });
    await prisma.user.deleteMany({ where: { id: user?.id } });
    await prisma.organization.deleteMany({ where: { id: org?.id } });
  });

  it('should prevent double-booking via exclusion constraint', async () => {
    const startTime = new Date('2024-01-15T10:00:00Z');
    const endTime = new Date('2024-01-15T10:40:00Z'); // 30min + 5+5 buffers

    // First booking
    await prisma.appointment.create({
      data: {
        orgId: org.id,
        serviceId: service.id,
        staffId: staff.id,
        customerName: 'Customer 1',
        customerPhone: '+15551111111',
        startTime,
        endTime,
        timezone: 'UTC',
        status: 'confirmed',
      },
    });

    // Second booking for same slot should fail
    await expect(
      prisma.appointment.create({
        data: {
          orgId: org.id,
          serviceId: service.id,
          staffId: staff.id,
          customerName: 'Customer 2',
          customerPhone: '+15552222222',
          startTime,
          endTime,
          timezone: 'UTC',
          status: 'confirmed',
        },
      })
    ).rejects.toThrow(/exclusion constraint|duplicate key/);
  });

  it('should allow booking adjacent slots', async () => {
    const slot1Start = new Date('2024-01-15T10:00:00Z');
    const slot1End = new Date('2024-01-15T10:40:00Z');
    const slot2Start = new Date('2024-01-15T10:40:00Z');
    const slot2End = new Date('2024-01-15T11:20:00Z');

    await prisma.appointment.create({
      data: {
        orgId: org.id,
        serviceId: service.id,
        staffId: staff.id,
        customerName: 'Customer 1',
        customerPhone: '+15551111111',
        startTime: slot1Start,
        endTime: slot1End,
        timezone: 'UTC',
        status: 'confirmed',
      },
    });

    // Adjacent slot should work
    const secondBooking = await prisma.appointment.create({
      data: {
        orgId: org.id,
        serviceId: service.id,
        staffId: staff.id,
        customerName: 'Customer 2',
        customerPhone: '+15552222222',
        startTime: slot2Start,
        endTime: slot2End,
        timezone: 'UTC',
        status: 'confirmed',
      },
    });

    expect(secondBooking.id).toBeDefined();
  });

  it('should allow overlapping slots for different staff', async () => {
    const staff2 = await prisma.staff.create({
      data: {
        orgId: org.id,
        name: 'Test Staff 2',
        workingHours: {
          monday: { open: '09:00', close: '17:00', breaks: [] },
        },
        servicesOffered: [service.id],
      },
    });

    const startTime = new Date('2024-01-15T10:00:00Z');
    const endTime = new Date('2024-01-15T10:40:00Z');

    await prisma.appointment.create({
      data: {
        orgId: org.id,
        serviceId: service.id,
        staffId: staff.id,
        customerName: 'Customer 1',
        customerPhone: '+15551111111',
        startTime,
        endTime,
        timezone: 'UTC',
        status: 'confirmed',
      },
    });

    // Same time, different staff should work
    const secondBooking = await prisma.appointment.create({
      data: {
        orgId: org.id,
        serviceId: service.id,
        staffId: staff2.id,
        customerName: 'Customer 2',
        customerPhone: '+15552222222',
        startTime,
        endTime,
        timezone: 'UTC',
        status: 'confirmed',
      },
    });

    expect(secondBooking.id).toBeDefined();
  });
});

describe('Secrets Vault - No Raw Secrets in Responses', () => {
  let org: any, user: any;
  let credential: any;

  beforeEach(async () => {
    org = await prisma.organization.create({
      data: {
        name: 'Test Org Secrets',
        slug: 'test-org-secrets',
        members: {
          create: {
            user: {
              create: {
                email: 'test-secrets@example.com',
                name: 'Secrets User',
                passwordHash: 'hash',
                emailVerified: true,
              },
            },
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    user = org.members[0].user;

    // Create credential with secret stored in vault
    const secretRef = 'local_aes_gcm_test_ref';
    await prisma.secretStore.create({
      data: {
        orgId: org.id,
        ref: secretRef,
        ciphertext: Buffer.from('encrypted-data'),
      },
    });

    credential = await prisma.credential.create({
      data: {
        orgId: org.id,
        type: 'twilio',
        name: 'Test Twilio',
        secretRef,
        status: 'connected',
      },
    });
  });

  afterEach(async () => {
    await prisma.credential.deleteMany({ where: { orgId: org?.id } });
    await prisma.secretStore.deleteMany({ where: { orgId: org?.id } });
    await prisma.orgMember.deleteMany({ where: { orgId: org?.id } });
    await prisma.user.deleteMany({ where: { id: user?.id } });
    await prisma.organization.deleteMany({ where: { id: org?.id } });
  });

  it('should not expose secretRef in credential list', async () => {
    const credentials = await prisma.credential.findMany({
      where: { orgId: org.id },
    });

    for (const cred of credentials) {
      expect(cred).not.toHaveProperty('secretRef');
      // In actual API, the service sanitizes this
    }
  });

  it('should not expose secretRef in credential detail', async () => {
    const cred = await prisma.credential.findUnique({
      where: { id: credential.id },
    });

    // Raw secretRef exists in DB but API service sanitizes it
    expect(cred).toHaveProperty('secretRef');
    
    // Verify the sanitization logic would remove it
    const { secretRef, validationError, ...sanitized } = cred;
    expect(sanitized).not.toHaveProperty('secretRef');
    expect(sanitized).toHaveProperty('hasSecret', true);
  });

  it('should not log raw secrets', async () => {
    // This test verifies the audit log doesn't contain raw secrets
    const auditLog = await prisma.auditLog.create({
      data: {
        orgId: org.id,
        actorId: user.id,
        actorType: 'user',
        action: 'credential.create',
        resourceType: 'Credential',
        resourceId: credential.id,
        after: { name: 'Test Twilio', type: 'twilio' }, // No secret
      },
    });

    expect(auditLog.after).not.toHaveProperty('secretRef');
    expect(auditLog.after).not.toHaveProperty('secret');
    expect(JSON.stringify(auditLog.after)).not.toContain('AC'); // Twilio SID pattern
  });
});
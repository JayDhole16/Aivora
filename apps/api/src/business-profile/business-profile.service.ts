import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBusinessProfileDto, UpdateBusinessProfileDto } from './dto/business-profile.dto';

@Injectable()
export class BusinessProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateBusinessProfileDto) {
    const existing = await this.prisma.businessProfile.findUnique({ where: { orgId } });
    if (existing) {
      throw new ForbiddenException('Business profile already exists for this organization');
    }

    const profile = await this.prisma.businessProfile.create({
      data: {
        orgId,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        timezone: dto.timezone || 'UTC',
        logoUrl: dto.logoUrl,
        settings: dto.settings || {},
      },
    });

    await this.auditLog(orgId, userId, 'business_profile.create', 'BusinessProfile', profile.id, null, profile);
    return profile;
  }

  async findOne(orgId: string) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { orgId } });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }
    return profile;
  }

  async update(orgId: string, userId: string, dto: UpdateBusinessProfileDto) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { orgId } });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const before = { ...profile };

    const updated = await this.prisma.businessProfile.update({
      where: { orgId },
      data: {
        name: dto.name ?? profile.name,
        description: dto.description ?? profile.description,
        address: dto.address ?? profile.address,
        phone: dto.phone ?? profile.phone,
        email: dto.email ?? profile.email,
        website: dto.website ?? profile.website,
        timezone: dto.timezone ?? profile.timezone,
        logoUrl: dto.logoUrl ?? profile.logoUrl,
        settings: dto.settings ?? profile.settings,
      },
    });

    await this.auditLog(orgId, userId, 'business_profile.update', 'BusinessProfile', updated.id, before, updated);
    return updated;
  }

  async delete(orgId: string, userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { orgId } });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    await this.prisma.businessProfile.delete({ where: { orgId } });
    await this.auditLog(orgId, userId, 'business_profile.delete', 'BusinessProfile', profile.id, profile, null);
    return { message: 'Business profile deleted' };
  }

  private async auditLog(
    orgId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    before: any,
    after: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        orgId,
        actorId: userId,
        actorType: 'user',
        action,
        resourceType,
        resourceId,
        before,
        after,
      },
    });
  }
}
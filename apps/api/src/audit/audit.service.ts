import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, page = 1, limit = 50, filters?: { action?: string; resourceType?: string; actorId?: string }) {
    const where: any = { orgId };
    if (filters?.action) where.action = { contains: filters.action };
    if (filters?.resourceType) where.resourceType = filters.resourceType;
    if (filters?.actorId) where.actorId = filters.actorId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }

  async findOne(orgId: string, id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: { actor: { select: { id: true, email: true, name: true } } },
    });
    if (!log || log.orgId !== orgId) {
      return null;
    }
    return log;
  }
}
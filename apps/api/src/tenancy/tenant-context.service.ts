import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';

export const TENANT_CONTEXT_KEY = 'tenant_context';

export interface TenantContext {
  orgId: string;
  userId: string;
  role: string;
}

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setContext(orgId: string, userId: string, role: string) {
    await this.prisma.$executeRaw`SET LOCAL "app.current_org_id" = ${orgId}::uuid`;
    await this.prisma.$executeRaw`SET LOCAL "app.current_user_id" = ${userId}::uuid`;
  }

  async clearContext() {
    await this.prisma.$executeRaw`RESET "app.current_org_id"`;
    await this.prisma.$executeRaw`RESET "app.current_user_id"`;
  }

  getContext(request: Request): TenantContext | null {
    return (request as any)[TENANT_CONTEXT_KEY] || null;
  }

  setContextOnRequest(request: Request, context: TenantContext) {
    (request as any)[TENANT_CONTEXT_KEY] = context;
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantContextService: TenantContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantContext = this.tenantContextService.getContext(request);

    if (!tenantContext) {
      return false;
    }

    await this.tenantContextService.setContext(tenantContext.orgId, tenantContext.userId, tenantContext.role);
    return true;
  }
}
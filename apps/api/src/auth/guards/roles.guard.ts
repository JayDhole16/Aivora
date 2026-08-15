import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { OrgRole } from '@aivora/shared-types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.orgMembers) {
      throw new ForbiddenException('No organization membership found');
    }

    const currentOrgId = request.headers['x-org-id'] || request.query.orgId;
    if (!currentOrgId) {
      throw new ForbiddenException('Organization ID required');
    }

    const membership = user.orgMembers.find((om: any) => om.orgId === currentOrgId);
    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const hasRole = requiredRoles.includes(membership.role);
    if (!hasRole) {
      throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
    }

    request.tenantContext = {
      orgId: currentOrgId,
      userId: user.id,
      role: membership.role,
    };

    return true;
  }
}
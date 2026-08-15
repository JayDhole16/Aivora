import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs' })
  async findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.auditService.findAll(req.tenantContext.orgId, Number(page), Number(limit), { action, resourceType, actorId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log detail' })
  @ApiParam({ name: 'id', description: 'Audit Log ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.auditService.findOne(req.tenantContext.orgId, id);
  }
}
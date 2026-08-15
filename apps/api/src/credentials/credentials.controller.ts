import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, UpdateCredentialDto, TestCredentialDto } from './dto/credential.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Credentials')
@Controller('credentials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'agent')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credential' })
  async create(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: CreateCredentialDto,
  ) {
    return this.credentialsService.create(req.tenantContext.orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all credentials for the organization' })
  async findAll(@Req() req: any) {
    return this.credentialsService.findAll(req.tenantContext.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a credential by ID' })
  @ApiParam({ name: 'id', description: 'Credential ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.credentialsService.findOne(req.tenantContext.orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a credential' })
  @ApiParam({ name: 'id', description: 'Credential ID' })
  async update(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    return this.credentialsService.update(req.tenantContext.orgId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credential' })
  @ApiParam({ name: 'id', description: 'Credential ID' })
  async delete(@CurrentUser('id') userId: string, @Req() req: any, @Param('id') id: string) {
    return this.credentialsService.delete(req.tenantContext.orgId, userId, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test a credential' })
  @ApiParam({ name: 'id', description: 'Credential ID' })
  async test(@Req() req: any, @Param('id') id: string, @Body() dto: TestCredentialDto) {
    return this.credentialsService.test(req.tenantContext.orgId, id, dto);
  }
}
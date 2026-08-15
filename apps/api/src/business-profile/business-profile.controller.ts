import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { BusinessProfileService } from './business-profile.service';
import { CreateBusinessProfileDto, UpdateBusinessProfileDto } from './dto/business-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Business Profile')
@Controller('business-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create business profile' })
  async create(@CurrentUser('id') userId: string, @Req() req: any, @Body() dto: CreateBusinessProfileDto) {
    return this.businessProfileService.create(req.tenantContext.orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get business profile' })
  async findOne(@Req() req: any) {
    return this.businessProfileService.findOne(req.tenantContext.orgId);
  }

  @Put()
  @ApiOperation({ summary: 'Update business profile' })
  async update(@CurrentUser('id') userId: string, @Req() req: any, @Body() dto: UpdateBusinessProfileDto) {
    return this.businessProfileService.update(req.tenantContext.orgId, userId, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete business profile' })
  async delete(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.businessProfileService.delete(req.tenantContext.orgId, userId);
  }
}
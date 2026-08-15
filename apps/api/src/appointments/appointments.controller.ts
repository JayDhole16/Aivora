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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentServiceDto, UpdateAppointmentServiceDto, CreateStaffDto, UpdateStaffDto, AvailabilityQueryDto, CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'agent')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Services
  @Post('services')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create an appointment service' })
  async createService(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: CreateAppointmentServiceDto,
  ) {
    return this.appointmentsService.createService(req.tenantContext.orgId, userId, dto);
  }

  @Get('services')
  @ApiOperation({ summary: 'List appointment services' })
  async findAllServices(@Req() req: any) {
    return this.appointmentsService.findAllServices(req.tenantContext.orgId);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get an appointment service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async findOneService(@Req() req: any, @Param('id') id: string) {
    return this.appointmentsService.findOneService(req.tenantContext.orgId, id);
  }

  @Put('services/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update an appointment service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async updateService(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentServiceDto,
  ) {
    return this.appointmentsService.updateService(req.tenantContext.orgId, userId, id, dto);
  }

  @Delete('services/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete an appointment service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async deleteService(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.deleteService(req.tenantContext.orgId, userId, id);
  }

  // Staff
  @Post('staff')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create a staff member' })
  async createStaff(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: CreateStaffDto,
  ) {
    return this.appointmentsService.createStaff(req.tenantContext.orgId, userId, dto);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List staff members' })
  async findAllStaff(@Req() req: any) {
    return this.appointmentsService.findAllStaff(req.tenantContext.orgId);
  }

  @Get('staff/:id')
  @ApiOperation({ summary: 'Get a staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  async findOneStaff(@Req() req: any, @Param('id') id: string) {
    return this.appointmentsService.findOneStaff(req.tenantContext.orgId, id);
  }

  @Put('staff/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  async updateStaff(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.appointmentsService.updateStaff(req.tenantContext.orgId, userId, id, dto);
  }

  @Delete('staff/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  async deleteStaff(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.deleteStaff(req.tenantContext.orgId, userId, id);
  }

  // Availability
  @Get('availability')
  @ApiOperation({ summary: 'Get available time slots' })
  async getAvailability(@Req() req: any, @Query() dto: AvailabilityQueryDto) {
    return this.appointmentsService.getAvailability(req.tenantContext.orgId, dto);
  }

  // Appointments
  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  async createAppointment(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(req.tenantContext.orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments' })
  async findAllAppointments(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAllAppointments(req.tenantContext.orgId, Number(page), Number(limit), status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async findOneAppointment(@Req() req: any, @Param('id') id: string) {
    return this.appointmentsService.findOneAppointment(req.tenantContext.orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async updateAppointment(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateAppointment(req.tenantContext.orgId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async cancelAppointment(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.cancelAppointment(req.tenantContext.orgId, userId, id);
  }

  @Post(':id/no-show')
  @Roles('owner', 'admin', 'agent')
  @ApiOperation({ summary: 'Mark appointment as no-show' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async markNoShow(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.markNoShow(req.tenantContext.orgId, userId, id);
  }
}
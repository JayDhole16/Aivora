import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CreateAppointmentServiceDto, UpdateAppointmentServiceDto, CreateStaffDto, UpdateStaffDto, AvailabilityQueryDto, CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  // Appointment Services
  async createService(orgId: string, userId: string, dto: CreateAppointmentServiceDto) {
    const service = await this.prisma.appointmentService.create({
      data: {
        orgId,
        name: dto.name,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        bufferBeforeMinutes: dto.bufferBeforeMinutes || 0,
        bufferAfterMinutes: dto.bufferAfterMinutes || 0,
        priceCents: dto.priceCents,
        currency: dto.currency || 'USD',
      },
    });

    await this.auditLog(orgId, userId, 'appointment_service.create', 'AppointmentService', service.id, null, service);
    return service;
  }

  async findAllServices(orgId: string) {
    return this.prisma.appointmentService.findMany({
      where: { orgId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneService(orgId: string, id: string) {
    const service = await this.prisma.appointmentService.findUnique({ where: { id } });
    if (!service || service.orgId !== orgId) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async updateService(orgId: string, userId: string, id: string, dto: UpdateAppointmentServiceDto) {
    const service = await this.prisma.appointmentService.findUnique({ where: { id } });
    if (!service || service.orgId !== orgId) {
      throw new NotFoundException('Service not found');
    }

    const before = { ...service };
    const updated = await this.prisma.appointmentService.update({
      where: { id },
      data: {
        name: dto.name ?? service.name,
        description: dto.description ?? service.description,
        durationMinutes: dto.durationMinutes ?? service.durationMinutes,
        bufferBeforeMinutes: dto.bufferBeforeMinutes ?? service.bufferBeforeMinutes,
        bufferAfterMinutes: dto.bufferAfterMinutes ?? service.bufferAfterMinutes,
        priceCents: dto.priceCents ?? service.priceCents,
        currency: dto.currency ?? service.currency,
        isActive: dto.isActive ?? service.isActive,
      },
    });

    await this.auditLog(orgId, userId, 'appointment_service.update', 'AppointmentService', id, before, updated);
    return updated;
  }

  async deleteService(orgId: string, userId: string, id: string) {
    const service = await this.prisma.appointmentService.findUnique({ where: { id } });
    if (!service || service.orgId !== orgId) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.appointmentService.delete({ where: { id } });
    await this.auditLog(orgId, userId, 'appointment_service.delete', 'AppointmentService', id, service, null);
    return { message: 'Service deleted' };
  }

  // Staff
  async createStaff(orgId: string, userId: string, dto: CreateStaffDto) {
    const staff = await this.prisma.staff.create({
      data: {
        orgId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        workingHours: dto.workingHours,
        servicesOffered: dto.servicesOffered,
        calendarConnectionId: dto.calendarConnectionId,
      },
    });

    await this.auditLog(orgId, userId, 'staff.create', 'Staff', staff.id, null, staff);
    return staff;
  }

  async findAllStaff(orgId: string) {
    return this.prisma.staff.findMany({
      where: { orgId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneStaff(orgId: string, id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff || staff.orgId !== orgId) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  async updateStaff(orgId: string, userId: string, id: string, dto: UpdateStaffDto) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff || staff.orgId !== orgId) {
      throw new NotFoundException('Staff member not found');
    }

    const before = { ...staff };
    const updated = await this.prisma.staff.update({
      where: { id },
      data: {
        name: dto.name ?? staff.name,
        email: dto.email ?? staff.email,
        phone: dto.phone ?? staff.phone,
        workingHours: dto.workingHours ?? staff.workingHours,
        servicesOffered: dto.servicesOffered ?? staff.servicesOffered,
        calendarConnectionId: dto.calendarConnectionId ?? staff.calendarConnectionId,
        isActive: dto.isActive ?? staff.isActive,
      },
    });

    await this.auditLog(orgId, userId, 'staff.update', 'Staff', id, before, updated);
    return updated;
  }

  async deleteStaff(orgId: string, userId: string, id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff || staff.orgId !== orgId) {
      throw new NotFoundException('Staff member not found');
    }

    await this.prisma.staff.delete({ where: { id } });
    await this.auditLog(orgId, userId, 'staff.delete', 'Staff', id, staff, null);
    return { message: 'Staff member deleted' };
  }

  // Availability
  async getAvailability(orgId: string, dto: AvailabilityQueryDto) {
    const service = await this.prisma.appointmentService.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || service.orgId !== orgId) {
      throw new NotFoundException('Service not found');
    }

    const staffMembers = await this.prisma.staff.findMany({
      where: {
        orgId,
        isActive: true,
        servicesOffered: { has: dto.serviceId },
        ...(dto.staffId ? { id: dto.staffId } : {}),
      },
    });

    if (staffMembers.length === 0) {
      return { slots: [], message: 'No available staff for this service' };
    }

    const date = new Date(dto.date);
    const timezone = dto.timezone || 'UTC';
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }).toLowerCase();

    const slots: { staffId: string; staffName: string; startTime: Date; endTime: Date }[] = [];

    for (const staff of staffMembers) {
      const workingHours = staff.workingHours as Record<string, any>;
      const dayHours = workingHours[dayOfWeek];
      
      if (!dayHours || !dayHours.open || !dayHours.close) continue;

      const [openHour, openMin] = dayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
      
      const dayStart = new Date(date);
      dayStart.setHours(openHour, openMin, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(closeHour, closeMin, 0, 0);

      const breaks = dayHours.breaks || [];
      const totalDuration = service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes;
      const slotDuration = service.durationMinutes;
      const bufferBefore = service.bufferBeforeMinutes;
      const bufferAfter = service.bufferAfterMinutes;

      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          orgId,
          serviceId: dto.serviceId,
          staffId: staff.id,
          status: 'confirmed',
          startTime: { gte: dayStart, lt: dayEnd },
        },
        orderBy: { startTime: 'asc' },
      });

      let currentTime = new Date(dayStart);
      
      while (currentTime.getTime() + totalDuration * 60 * 1000 <= dayEnd.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + totalDuration * 60 * 1000);
        
        const isDuringBreak = breaks.some((breakPeriod: any) => {
          const [breakStartH, breakStartM] = breakPeriod.start.split(':').map(Number);
          const [breakEndH, breakEndM] = breakPeriod.end.split(':').map(Number);
          const breakStart = new Date(date);
          breakStart.setHours(breakStartH, breakStartM, 0, 0);
          const breakEnd = new Date(date);
          breakEnd.setHours(breakEndH, breakEndM, 0, 0);
          return currentTime < breakEnd && slotEnd > breakStart;
        });

        const conflicts = existingAppointments.some((apt) => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          return currentTime < aptEnd && slotEnd > aptStart;
        });

        if (!isDuringBreak && !conflicts) {
          slots.push({
            staffId: staff.id,
            staffName: staff.name,
            startTime: new Date(currentTime.getTime() + bufferBefore * 60 * 1000),
            endTime: new Date(currentTime.getTime() + bufferBefore * 60 * 1000 + slotDuration * 60 * 1000),
          });
        }

        currentTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
      }
    }

    return { slots: slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) };
  }

  // Appointments
  async createAppointment(orgId: string, userId: string, dto: CreateAppointmentDto) {
    const service = await this.prisma.appointmentService.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || service.orgId !== orgId) {
      throw new NotFoundException('Service not found');
    }

    let staffId = dto.staffId;
    if (!staffId) {
      const availableStaff = await this.prisma.staff.findMany({
        where: {
          orgId,
          isActive: true,
          servicesOffered: { has: dto.serviceId },
        },
      });
      if (availableStaff.length === 0) {
        throw new BadRequestException('No staff available for this service');
      }
      staffId = availableStaff[0].id;
    }

    const staff = await this.prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff || staff.orgId !== orgId) {
      throw new NotFoundException('Staff member not found');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + 
      (service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes) * 60 * 1000);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        orgId,
        staffId,
        status: 'confirmed',
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      const nextAvailable = await this.findNextAvailableSlot(orgId, dto.serviceId, staffId, startTime);
      throw new ConflictException({
        message: 'That slot was just taken',
        nextAvailable: nextAvailable ? nextAvailable.toISOString() : null,
      });
    }

    const appointment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({
        data: {
          orgId,
          serviceId: dto.serviceId,
          staffId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          startTime,
          endTime,
          timezone: dto.timezone,
          status: 'confirmed',
          notes: dto.notes,
        },
      });

      await tx.auditLog.create({
        data: {
          orgId,
          actorId: userId,
          actorType: 'user',
          action: 'appointment.create',
          resourceType: 'Appointment',
          resourceId: created.id,
          before: null,
          after: created,
        },
      });

      return created;
    });

    await this.scheduleReminders(appointment);

    return appointment;
  }

  private async findNextAvailableSlot(
    orgId: string,
    serviceId: string,
    staffId: string,
    afterTime: Date,
  ): Promise<Date | null> {
    const service = await this.prisma.appointmentService.findUnique({ where: { id: serviceId } });
    if (!service) return null;

    const staff = await this.prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) return null;

    const workingHours = staff.workingHours as Record<string, any>;
    const dayOfWeek = afterTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = workingHours[dayOfWeek];
    
    if (!dayHours || !dayHours.open || !dayHours.close) return null;

    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const dayEnd = new Date(afterTime);
    dayEnd.setHours(closeHour, closeMin, 0, 0);

    const totalDuration = service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes;
    const slotDuration = service.durationMinutes;
    const bufferBefore = service.bufferBeforeMinutes;

    let currentTime = new Date(Math.max(afterTime.getTime(), Date.now()));
    
    while (currentTime.getTime() + totalDuration * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + totalDuration * 60 * 1000);
      
      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          orgId,
          serviceId,
          staffId,
          status: 'confirmed',
          startTime: { lt: slotEnd },
          endTime: { gt: currentTime },
        },
      });

      if (existingAppointments.length === 0) {
        return new Date(currentTime.getTime() + bufferBefore * 60 * 1000);
      }

      currentTime = new Date(Math.max(...existingAppointments.map(a => new Date(a.endTime).getTime())));
    }

    return null;
  }

  async findAllAppointments(orgId: string, page = 1, limit = 20, status?: string) {
    const where: any = { orgId };
    if (status) where.status = status;
    
    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { service: true, staff: true },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { appointments, total, page, limit };
  }

  async findOneAppointment(orgId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true, staff: true },
    });
    if (!appointment || appointment.orgId !== orgId) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async updateAppointment(orgId: string, userId: string, id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.orgId !== orgId) {
      throw new NotFoundException('Appointment not found');
    }

    const before = { ...appointment };
    const service = await this.prisma.appointmentService.findUnique({ where: { id: dto.serviceId || appointment.serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    let startTime = dto.startTime ? new Date(dto.startTime) : appointment.startTime;
    let endTime = new Date(startTime.getTime() + 
      (service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes) * 60 * 1000);

    const staffId = dto.staffId || appointment.staffId;
    if (staffId && dto.startTime) {
      const conflicting = await this.prisma.appointment.findFirst({
        where: {
          orgId,
          staffId,
          status: 'confirmed',
          id: { not: id },
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: startTime } },
          ],
        },
      });
      if (conflicting) {
        throw new ConflictException('Time slot conflicts with another appointment');
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        serviceId: dto.serviceId ?? appointment.serviceId,
        staffId: dto.staffId ?? appointment.staffId,
        startTime,
        endTime,
        timezone: dto.timezone ?? appointment.timezone,
        status: dto.status ?? appointment.status,
        notes: dto.notes ?? appointment.notes,
      },
    });

    await this.auditLog(orgId, userId, 'appointment.update', 'Appointment', id, before, updated);
    return updated;
  }

  async cancelAppointment(orgId: string, userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.orgId !== orgId) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.auditLog(orgId, userId, 'appointment.cancel', 'Appointment', id, appointment, updated);
    
    await this.notificationQueue.add('appointment-cancelled', {
      orgId,
      appointmentId: id,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
    });

    return updated;
  }

  async markNoShow(orgId: string, userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.orgId !== orgId) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'no_show' },
    });

    await this.auditLog(orgId, userId, 'appointment.no_show', 'Appointment', id, appointment, updated);
    return updated;
  }

  private async scheduleReminders(appointment: any) {
    const service = await this.prisma.appointmentService.findUnique({ where: { id: appointment.serviceId } });
    if (!service) return;

    const appointmentTime = new Date(appointment.startTime);
    const reminder24h = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder1h = new Date(appointmentTime.getTime() - 60 * 60 * 1000);

    if (reminder24h > new Date()) {
      await this.notificationQueue.add('appointment-reminder-24h', {
        orgId: appointment.orgId,
        appointmentId: appointment.id,
        customerPhone: appointment.customerPhone,
        customerEmail: appointment.customerEmail,
      }, { delay: reminder24h.getTime() - Date.now() });
    }

    if (reminder1h > new Date()) {
      await this.notificationQueue.add('appointment-reminder-1h', {
        orgId: appointment.orgId,
        appointmentId: appointment.id,
        customerPhone: appointment.customerPhone,
        customerEmail: appointment.customerEmail,
      }, { delay: reminder1h.getTime() - Date.now() });
    }
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
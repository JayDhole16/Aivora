import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Processor('notifications')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(`Processing notification job: ${job.name}`, job.data);

    try {
      switch (job.name) {
        case 'appointment-reminder-24h':
          await this.sendAppointmentReminder(job.data, '24h');
          break;
        case 'appointment-reminder-1h':
          await this.sendAppointmentReminder(job.data, '1h');
          break;
        case 'appointment-confirmed':
          await this.sendAppointmentConfirmed(job.data);
          break;
        case 'appointment-cancelled':
          await this.sendAppointmentCancelled(job.data);
          break;
        case 'appointment-rescheduled':
          await this.sendAppointmentRescheduled(job.data);
          break;
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process notification job ${job.name}`, error);
      throw error;
    }
  }

  private async sendAppointmentReminder(data: any, timing: '24h' | '1h') {
    const { orgId, appointmentId, customerPhone, customerEmail } = data;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment) {
      this.logger.warn(`Appointment ${appointmentId} not found`);
      return;
    }

    if (appointment.status !== 'confirmed') {
      this.logger.log(`Appointment ${appointmentId} is not confirmed, skipping reminder`);
      return;
    }

    const notificationType = timing === '24h' 
      ? 'appointment_reminder_24h' 
      : 'appointment_reminder_1h';

    const timeText = timing === '24h' ? '24 hours' : '1 hour';

    await this.prisma.notification.create({
      data: {
        orgId,
        type: notificationType,
        channel: 'in_app',
        recipient: customerPhone,
        subject: `Appointment Reminder - ${timeText}`,
        body: `Your appointment for ${appointment.service.name} is scheduled in ${timeText}.`,
        status: 'pending',
        relatedEntityType: 'appointment',
        relatedEntityId: appointmentId,
        scheduledFor: new Date(),
      },
    });

    // In production, this would send SMS/Email/WhatsApp
    this.logger.log(`Reminder ${timing} queued for appointment ${appointmentId}`);
  }

  private async sendAppointmentConfirmed(data: any) {
    const { orgId, appointmentId, customerPhone, customerEmail } = data;

    await this.prisma.notification.create({
      data: {
        orgId,
        type: 'appointment_confirmed',
        channel: 'in_app',
        recipient: customerPhone,
        subject: 'Appointment Confirmed',
        body: 'Your appointment has been confirmed.',
        status: 'pending',
        relatedEntityType: 'appointment',
        relatedEntityId: appointmentId,
        scheduledFor: new Date(),
      },
    });
  }

  private async sendAppointmentCancelled(data: any) {
    const { orgId, appointmentId, customerPhone, customerEmail } = data;

    await this.prisma.notification.create({
      data: {
        orgId,
        type: 'appointment_cancelled',
        channel: 'in_app',
        recipient: customerPhone,
        subject: 'Appointment Cancelled',
        body: 'Your appointment has been cancelled.',
        status: 'pending',
        relatedEntityType: 'appointment',
        relatedEntityId: appointmentId,
        scheduledFor: new Date(),
      },
    });
  }

  private async sendAppointmentRescheduled(data: any) {
    const { orgId, appointmentId, customerPhone, customerEmail } = data;

    await this.prisma.notification.create({
      data: {
        orgId,
        type: 'appointment_rescheduled',
        channel: 'in_app',
        recipient: customerPhone,
        subject: 'Appointment Rescheduled',
        body: 'Your appointment has been rescheduled.',
        status: 'pending',
        relatedEntityType: 'appointment',
        relatedEntityId: appointmentId,
        scheduledFor: new Date(),
      },
    });
  }
}
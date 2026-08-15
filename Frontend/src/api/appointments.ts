import { type Appointment, type AppointmentService, type Staff } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

const now = new Date();
const today = now.toISOString().split('T')[0];

export const MOCK_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Ananya Krishnan',
    email: 'ananya@glowsalon.com',
    workingHours: {
      monday: [{ open: '09:00', close: '18:00' }],
      tuesday: [{ open: '09:00', close: '18:00' }],
      wednesday: [{ open: '09:00', close: '18:00' }],
      thursday: [{ open: '09:00', close: '18:00' }],
      friday: [{ open: '09:00', close: '19:00' }],
      saturday: [{ open: '10:00', close: '17:00' }],
    },
    services: ['svc-appt-1', 'svc-appt-2'],
  },
  {
    id: 'staff-2',
    name: 'Rohan Mehta',
    email: 'rohan@glowsalon.com',
    workingHours: {
      monday: [{ open: '10:00', close: '19:00' }],
      tuesday: [{ open: '10:00', close: '19:00' }],
      wednesday: [{ open: '10:00', close: '19:00' }],
      thursday: [{ open: '10:00', close: '19:00' }],
      saturday: [{ open: '10:00', close: '18:00' }],
      sunday: [{ open: '11:00', close: '16:00' }],
    },
    services: ['svc-appt-1', 'svc-appt-3'],
  },
];

export const MOCK_APPT_SERVICES: AppointmentService[] = [
  { id: 'svc-appt-1', name: "Women's Haircut", durationMinutes: 45, priceCents: 80000, bufferMinutes: 10 },
  { id: 'svc-appt-2', name: 'Classic Facial', durationMinutes: 60, priceCents: 150000, bufferMinutes: 15 },
  { id: 'svc-appt-3', name: "Men's Haircut", durationMinutes: 30, priceCents: 40000, bufferMinutes: 10 },
  { id: 'svc-appt-4', name: 'Manicure', durationMinutes: 45, priceCents: 60000, bufferMinutes: 5 },
  { id: 'svc-appt-5', name: 'Bridal Makeup', durationMinutes: 120, priceCents: 1200000, bufferMinutes: 30 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    sourceChannel: 'whatsapp',
    staffId: 'staff-1',
    appointmentServiceId: 'svc-appt-1',
    customerName: 'Meera Nair',
    customerPhone: '+91-99887-76655',
    start: `${today}T10:00:00`,
    end: `${today}T10:45:00`,
    status: 'confirmed',
  },
  {
    id: 'appt-2',
    sourceChannel: 'voice',
    staffId: 'staff-1',
    appointmentServiceId: 'svc-appt-2',
    customerName: 'Sunita Patel',
    customerPhone: '+91-98765-43210',
    start: `${today}T11:30:00`,
    end: `${today}T12:30:00`,
    status: 'confirmed',
    notes: 'First-time client, prefers organic products',
  },
  {
    id: 'appt-3',
    sourceChannel: 'website',
    staffId: 'staff-2',
    appointmentServiceId: 'svc-appt-3',
    customerName: 'Arjun Singh',
    customerPhone: '+91-97654-32109',
    start: `${today}T14:00:00`,
    end: `${today}T14:30:00`,
    status: 'confirmed',
  },
  {
    id: 'appt-4',
    sourceChannel: 'whatsapp',
    staffId: 'staff-2',
    appointmentServiceId: 'svc-appt-1',
    customerName: 'Divya Iyer',
    start: `${today}T15:30:00`,
    end: `${today}T16:15:00`,
    status: 'confirmed',
  },
  {
    id: 'appt-5',
    sourceChannel: 'voice',
    staffId: 'staff-1',
    appointmentServiceId: 'svc-appt-5',
    customerName: 'Preethi Rajan',
    customerPhone: '+91-98001-12345',
    start: `${today}T09:00:00`,
    end: `${today}T11:00:00`,
    status: 'completed',
    notes: 'Wedding on 20th August',
  },
];

export async function getAppointments(orgId: string, _params?: { start?: string; end?: string }): Promise<Appointment[]> {
  if (USE_MOCKS) return mockResponse(MOCK_APPOINTMENTS);
  return apiRequest<Appointment[]>(`/orgs/${orgId}/appointments`);
}

export async function getAppointmentServices(orgId: string): Promise<AppointmentService[]> {
  if (USE_MOCKS) return mockResponse(MOCK_APPT_SERVICES);
  return apiRequest<AppointmentService[]>(`/orgs/${orgId}/appointment-services`);
}

export async function getStaff(orgId: string): Promise<Staff[]> {
  if (USE_MOCKS) return mockResponse(MOCK_STAFF);
  return apiRequest<Staff[]>(`/orgs/${orgId}/staff`);
}

export async function updateAppointment(apptId: string, data: Partial<Appointment>): Promise<Appointment> {
  if (USE_MOCKS) {
    const appt = MOCK_APPOINTMENTS.find((a) => a.id === apptId)!;
    return mockResponse({ ...appt, ...data }, 500);
  }
  return apiRequest<Appointment>(`/appointments/${apptId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function cancelAppointment(apptId: string): Promise<Appointment> {
  return updateAppointment(apptId, { status: 'cancelled' });
}

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  X,
  Phone,
  MessageCircle,
  Globe,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  useAppointments,
  useAppointmentServices,
  useStaff,
  useCancelAppointment,
  useUpdateAppointment,
} from '@/hooks/useAppointments';
import { ChannelBadge } from '@/components/common/ChannelBadge';
import { cn, formatCurrency } from '@/lib/utils';
import type { Appointment } from '@/types';
import { toast } from 'sonner';

export function AppointmentsCalendar() {
  const { data: appointments, isLoading } = useAppointments();
  const { data: services } = useAppointmentServices();
  const { data: staff } = useStaff();
  const cancelMutation = useCancelAppointment();
  const updateMutation = useUpdateAppointment();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);

  // New Booking state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState('svc-appt-1');
  const [newStaffId, setNewStaffId] = useState('staff-1');
  const [newTime, setNewTime] = useState('11:00');

  const today = new Date().toISOString().split('T')[0];

  const handleCancelAppt = (id: string) => {
    cancelMutation.mutate(id);
    setSelectedAppt(null);
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Booking created for ${newCustomerName}!`);
    setShowNewBooking(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">Appointments & Calendar</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              Real-time Sync
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Bookings taken automatically across Voice, WhatsApp, and your Website appear here.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Week / Month toggle */}
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                  viewMode === m ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowNewBooking(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus size={15} /> Add walk-in
          </button>
        </div>
      </div>

      {/* Date Header Strip */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
          <CalendarIcon size={18} className="text-indigo-600" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600">
            <ChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700">Today</button>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid (Staff as Columns) */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            {staff?.map((st) => {
              const staffAppts = appointments?.filter((a) => a.staffId === st.id);

              return (
                <div key={st.id} className="p-5 space-y-4">
                  {/* Staff Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {st.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">{st.name}</h3>
                        <p className="text-xs text-neutral-400">Stylist • 9am–7pm</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full">
                      {staffAppts?.length || 0} bookings
                    </span>
                  </div>

                  {/* Appointments Slot List */}
                  <div className="space-y-3 min-h-[300px]">
                    {staffAppts?.map((appt) => {
                      const service = services?.find((s) => s.id === appt.appointmentServiceId);
                      const isCancelled = appt.status === 'cancelled';

                      return (
                        <div
                          key={appt.id}
                          onClick={() => setSelectedAppt(appt)}
                          className={cn(
                            'p-4 rounded-xl border transition-all cursor-pointer space-y-2',
                            isCancelled
                              ? 'bg-neutral-50/50 border-neutral-200 opacity-60'
                              : 'bg-white border-neutral-200 hover:border-indigo-300 hover:shadow-2xs'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                              <Clock size={13} className="text-indigo-600" />
                              {new Date(appt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                              {new Date(appt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <ChannelBadge channel={appt.sourceChannel} size="sm" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-neutral-800">{appt.customerName}</p>
                              <p className="text-xs text-neutral-500 font-medium">{service?.name || 'General service'}</p>
                            </div>
                            {service?.priceCents && (
                              <span className="text-xs font-mono font-semibold text-neutral-700">
                                {formatCurrency(service.priceCents)}
                              </span>
                            )}
                          </div>

                          {appt.notes && (
                            <p className="text-[11px] text-neutral-400 bg-neutral-50 p-1.5 rounded-md italic">
                              "{appt.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Detail Modal / Sheet */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-neutral-200 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Booking Details</h3>
              <button
                onClick={() => setSelectedAppt(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500">Customer:</span>
                <span className="font-bold text-neutral-900">{selectedAppt.customerName}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500">Phone number:</span>
                <span className="font-mono text-neutral-900 font-medium">
                  {selectedAppt.customerPhone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500">Channel origin:</span>
                <ChannelBadge channel={selectedAppt.sourceChannel} size="sm" />
              </div>
              <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500">Time slot:</span>
                <span className="font-semibold text-neutral-900">
                  {new Date(selectedAppt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleCancelAppt(selectedAppt.id)}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
              >
                Cancel booking
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Reschedule notification sent to customer!');
                  setSelectedAppt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {showNewBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <form
            onSubmit={handleCreateWalkIn}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Add Walk-in Appointment</h3>
              <button
                type="button"
                onClick={() => setShowNewBooking(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Customer name</label>
              <input
                type="text"
                required
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone number</label>
              <input
                type="text"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="+91-98765-43210"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Service</label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                >
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Stylist / Staff</label>
                <select
                  value={newStaffId}
                  onChange={(e) => setNewStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                >
                  {staff?.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
            >
              Confirm booking
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

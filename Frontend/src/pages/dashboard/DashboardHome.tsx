import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Globe,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useServices, useUpdateServiceStatus, useCreateService } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { StatusChip } from '@/components/common/StatusChip';
import { ChannelBadge } from '@/components/common/ChannelBadge';
import { PreviewDrawer } from '@/components/preview/PreviewDrawer';
import { cn, CHANNEL_COLORS } from '@/lib/utils';
import type { Service, ServiceType } from '@/types';
import { toast } from 'sonner';

export function DashboardHome() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { data: services, isLoading } = useServices();
  const updateStatusMutation = useUpdateServiceStatus();
  const createServiceMutation = useCreateService();

  const [previewService, setPreviewService] = useState<{ open: boolean; type: ServiceType }>({
    open: false,
    type: 'voice',
  });

  const getServiceRoute = (type: ServiceType) => {
    switch (type) {
      case 'voice':
        return '/dashboard/voice';
      case 'whatsapp':
        return '/dashboard/whatsapp';
      case 'website':
        return '/dashboard/website';
    }
  };

  const handleGoLive = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    updateStatusMutation.mutate({ serviceId: service.id, status: 'live' });
  };

  const handleAddService = (type: ServiceType) => {
    createServiceMutation.mutate(
      {
        type,
        name: type === 'voice' ? 'Voice Receptionist' : type === 'whatsapp' ? 'WhatsApp Assistant' : 'Business Website',
      },
      {
        onSuccess: (newSvc) => {
          toast.success(`Added ${newSvc.name}! Opening builder.`);
          navigate(getServiceRoute(newSvc.type));
        },
      }
    );
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium backdrop-blur-xs mb-2">
            <Sparkles size={13} className="text-indigo-300" />
            <span>AI Reception & Growth Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Business Owner'} 👋
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            {user?.org?.name || 'Your business'} is active across your channels. Manage your phone receptionist, WhatsApp
            bot, and website from one central hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewService({ open: true, type: 'voice' })}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-xs transition-colors border border-white/10 flex items-center gap-2"
          >
            <Phone size={14} /> Test AI voice
          </button>
          <button
            onClick={() => setPreviewService({ open: true, type: 'whatsapp' })}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <MessageCircle size={14} /> Test WhatsApp
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Your AI Services</h2>
            <p className="text-xs text-neutral-500">Every channel shares your one knowledge base and calendar</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => {
              const route = getServiceRoute(service.type);
              const isLive = service.status === 'live';
              const isDraft = service.status === 'draft';

              return (
                <div
                  key={service.id}
                  onClick={() => navigate(route)}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
                >
                  {/* Top line accent */}
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-1.5',
                      service.type === 'voice' && 'bg-indigo-600',
                      service.type === 'whatsapp' && 'bg-emerald-600',
                      service.type === 'website' && 'bg-sky-600'
                    )}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <ChannelBadge channel={service.type} size="md" />
                      <StatusChip status={service.status} />
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      {service.name}
                    </h3>

                    {/* Channel Description & Stats */}
                    <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
                      {service.type === 'voice' && (
                        <>
                          <div className="text-xs">
                            <span className="text-neutral-500 block">Calls handled</span>
                            <span className="text-base font-bold text-neutral-900">
                              {service.callsThisWeek || 47} calls
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp size={13} /> +12%
                          </span>
                        </>
                      )}

                      {service.type === 'whatsapp' && (
                        <>
                          <div className="text-xs">
                            <span className="text-neutral-500 block">Messages replied</span>
                            <span className="text-base font-bold text-neutral-900">
                              {service.messagesThisWeek || 124} chats
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-neutral-500">Live 24/7</span>
                        </>
                      )}

                      {service.type === 'website' && (
                        <>
                          <div className="text-xs">
                            <span className="text-neutral-500 block">Site visitors</span>
                            <span className="text-base font-bold text-neutral-900">
                              {service.visitsThisWeek || 0} visits
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-neutral-400">Ready to launch</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewService({ open: true, type: service.type });
                      }}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                    >
                      Test <ChevronRight size={13} />
                    </button>

                    {isDraft ? (
                      <button
                        type="button"
                        onClick={(e) => handleGoLive(e, service)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-2xs"
                      >
                        Go live
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:underline">
                        Configure <ArrowRight size={13} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Always visible Add Service Card */}
            <div className="bg-neutral-50/60 rounded-2xl border-2 border-dashed border-neutral-200 p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-2xs border border-neutral-200 flex items-center justify-center text-indigo-600 mb-3">
                <Plus size={22} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Add another service</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                Expand your automated reach with more virtual assistants.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddService('whatsapp')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                >
                  + WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleAddService('voice')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                >
                  + Voice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Operations Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/dashboard/inbox')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Unified Inbox</p>
              <p className="text-sm font-bold text-neutral-900">1 call needs human follow-up</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-neutral-400" />
        </div>

        <div
          onClick={() => navigate('/dashboard/appointments')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Today's Schedule</p>
              <p className="text-sm font-bold text-neutral-900">4 appointments booked</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-neutral-400" />
        </div>

        <div
          onClick={() => navigate('/dashboard/connections')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Connections Status</p>
              <p className="text-sm font-bold text-neutral-900">Twilio & Meta connected</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-neutral-400" />
        </div>
      </div>

      {/* Persistent preview drawer */}
      <PreviewDrawer
        isOpen={previewService.open}
        onClose={() => setPreviewService({ open: false, type: 'voice' })}
        serviceType={previewService.type}
      />
    </div>
  );
}

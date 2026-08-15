import React, { useState } from 'react';
import {
  Phone,
  Bot,
  Clock,
  Calendar as CalendarIcon,
  PhoneForwarded,
  Sliders,
  Play,
  CheckCircle2,
  Search,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from 'lucide-react';
import { useVoiceConfig, useUpdateVoiceConfig, usePhoneNumberSearch, useProvisionPhoneNumber } from '@/hooks/useServices';
import { StatusChip } from '@/components/common/StatusChip';
import { PreviewDrawer } from '@/components/preview/PreviewDrawer';
import { cn, DAYS_OF_WEEK, DAY_LABELS } from '@/lib/utils';
import type { ToneStyle, AfterHoursBehavior } from '@/types';
import { toast } from 'sonner';

type Tab = 'persona' | 'hours' | 'phone' | 'calendar' | 'escalation' | 'advanced';

export function VoiceBuilder() {
  const serviceId = 'svc-voice-1';
  const { data: config, isLoading } = useVoiceConfig(serviceId);
  const updateMutation = useUpdateVoiceConfig(serviceId);
  const searchPhoneMutation = usePhoneNumberSearch();
  const provisionPhoneMutation = useProvisionPhoneNumber(serviceId);

  const [activeTab, setActiveTab] = useState<Tab>('persona');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAdvancedTwilio, setShowAdvancedTwilio] = useState(false);

  // Local form state
  const [greeting, setGreeting] = useState('');
  const [tone, setTone] = useState<ToneStyle>('friendly');
  const [afterHours, setAfterHours] = useState<AfterHoursBehavior>('voicemail');
  const [escalationNumber, setEscalationNumber] = useState('');
  const [areaCodeInput, setAreaCodeInput] = useState('415');
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed?: boolean }>>({});

  // Sync state when config loads
  React.useEffect(() => {
    if (config) {
      setGreeting(config.greetingScript);
      setTone(config.tone);
      setAfterHours(config.afterHoursBehavior);
      setEscalationNumber(config.escalationNumber || '+91-98765-43210');
      setSelectedNumber(config.phoneNumber || '+1-415-555-0147');
      setTwilioSid(config.twilioAccountSid || '');
      setCustomPrompt(config.customPrompt || '');
      setBusinessHours(config.businessHours || {});
    }
  }, [config]);

  const handleSave = () => {
    updateMutation.mutate({
      greetingScript: greeting,
      tone,
      afterHoursBehavior: afterHours,
      escalationNumber,
      phoneNumber: selectedNumber,
      twilioAccountSid: twilioSid,
      customPrompt,
      businessHours,
    });
  };

  const handleSearchNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaCodeInput) return;
    const nums = await searchPhoneMutation.mutateAsync(areaCodeInput);
    setAvailableNumbers(nums);
  };

  const handleProvision = async (num: string) => {
    await provisionPhoneMutation.mutateAsync(num);
    setSelectedNumber(num);
  };

  const tabs = [
    { id: 'persona', label: 'Persona & script', icon: Bot },
    { id: 'hours', label: 'Business hours', icon: Clock },
    { id: 'phone', label: 'Phone number', icon: Phone },
    { id: 'calendar', label: 'Calendar link', icon: CalendarIcon },
    { id: 'escalation', label: 'Call transfer', icon: PhoneForwarded },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Test Call Trigger */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Phone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">AI Voice Receptionist</h1>
              <StatusChip status="live" />
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Active phone number: <span className="font-mono font-medium text-neutral-800">{selectedNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs flex items-center gap-2 transition-colors border border-indigo-200"
          >
            <Play size={14} className="fill-indigo-700" /> Test call
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                'flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              )}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-2xs">
        {/* 1. PERSONA & SCRIPT */}
        {activeTab === 'persona' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Opening greeting script</label>
              <p className="text-xs text-neutral-500 mb-2">
                What the AI receptionist says as soon as a customer calls.
              </p>
              <textarea
                rows={4}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed"
                placeholder="Hi there! You've reached Glow Salon & Spa..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Speaking tone & personality</label>
              <p className="text-xs text-neutral-500 mb-3">Adjust how formal or warm your AI voice sounds.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'friendly', label: 'Warm & friendly' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'formal', label: 'Formal' },
                  { id: 'casual', label: 'Casual & upbeat' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id as ToneStyle)}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-medium transition-all text-center',
                      tone === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">After-hours call behavior</label>
              <p className="text-xs text-neutral-500 mb-3">When a customer calls outside your working hours.</p>
              <div className="space-y-2">
                {[
                  {
                    id: 'voicemail',
                    title: 'Take a voicemail & send audio transcript to email',
                    desc: 'AI takes caller name & message, immediately visible in your Inbox.',
                  },
                  {
                    id: 'callback_request',
                    title: 'Offer automatic callback booking',
                    desc: 'AI schedules a callback slot for your team the next morning.',
                  },
                  {
                    id: 'route_to_human',
                    title: 'Forward call to manager emergency phone',
                    desc: 'Immediately patches call through to your escalation phone number.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setAfterHours(item.id as AfterHoursBehavior)}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                      afterHours === item.id
                        ? 'border-indigo-600 bg-indigo-50/40 text-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="afterHours"
                      checked={afterHours === item.id}
                      onChange={() => setAfterHours(item.id as AfterHoursBehavior)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">{item.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. BUSINESS HOURS */}
        {activeTab === 'hours' && (
          <div className="max-w-2xl space-y-4 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Weekly operating hours</h3>
              <p className="text-xs text-neutral-500">The AI uses this to quote available appointment slots.</p>
            </div>

            <div className="space-y-2.5">
              {DAYS_OF_WEEK.map((day) => {
                const dayConfig = businessHours[day] || { open: '09:00', close: '19:00', closed: false };
                return (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50/50"
                  >
                    <span className="text-xs font-semibold text-neutral-800 w-28">{DAY_LABELS[day]}</span>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!dayConfig.closed}
                          onChange={(e) => {
                            setBusinessHours((prev) => ({
                              ...prev,
                              [day]: { ...dayConfig, closed: !e.target.checked },
                            }));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Open</span>
                      </label>

                      {!dayConfig.closed ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dayConfig.open}
                            onChange={(e) =>
                              setBusinessHours((prev) => ({
                                ...prev,
                                [day]: { ...dayConfig, open: e.target.value },
                              }))
                            }
                            className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs outline-none"
                          />
                          <span className="text-neutral-400 text-xs">to</span>
                          <input
                            type="time"
                            value={dayConfig.close}
                            onChange={(e) =>
                              setBusinessHours((prev) => ({
                                ...prev,
                                [day]: { ...dayConfig, close: e.target.value },
                              }))
                            }
                            className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium italic px-4">Closed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PHONE NUMBER */}
        {activeTab === 'phone' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Provision dedicated phone number</h3>
              <p className="text-xs text-neutral-500">
                Get a local number in your area code. Calls are forwarded instantly to your AI receptionist.
              </p>
            </div>

            <form onSubmit={handleSearchNumbers} className="flex gap-2">
              <input
                type="text"
                value={areaCodeInput}
                onChange={(e) => setAreaCodeInput(e.target.value)}
                placeholder="Enter 3-digit area code (e.g. 415)"
                className="w-48 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={searchPhoneMutation.isPending}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium flex items-center gap-2"
              >
                {searchPhoneMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Search numbers
              </button>
            </form>

            {/* Numbers search result */}
            {availableNumbers.length > 0 && (
              <div className="border border-neutral-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-neutral-700">Available numbers:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableNumbers.map((num) => (
                    <div
                      key={num}
                      className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs"
                    >
                      <span className="font-mono font-medium text-neutral-900">{num}</span>
                      <button
                        type="button"
                        onClick={() => handleProvision(num)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-[11px] hover:bg-indigo-700"
                      >
                        Select & activate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Active Number */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-900">Current assigned phone number</p>
                  <p className="font-mono text-sm font-bold text-emerald-950">{selectedNumber}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                Live & routing
              </span>
            </div>

            {/* BYO Twilio - Gated under Advanced */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setShowAdvancedTwilio(!showAdvancedTwilio)}
                className="flex items-center justify-between w-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 py-1"
              >
                <span>Advanced: Connect your own Twilio account</span>
                {showAdvancedTwilio ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showAdvancedTwilio && (
                <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Account SID</label>
                    <input
                      type="text"
                      value={twilioSid}
                      onChange={(e) => setTwilioSid(e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Auth Token</label>
                    <input
                      type="password"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Calendar synchronization</h3>
              <p className="text-xs text-neutral-500">
                When the voice assistant books an appointment, it reserves the slot directly on your calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-900">Google Calendar</span>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">Synced to priya@glowsalon.com</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Calendar connection refreshed!')}
                  className="mt-4 text-xs font-semibold text-emerald-700 hover:underline text-left"
                >
                  Reconnect account
                </button>
              </div>

              <div className="border border-neutral-200 bg-neutral-50/50 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-900">Microsoft Outlook</span>
                    <span className="text-[11px] font-semibold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">
                      Not linked
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">Sync with Office 365 or Outlook</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Microsoft OAuth popup launched.')}
                  className="mt-4 text-xs font-semibold text-indigo-600 hover:underline text-left"
                >
                  Connect Microsoft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. ESCALATION */}
        {activeTab === 'escalation' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Human escalation & transfer phone</h3>
              <p className="text-xs text-neutral-500">
                If a caller explicitly asks to speak with a human or has an emergency inquiry, the AI receptionist transfers
                the call to this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Manager phone number</label>
              <input
                type="text"
                value={escalationNumber}
                onChange={(e) => setEscalationNumber(e.target.value)}
                placeholder="+91-98765-43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-neutral-400 mt-1">Include country code (e.g. +1 for US, +91 for India).</p>
            </div>
          </div>
        )}

        {/* 6. ADVANCED */}
        {activeTab === 'advanced' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">System prompt & voice model tuning</h3>
              <p className="text-xs text-neutral-500">
                For power users: supplement the AI prompt with custom instructions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Custom system instructions</label>
              <textarea
                rows={5}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Always mention that haircuts include a complimentary scalp massage."
                className="w-full p-3 text-xs font-mono rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Persistent preview drawer */}
      <PreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        serviceType="voice"
      />
    </div>
  );
}

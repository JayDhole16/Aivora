import React, { useState } from 'react';
import {
  MessageCircle,
  Link as LinkIcon,
  Bot,
  FileText,
  Smartphone,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Loader2,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useWhatsAppConfig, useUpdateWhatsAppConfig, useSubmitWhatsAppTemplate } from '@/hooks/useServices';
import { StatusChip } from '@/components/common/StatusChip';
import { PreviewDrawer } from '@/components/preview/PreviewDrawer';
import { cn } from '@/lib/utils';
import type { ToneStyle, WhatsAppTemplate } from '@/types';
import { toast } from 'sonner';

type Tab = 'connection' | 'behavior' | 'templates' | 'preview';

export function WhatsAppBuilder() {
  const serviceId = 'svc-wa-1';
  const { data: config, isLoading } = useWhatsAppConfig(serviceId);
  const updateMutation = useUpdateWhatsAppConfig(serviceId);
  const submitTemplateMutation = useSubmitWhatsAppTemplate(serviceId);

  const [activeTab, setActiveTab] = useState<Tab>('connection');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  // Form states
  const [greeting, setGreeting] = useState('');
  const [tone, setTone] = useState<ToneStyle>('friendly');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [appSecret, setAppSecret] = useState('');

  // New template modal/form state
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY');

  // Interactive simulated preview state for the Preview tab
  const [simMessages, setSimMessages] = useState<{ id: string; sender: 'ai' | 'customer'; text: string; time: string }[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! 👋 Welcome to Glow Salon & Spa. I'm your WhatsApp booking assistant. How can I help you today?",
      time: '10:30 AM',
    },
  ]);
  const [simInput, setSimInput] = useState('');
  const [simTyping, setSimTyping] = useState(false);

  React.useEffect(() => {
    if (config) {
      setGreeting(config.greeting);
      setTone(config.tone);
      setKeywordsInput(config.handoffKeywords?.join(', ') || 'human, agent, real person, manager');
      setWabaId(config.wabaId || '');
      setPhoneNumberId(config.phoneNumberId || '');
    }
  }, [config]);

  const handleSave = () => {
    updateMutation.mutate({
      greeting,
      tone,
      handoffKeywords: keywordsInput.split(',').map((s) => s.trim()).filter(Boolean),
      wabaId,
      phoneNumberId,
    });
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !templateBody) return;

    await submitTemplateMutation.mutateAsync({
      name: templateName.toLowerCase().replace(/\s+/g, '_'),
      body: templateBody,
      category: templateCategory,
    });

    setTemplateName('');
    setTemplateBody('');
    setShowNewTemplate(false);
  };

  const handleSimSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userText = simInput;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSimMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'customer', text: userText, time: nowTime }]);
    setSimInput('');
    setSimTyping(true);

    setTimeout(() => {
      let reply = "I can help with that! We have open slots for Haircuts and Facials today.";
      if (userText.toLowerCase().includes('book')) {
        reply = "Sure thing! Which stylist would you prefer? Ananya or Rohan?";
      } else if (userText.toLowerCase().includes('human') || userText.toLowerCase().includes('agent')) {
        reply = "I am transferring this chat to a team member now. Please hold tight! 🔔";
      }

      setSimMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: reply, time: nowTime }]);
      setSimTyping(false);
    }, 1000);
  };

  const toggleHelp = (key: string) => {
    setExpandedHelp((prev) => (prev === key ? null : key));
  };

  const tabs = [
    { id: 'connection', label: 'Connection', icon: LinkIcon },
    { id: 'behavior', label: 'Bot behavior', icon: Bot },
    { id: 'templates', label: 'Outbound templates', icon: FileText },
    { id: 'preview', label: 'Simulated WhatsApp', icon: Smartphone },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageCircle size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">WhatsApp Assistant</h1>
              <StatusChip status="testing" />
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Automated customer messaging and booking via WhatsApp</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs flex items-center gap-2 transition-colors border border-emerald-200"
          >
            <Play size={14} className="fill-emerald-700" /> Test bot
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>
        </div>
      </div>

      {/* Tabs */}
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
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              )}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-2xs">
        {/* 1. CONNECTION */}
        {activeTab === 'connection' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Connect your WhatsApp Business number</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Log into Facebook with one click to connect your official WhatsApp business profile.
              </p>
            </div>

            {/* One click Facebook Embedded Signup */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Official Meta Cloud API</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Authorize your WhatsApp Business number securely with Meta. No manual keys required.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Connected with Facebook WhatsApp Business account!')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <CheckCircle2 size={16} /> Connect with Facebook
              </button>
            </div>

            {/* Advanced Manual Fallback */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setShowManualFields(!showManualFields)}
                className="flex items-center justify-between w-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 py-1"
              >
                <span>Advanced: Manual connection settings</span>
                {showManualFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showManualFields && (
                <div className="mt-4 space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                  {/* WABA ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-700">WhatsApp Business Account ID (WABA ID)</label>
                      <button
                        type="button"
                        onClick={() => toggleHelp('waba')}
                        className="text-xs text-neutral-400 hover:text-indigo-600 flex items-center gap-0.5"
                      >
                        <HelpCircle size={13} /> Where to find?
                      </button>
                    </div>
                    {expandedHelp === 'waba' && (
                      <div className="p-2.5 mb-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 space-y-1">
                        <p className="font-semibold">Finding your WABA ID:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-indigo-800">
                          <li>Go to Meta Business Suite &gt; Settings &gt; WhatsApp Accounts.</li>
                          <li>Select your account and copy the Account ID number shown at the top.</li>
                        </ol>
                      </div>
                    )}
                    <input
                      type="text"
                      value={wabaId}
                      onChange={(e) => setWabaId(e.target.value)}
                      placeholder="e.g. 109283746591029"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>

                  {/* Phone Number ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-700">Phone Number ID</label>
                      <button
                        type="button"
                        onClick={() => toggleHelp('phoneId')}
                        className="text-xs text-neutral-400 hover:text-indigo-600 flex items-center gap-0.5"
                      >
                        <HelpCircle size={13} /> Where to find?
                      </button>
                    </div>
                    {expandedHelp === 'phoneId' && (
                      <div className="p-2.5 mb-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 space-y-1">
                        <p className="font-semibold">Finding your Phone Number ID:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-indigo-800">
                          <li>In WhatsApp Business Suite, click on your verified phone number.</li>
                          <li>Copy the 15-digit Phone Number ID.</li>
                        </ol>
                      </div>
                    )}
                    <input
                      type="text"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="e.g. 104928374619028"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>

                  {/* Access Token */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">System user access key</label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. BOT BEHAVIOR */}
        {activeTab === 'behavior' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in-50 duration-150">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Welcome greeting message</label>
              <p className="text-xs text-neutral-500 mb-2">Sent when a customer starts a new chat.</p>
              <textarea
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                placeholder="Hi! 👋 Welcome to Glow Salon..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Chatbot tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { id: 'friendly', label: 'Warm & friendly' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'casual', label: 'Casual with emojis' },
                  { id: 'formal', label: 'Formal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id as ToneStyle)}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-medium transition-all text-center',
                      tone === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Human handoff trigger words</label>
              <p className="text-xs text-neutral-500 mb-2">
                Comma-separated words that automatically escalate the chat to your Unified Inbox.
              </p>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="human, manager, person, talk to staff"
              />
            </div>
          </div>
        )}

        {/* 3. TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Proactive message templates</h3>
                <p className="text-xs text-neutral-500">
                  Pre-approved WhatsApp templates for booking reminders and confirmations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTemplate(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={15} /> New template
              </button>
            </div>

            {/* Compose Template Form */}
            {showNewTemplate && (
              <form
                onSubmit={handleCreateTemplate}
                className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 animate-in fade-in-50 duration-150"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-neutral-900">Compose new WhatsApp template</h4>
                  <button
                    type="button"
                    onClick={() => setShowNewTemplate(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Template name</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. appointment_reminder_v2"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Category</label>
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                    >
                      <option value="UTILITY">Utility (Reminders, Confirmations)</option>
                      <option value="MARKETING">Marketing (Offers, Announcements)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Message body (Use {'{{1}}'}, {'{{2}}'} for customer name or date)
                  </label>
                  <textarea
                    rows={3}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Hi {{1}}, your appointment at Glow Salon is scheduled for {{2}} at {{3}}."
                    className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitTemplateMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700"
                >
                  {submitTemplateMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Submit to Meta for approval
                </button>
              </form>
            )}

            {/* Template list */}
            <div className="space-y-3">
              {config?.templates?.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900">{tpl.name}</span>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        {tpl.category}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1',
                        tpl.status === 'approved' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        tpl.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-200',
                        tpl.status === 'rejected' && 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {tpl.status === 'approved' && 'Approved'}
                      {tpl.status === 'pending' && 'Pending Meta review'}
                      {tpl.status === 'rejected' && 'Needs correction'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 leading-relaxed font-sans">
                    {tpl.body}
                  </p>

                  {tpl.status === 'rejected' && tpl.rejectionReason && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Meta rejection note:</span>
                        <span>{tpl.rejectionReason}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PREVIEW (Embedded full simulated WhatsApp screen) */}
        {activeTab === 'preview' && (
          <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-neutral-300 shadow-md bg-[#e5ddd5] animate-in fade-in-50 duration-150">
            {/* Top Bar */}
            <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                  GS
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Glow Salon & Spa</p>
                  <p className="text-[11px] text-emerald-200">Online • AI Receptionist</p>
                </div>
              </div>
            </div>

            {/* Chat conversation */}
            <div className="h-80 p-4 overflow-y-auto space-y-3">
              <div className="text-center my-1">
                <span className="bg-[#dcf8c6]/90 text-[#4a4a4a] text-[10px] px-2.5 py-1 rounded-md shadow-2xs font-medium">
                  WhatsApp Sandbox Preview
                </span>
              </div>

              {simMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex flex-col', msg.sender === 'customer' ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-3.5 py-2 rounded-lg text-xs leading-relaxed shadow-2xs',
                      msg.sender === 'customer' ? 'bg-[#dcf8c6] text-neutral-900 rounded-tr-none' : 'bg-white text-neutral-900 rounded-tl-none'
                    )}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-neutral-400 block text-right mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}

              {simTyping && (
                <div className="flex items-start">
                  <div className="bg-white px-3 py-2 rounded-lg text-xs text-neutral-400 flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* Simulated input */}
            <form onSubmit={handleSimSend} className="p-3 bg-[#f0f0f0] flex items-center gap-2 border-t border-neutral-300">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Type a message as a customer..."
                className="flex-1 bg-white text-xs px-4 py-2.5 rounded-full border border-neutral-300 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-emerald-800 transition-colors shadow-2xs"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Drawer */}
      <PreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        serviceType="whatsapp"
      />
    </div>
  );
}

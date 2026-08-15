import React, { useState } from 'react';
import {
  Building2,
  BookOpen,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useKnowledgeBase,
  useCreateKBEntry,
  useUpdateKBEntry,
  useDeleteKBEntry,
  useUploadKBDocument,
} from '@/hooks/useKnowledgeBase';
import { cn, VERTICAL_LABELS } from '@/lib/utils';
import type { KnowledgeBaseEntry } from '@/types';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'knowledge' | 'notifications';

export function SettingsPage() {
  const { data: user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Knowledge base state
  const { data: kbEntries, isLoading: kbLoading } = useKnowledgeBase();
  const createKBMutation = useCreateKBEntry();
  const updateKBMutation = useUpdateKBEntry();
  const deleteKBMutation = useDeleteKBEntry();
  const uploadDocMutation = useUploadKBDocument();

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryType, setEntryType] = useState<KnowledgeBaseEntry['type']>('faq');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Business profile form
  const [businessName, setBusinessName] = useState(user?.org?.name || 'Glow Salon & Spa');
  const [address, setAddress] = useState(user?.org?.address || '42 MG Road, Bengaluru');
  const [timezone, setTimezone] = useState(user?.org?.timezone || 'Asia/Kolkata');

  // Notification preferences
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifEscalations, setNotifEscalations] = useState(true);
  const [notifDailyDigest, setNotifDailyDigest] = useState(true);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle || !entryContent) return;

    if (editingId) {
      await updateKBMutation.mutateAsync({
        id: editingId,
        data: { title: entryTitle, content: entryContent, type: entryType },
      });
      setEditingId(null);
    } else {
      await createKBMutation.mutateAsync({
        type: entryType,
        title: entryTitle,
        content: entryContent,
        source: 'manual',
      });
    }

    setEntryTitle('');
    setEntryContent('');
    setShowAddEntry(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDocMutation.mutateAsync(file);
      toast.success('Document uploaded and auto-parsed into knowledge entries!');
    } catch {
      toast.error('Failed to parse file.');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Workspace Settings</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your business profile, AI training data, and team alert preferences.
        </p>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex border-b border-neutral-200 gap-2">
        {[
          { id: 'profile', label: 'Business Profile', icon: Building2 },
          { id: 'knowledge', label: 'Knowledge Base & FAQs', icon: BookOpen },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 max-w-2xl space-y-5 shadow-2xs">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Physical address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Default timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => toast.success('Business profile updated!')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5"
          >
            <Save size={14} /> Save profile
          </button>
        </div>
      )}

      {/* 2. KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Shared AI Knowledge Base</h2>
              <p className="text-xs text-neutral-500">
                Every service (Phone Receptionist, WhatsApp, Website) draws answers from these entries.
              </p>
            </div>

            <div className="flex gap-2">
              <label className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                <Upload size={14} /> Upload doc / price list
              </label>

              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEntryTitle('');
                  setEntryContent('');
                  setShowAddEntry(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={14} /> Add new entry
              </button>
            </div>
          </div>

          {/* Add / Edit Entry Modal */}
          {showAddEntry && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveEntry}
                className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900">
                    {editingId ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddEntry(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Entry category</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
                  >
                    <option value="faq">FAQ (Question & Answer)</option>
                    <option value="service">Service & Pricing</option>
                    <option value="policy">Policy / Cancellation</option>
                    <option value="hours">Business Hours</option>
                    <option value="custom">Custom Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Title or Question</label>
                  <input
                    type="text"
                    required
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="e.g. What is your refund policy?"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Content or Answer</label>
                  <textarea
                    rows={4}
                    required
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    placeholder="e.g. Refunds are granted within 48 hours of service..."
                    className="w-full p-3 text-xs border border-neutral-300 rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                >
                  Save to Knowledge Base
                </button>
              </form>
            </div>
          )}

          {/* Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbEntries?.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                      {entry.type}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Source: {entry.source.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 text-xs">{entry.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1 whitespace-pre-line leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(entry.id);
                      setEntryTitle(entry.title);
                      setEntryContent(entry.content);
                      setEntryType(entry.type);
                      setShowAddEntry(true);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700"
                    aria-label="Edit entry"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteKBMutation.mutate(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 max-w-2xl space-y-5 shadow-2xs">
          <h3 className="text-sm font-bold text-neutral-900">Alert Channels & Preferences</h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">New appointment notifications</span>
                <span className="text-xs text-neutral-500">Receive an SMS and email alert for every new booking.</span>
              </div>
              <input
                type="checkbox"
                checked={notifBookings}
                onChange={(e) => setNotifBookings(e.target.checked)}
                className="rounded text-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">AI escalation urgent alerts</span>
                <span className="text-xs text-neutral-500">
                  Immediate WhatsApp ping when a customer requests a human takeover.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifEscalations}
                onChange={(e) => setNotifEscalations(e.target.checked)}
                className="rounded text-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Daily morning summary digest</span>
                <span className="text-xs text-neutral-500">
                  Email briefing at 8 AM with today's scheduled appointments and missed calls.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifDailyDigest}
                onChange={(e) => setNotifDailyDigest(e.target.checked)}
                className="rounded text-indigo-600"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Notification preferences saved!')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
          >
            Save preferences
          </button>
        </div>
      )}
    </div>
  );
}

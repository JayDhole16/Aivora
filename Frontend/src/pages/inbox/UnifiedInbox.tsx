import React, { useState } from 'react';
import {
  Inbox,
  Phone,
  MessageCircle,
  Globe,
  UserCheck,
  Send,
  User,
  Bot,
  AlertCircle,
  Clock,
  Search,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useConversations, useMessages, useTakeOver, useSendMessage } from '@/hooks/useConversations';
import { ChannelBadge } from '@/components/common/ChannelBadge';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types';

export function UnifiedInbox() {
  const { data: conversations, isLoading } = useConversations();
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'voice' | 'whatsapp' | 'website_chat'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  const { data: messages, isLoading: messagesLoading } = useMessages(selectedConvId);
  const takeOverMutation = useTakeOver();
  const sendMessageMutation = useSendMessage(selectedConvId);

  const filteredConversations = conversations?.filter((c) => {
    const matchesChannel = selectedChannel === 'all' || c.channel === selectedChannel;
    const matchesSearch =
      (c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      c.customerIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesChannel && matchesSearch;
  });

  const activeConversation = conversations?.find((c) => c.id === selectedConvId);

  const handleTakeOver = () => {
    takeOverMutation.mutate(selectedConvId);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessageMutation.mutate(replyText);
    setReplyText('');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
      {/* LEFT COLUMN: Channel Tabs & Conversation List */}
      <div className="w-full md:w-96 border-r border-neutral-200 flex flex-col flex-shrink-0 bg-neutral-50/50">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-neutral-900">Unified Inbox</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              Live Feed
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Channel Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'voice', label: 'Calls' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'website_chat', label: 'Web Chat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChannel(tab.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  selectedChannel === tab.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={20} className="animate-spin text-neutral-400" />
            </div>
          ) : filteredConversations?.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">No conversations match your filter.</div>
          ) : (
            filteredConversations?.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const isEscalated = conv.status === 'escalated';

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-colors flex flex-col gap-1.5',
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-neutral-100/60 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChannelBadge channel={conv.channel} size="sm" showLabel={false} />
                      <span className="text-xs font-bold text-neutral-900">
                        {conv.customerName || conv.customerIdentifier}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(conv.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-1">{conv.summary || 'Customer inquiry'}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400">{conv.customerIdentifier}</span>
                    {isEscalated ? (
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle size={10} /> Human needed
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        AI Handled
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Transcript & Interaction Pane */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
        {activeConversation ? (
          <>
            {/* Top Detail Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs">
                  {activeConversation.customerName
                    ? activeConversation.customerName.slice(0, 2).toUpperCase()
                    : 'CU'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-neutral-900">
                      {activeConversation.customerName || activeConversation.customerIdentifier}
                    </h2>
                    <ChannelBadge channel={activeConversation.channel} size="sm" />
                  </div>
                  <p className="text-xs text-neutral-500 font-mono">{activeConversation.customerIdentifier}</p>
                </div>
              </div>

              {/* Take Over Button */}
              <div>
                {activeConversation.status === 'escalated' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                    <UserCheck size={14} /> You are handling this live
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleTakeOver}
                    disabled={takeOverMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <UserCheck size={14} /> Take over from AI
                  </button>
                )}
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-50/30">
              {messagesLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-neutral-400" />
                </div>
              ) : (
                messages?.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai';
                  const isAgent = msg.sender === 'agent';

                  return (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col', isCustomer ? 'items-start' : 'items-end')}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-neutral-400 font-medium">
                        {isCustomer ? (
                          <>
                            <User size={12} /> Customer
                          </>
                        ) : isAi ? (
                          <>
                            <Bot size={12} className="text-indigo-600" /> Aivora AI
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} className="text-emerald-600" /> Human Agent
                          </>
                        )}
                        <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={cn(
                          'max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs',
                          isCustomer
                            ? 'bg-white text-neutral-900 border border-neutral-200 rounded-tl-none'
                            : isAi
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-emerald-600 text-white rounded-tr-none'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-200 bg-white flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message or answer to customer directly..."
                className="flex-1 px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Send size={13} /> Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
            Select a conversation on the left to view transcript.
          </div>
        )}
      </div>
    </div>
  );
}

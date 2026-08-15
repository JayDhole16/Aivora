import React, { useState } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  MessageCircle,
  Send,
  Globe,
  ExternalLink,
  Bot,
  User,
  Volume2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/types';
import { toast } from 'sonner';

interface PreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
  serviceTitle?: string;
}

export function PreviewDrawer({ isOpen, onClose, serviceType, serviceTitle }: PreviewDrawerProps) {
  // Voice test call state
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: "Hi there! You've reached Glow Salon & Spa. I'm your AI assistant. How can I help you today?",
    },
  ]);

  // WhatsApp simulation state
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'ai' | 'customer'; text: string; time: string }[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! 👋 Welcome to Glow Salon & Spa. I can help you check our prices, see open appointment times, or answer questions. What's on your mind?",
      time: '10:30 AM',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Timer for voice call
  React.useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleStartCall = () => {
    setCallState('calling');
    setTimeout(() => {
      setCallState('connected');
    }, 1500);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'customer', text: userText, time: nowTime },
    ]);
    setInputMessage('');
    setIsTyping(true);

    // Simulated bot answer
    setTimeout(() => {
      let botReply = "I can definitely help with that! We offer full salon services from 9 AM to 7 PM.";
      if (userText.toLowerCase().includes('book') || userText.toLowerCase().includes('appointment')) {
        botReply = "I'd be happy to book you in! We have slots open today at 2:30 PM and 4:00 PM with Ananya. Would either of those work?";
      } else if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        botReply = "Our haircuts start at $45 for women and $30 for men. Facials are $65. Would you like our full price list?";
      }

      setChatMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: botReply, time: nowTime },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-neutral-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
        <div className="flex items-center gap-2">
          {serviceType === 'voice' && <Phone size={18} className="text-indigo-600" />}
          {serviceType === 'whatsapp' && <MessageCircle size={18} className="text-emerald-600" />}
          {serviceType === 'website' && <Globe size={18} className="text-sky-600" />}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Live preview & test</h3>
            <p className="text-xs text-neutral-500">Test sandbox — no customer calls/costs</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          aria-label="Close preview"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content based on service */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
        {/* VOICE PREVIEW */}
        {serviceType === 'voice' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                <Bot size={36} />
              </div>
              <h4 className="font-semibold text-neutral-900 text-base">AI Voice Receptionist</h4>
              <p className="text-xs text-neutral-500 mt-0.5">Simulated phone test call</p>

              {callState === 'connected' && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Call in progress ({Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')})
                </div>
              )}
              {callState === 'calling' && (
                <p className="mt-3 text-xs text-indigo-600 font-medium animate-pulse">Dialing virtual assistant...</p>
              )}
            </div>

            {/* Call transcript bubble */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex-1 my-3 overflow-y-auto space-y-3">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Live Transcript</span>
              {voiceMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                    AI
                  </div>
                  <p className="bg-white p-2.5 rounded-xl border border-neutral-200 text-neutral-800 leading-relaxed shadow-2xs">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Dialpad / Call actions */}
            <div className="pt-3 border-t border-neutral-100">
              {callState === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <PhoneCall size={18} /> Start test call
                </button>
              )}

              {callState === 'connected' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                      'flex-1 py-3 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-colors',
                      isMuted ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                    )}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />} {isMuted ? 'Unmute' : 'Mute mic'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneOff size={16} /> End call
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WHATSAPP PREVIEW */}
        {serviceType === 'whatsapp' && (
          <div className="flex-1 flex flex-col justify-between -mx-5 -my-5 bg-[#e5ddd5] min-h-[500px]">
            {/* WA Header */}
            <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold">
                AV
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">Glow Salon & Spa</p>
                <p className="text-[11px] text-emerald-200">Aivora verified bot • online</p>
              </div>
            </div>

            {/* WA Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              <div className="text-center my-2">
                <span className="bg-[#dcf8c6]/80 text-[#4a4a4a] text-[10px] px-2.5 py-1 rounded-md shadow-2xs font-medium">
                  Messages are end-to-end simulated
                </span>
              </div>

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex flex-col', msg.sender === 'customer' ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-[82%] px-3 py-1.5 rounded-lg text-xs leading-relaxed shadow-2xs relative',
                      msg.sender === 'customer' ? 'bg-[#dcf8c6] text-neutral-900 rounded-tr-none' : 'bg-white text-neutral-900 rounded-tl-none'
                    )}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-neutral-400 block text-right mt-0.5">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white px-3 py-2 rounded-lg text-xs text-neutral-400 flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* WA Input */}
            <form onSubmit={handleSendMessage} className="p-2 bg-[#f0f0f0] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message as a customer..."
                className="flex-1 bg-white text-xs px-3.5 py-2 rounded-full border border-neutral-300 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="h-8 w-8 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-emerald-800 transition-colors"
                aria-label="Send WhatsApp message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* WEBSITE PREVIEW */}
        {serviceType === 'website' && (
          <div className="flex-1 flex flex-col justify-between text-center py-8 space-y-6">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Globe size={32} />
              </div>
              <h4 className="font-semibold text-neutral-900 text-base">Staging Website Preview</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Aivora automatically generates a high-fidelity staging instance for your website.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Staging URL:</span>
                <span className="font-mono text-indigo-600 font-medium">preview--glow-salon.aivora.site</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Booking widget:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer chat:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>

            <a
              href="https://preview--glow-salon.aivora.site"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.preventDefault();
                toast.success('Opening live staging environment in a new tab!');
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition-all shadow-sm"
            >
              Open staging link <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

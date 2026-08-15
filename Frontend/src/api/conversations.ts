import { type Conversation, type Message } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    channel: 'whatsapp',
    status: 'resolved',
    resolutionType: 'ai_resolved',
    customerIdentifier: '+91-99887-76655',
    customerName: 'Meera Nair',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 3400000).toISOString(),
    summary: 'Booked women\'s haircut for today at 10am',
  },
  {
    id: 'conv-2',
    channel: 'voice',
    status: 'escalated',
    resolutionType: undefined,
    customerIdentifier: '+91-98765-43210',
    customerName: 'Sunita Patel',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessageAt: new Date(Date.now() - 7000000).toISOString(),
    summary: 'Asked about bridal packages, requested human agent',
  },
  {
    id: 'conv-3',
    channel: 'website_chat',
    status: 'active',
    customerIdentifier: 'visitor-abc123',
    customerName: 'Unknown visitor',
    startedAt: new Date(Date.now() - 300000).toISOString(),
    lastMessageAt: new Date(Date.now() - 120000).toISOString(),
    summary: 'Asking about nail services pricing',
  },
  {
    id: 'conv-4',
    channel: 'whatsapp',
    status: 'resolved',
    resolutionType: 'ai_resolved',
    customerIdentifier: '+91-87654-32101',
    customerName: 'Kavitha Rao',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessageAt: new Date(Date.now() - 86200000).toISOString(),
    summary: 'Rescheduled appointment from Monday to Friday',
  },
  {
    id: 'conv-5',
    channel: 'voice',
    status: 'resolved',
    resolutionType: 'ai_resolved',
    customerIdentifier: '+91-97001-23456',
    customerName: 'Deepak Kumar',
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    lastMessageAt: new Date(Date.now() - 172600000).toISOString(),
    summary: 'Inquiry about men\'s grooming packages',
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', conversationId: 'conv-1', sender: 'customer', content: 'Hi, I want to book a haircut', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', conversationId: 'conv-1', sender: 'ai', content: "Hi Meera! 👋 I'd love to help you book a haircut. We have slots available today — what time works best for you?", createdAt: new Date(Date.now() - 3590000).toISOString() },
    { id: 'm3', conversationId: 'conv-1', sender: 'customer', content: '10am please', createdAt: new Date(Date.now() - 3580000).toISOString() },
    { id: 'm4', conversationId: 'conv-1', sender: 'ai', content: 'Perfect! I\'ve booked you in for a Women\'s Haircut with Ananya at 10:00am today. You\'ll receive a confirmation shortly. See you at Glow Salon! 💇‍♀️', createdAt: new Date(Date.now() - 3570000).toISOString() },
  ],
  'conv-2': [
    { id: 'm5', conversationId: 'conv-2', sender: 'customer', content: 'I need info about bridal packages', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm6', conversationId: 'conv-2', sender: 'ai', content: 'Our bridal package includes full makeup, hair styling, and nail service starting from ₹15,000. Would you like to know more details or book a consultation?', createdAt: new Date(Date.now() - 7190000).toISOString() },
    { id: 'm7', conversationId: 'conv-2', sender: 'customer', content: 'I want to speak with someone', createdAt: new Date(Date.now() - 7180000).toISOString() },
    { id: 'm8', conversationId: 'conv-2', sender: 'ai', content: "Of course! I'm connecting you with our team now. Please hold.", createdAt: new Date(Date.now() - 7170000).toISOString() },
  ],
  'conv-3': [
    { id: 'm9', conversationId: 'conv-3', sender: 'customer', content: 'How much is a manicure?', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'm10', conversationId: 'conv-3', sender: 'ai', content: 'Our manicure starts at ₹600 and includes nail shaping, cuticle care, and polish. We also offer gel nails for ₹1,200 which last 2–3 weeks. Would you like to book?', createdAt: new Date(Date.now() - 290000).toISOString() },
    { id: 'm11', conversationId: 'conv-3', sender: 'customer', content: 'What about pedicure?', createdAt: new Date(Date.now() - 280000).toISOString() },
    { id: 'm12', conversationId: 'conv-3', sender: 'ai', content: 'A classic pedicure is ₹800. We also have a Spa Pedicure for ₹1,200 that includes a foot soak and massage. 😊', createdAt: new Date(Date.now() - 120000).toISOString() },
  ],
};

export async function getConversations(orgId: string): Promise<Conversation[]> {
  if (USE_MOCKS) return mockResponse(MOCK_CONVERSATIONS);
  return apiRequest<Conversation[]>(`/orgs/${orgId}/conversations`);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (USE_MOCKS) return mockResponse(MOCK_MESSAGES[conversationId] ?? [], 400);
  return apiRequest<Message[]>(`/conversations/${conversationId}/messages`);
}

export async function takeOverConversation(conversationId: string): Promise<Conversation> {
  if (USE_MOCKS) {
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId)!;
    return mockResponse({ ...conv, status: 'escalated', resolutionType: 'human_resolved' }, 500);
  }
  return apiRequest<Conversation>(`/conversations/${conversationId}/takeover`, { method: 'POST' });
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  if (USE_MOCKS) {
    const msg: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      sender: 'agent',
      content,
      createdAt: new Date().toISOString(),
    };
    return mockResponse(msg, 300);
  }
  return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function sendBotMessage(conversationId: string, userMessage: string): Promise<Message> {
  if (USE_MOCKS) {
    // Simulate AI response
    const responses = [
      "That's a great question! Our team at Glow Salon would love to help.",
      "We have availability for that. Would you like me to check specific dates?",
      "Our prices are very competitive. Let me pull up the details for you.",
      "I can book that for you right away! What time works best?",
      "We're open Monday to Saturday. Would you like to schedule a visit?",
    ];
    const aiMsg: Message = {
      id: `m-ai-${Date.now()}`,
      conversationId,
      sender: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      createdAt: new Date().toISOString(),
    };
    // Echo user message isn't returned here, caller should add it
    void userMessage;
    return mockResponse(aiMsg, 1200);
  }
  return apiRequest<Message>(`/conversations/${conversationId}/ai-reply`, {
    method: 'POST',
    body: JSON.stringify({ userMessage }),
  });
}

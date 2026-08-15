import { type User } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Priya Sharma',
  email: 'priya@glowsalon.com',
  role: 'owner',
  orgId: 'org-1',
  avatarUrl: undefined,
  onboardingCompleted: true,
  org: {
    id: 'org-1',
    name: 'Glow Salon & Spa',
    slug: 'glow-salon',
    industryVertical: 'salon',
    timezone: 'Asia/Kolkata',
    address: '42 MG Road, Bengaluru, Karnataka 560001',
    languages: ['English', 'Hindi', 'Kannada'],
  },
};

export async function getMe(): Promise<User | null> {
  if (USE_MOCKS) {
    // Simulate unauthenticated if flag is set
    const isAuth = sessionStorage.getItem('aivora_authed') !== 'false';
    if (!isAuth) return mockResponse(null, 200);
    return mockResponse(MOCK_USER, 300);
  }
  return apiRequest<User>('/auth/me');
}

export async function login(email: string, _otp: string): Promise<User> {
  if (USE_MOCKS) {
    sessionStorage.setItem('aivora_authed', 'true');
    return mockResponse(MOCK_USER, 800);
  }
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, otp: _otp }),
  });
}

export async function signup(name: string, email: string, _password: string): Promise<User> {
  if (USE_MOCKS) {
    const newUser: User = {
      ...MOCK_USER,
      id: 'user-new',
      name,
      email,
      onboardingCompleted: false,
      org: { ...MOCK_USER.org, name: '' },
    };
    sessionStorage.setItem('aivora_authed', 'true');
    sessionStorage.setItem('aivora_onboarded', 'false');
    return mockResponse(newUser, 800);
  }
  return apiRequest<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password: _password }),
  });
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) {
    sessionStorage.setItem('aivora_authed', 'false');
    return mockResponse(undefined, 300);
  }
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export async function sendOtp(email: string): Promise<{ sent: boolean }> {
  if (USE_MOCKS) return mockResponse({ sent: true }, 600);
  return apiRequest<{ sent: boolean }>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

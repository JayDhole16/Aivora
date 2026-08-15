import { type TeamMember } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Priya Sharma',
    email: 'priya@glowsalon.com',
    role: 'owner',
    joinedAt: '2026-05-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tm-2',
    name: 'Ananya Krishnan',
    email: 'ananya@glowsalon.com',
    role: 'agent',
    joinedAt: '2026-06-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tm-3',
    name: 'Rohan Mehta',
    email: 'rohan@glowsalon.com',
    role: 'agent',
    joinedAt: '2026-06-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tm-4',
    name: 'Neha Gupta',
    email: 'neha.agency@example.com',
    role: 'admin',
    joinedAt: '2026-07-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tm-5',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    role: 'viewer',
    joinedAt: '2026-08-01T00:00:00Z',
    status: 'invited',
  },
];

export async function getTeam(orgId: string): Promise<TeamMember[]> {
  if (USE_MOCKS) return mockResponse(MOCK_TEAM);
  return apiRequest<TeamMember[]>(`/orgs/${orgId}/team`);
}

export async function inviteTeamMember(orgId: string, email: string, role: TeamMember['role']): Promise<TeamMember> {
  if (USE_MOCKS) {
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      joinedAt: new Date().toISOString(),
      status: 'invited',
    };
    return mockResponse(member, 800);
  }
  return apiRequest<TeamMember>(`/orgs/${orgId}/team/invite`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export async function updateTeamMemberRole(memberId: string, role: TeamMember['role']): Promise<TeamMember> {
  if (USE_MOCKS) {
    const member = MOCK_TEAM.find((m) => m.id === memberId)!;
    return mockResponse({ ...member, role }, 400);
  }
  return apiRequest<TeamMember>(`/team/${memberId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function removeTeamMember(memberId: string): Promise<void> {
  if (USE_MOCKS) return mockResponse(undefined, 300);
  return apiRequest<void>(`/team/${memberId}`, { method: 'DELETE' });
}

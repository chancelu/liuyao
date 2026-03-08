import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';

const KEYS = {
  currentDraft: 'liuyao.currentDraft',
  currentCast: 'liuyao.currentCast',
  guestSession: 'liuyao.guestSession',
};

export interface GuestSession {
  id: string;
  freeTrialUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export function getCurrentDraft() {
  if (typeof window === 'undefined') return null;
  return safeParse<DivinationDraft>(localStorage.getItem(KEYS.currentDraft));
}

export function setCurrentDraft(draft: DivinationDraft) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.currentDraft, JSON.stringify(draft));
}

export function getCurrentCast() {
  if (typeof window === 'undefined') return null;
  return safeParse<CastRecord>(localStorage.getItem(KEYS.currentCast));
}

export function setCurrentCast(cast: CastRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.currentCast, JSON.stringify(cast));
}

export function getResultById(id: string) {
  if (typeof window === 'undefined') return null;
  return safeParse<MockResult>(localStorage.getItem(`liuyao.result.${id}`));
}

export function setResultById(id: string, result: MockResult) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`liuyao.result.${id}`, JSON.stringify(result));
}

export function getOrCreateGuestSession(): GuestSession {
  if (typeof window === 'undefined') {
    return {
      id: 'guest-server',
      freeTrialUsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const existing = safeParse<GuestSession>(localStorage.getItem(KEYS.guestSession));
  if (existing) return existing;

  const created: GuestSession = {
    id: createId('guest'),
    freeTrialUsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEYS.guestSession, JSON.stringify(created));
  return created;
}

export function markGuestTrialUsed() {
  if (typeof window === 'undefined') return;
  const current = getOrCreateGuestSession();
  const next: GuestSession = {
    ...current,
    freeTrialUsed: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEYS.guestSession, JSON.stringify(next));
}

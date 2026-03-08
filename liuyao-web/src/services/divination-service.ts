import { buildMockResult } from '@/lib/mock-divination';
import {
  getCurrentDraft,
  getOrCreateGuestSession,
  getResultById,
  markGuestTrialUsed,
  setCurrentCast,
  setCurrentDraft,
  setResultById,
} from '@/lib/storage/draft-storage';
import type { CastLine, CastRecord, DivinationDraft, MockResult } from '@/lib/types';

export function createDraft(input: Omit<DivinationDraft, 'createdAt'>): DivinationDraft {
  const draft: DivinationDraft = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  setCurrentDraft(draft);
  return draft;
}

export function submitCast(lines: CastLine[]) {
  const draft = getCurrentDraft();
  if (!draft) {
    throw new Error('Draft not found');
  }

  const cast: CastRecord = {
    divinationId: draft.id,
    lines,
    updatedAt: new Date().toISOString(),
  };

  setCurrentCast(cast);

  const result = buildMockResult({
    id: draft.id,
    question: draft.question,
    category: draft.category,
    timeScope: draft.timeScope,
    background: draft.background,
    lines,
  });

  setResultById(draft.id, result);
  markGuestTrialUsed();

  return { draft, cast, result };
}

export function getResult(id: string): MockResult | null {
  return getResultById(id);
}

export function getTrialState() {
  const session = getOrCreateGuestSession();
  return {
    guestSessionId: session.id,
    freeTrialUsed: session.freeTrialUsed,
  };
}

import { createDivinationApi, getDivinationApi, submitCastApi } from '@/lib/api/client';
import { getTrialState } from '@/services/divination-service';
import { getSession } from '@/lib/supabase/auth';
import {
  getCurrentDraft,
  getResultById,
  markGuestTrialUsed,
  setCurrentCast,
  setCurrentDraft,
  setResultById,
} from '@/lib/storage/draft-storage';
import type { CreateDivinationRequest } from '@/lib/api/types';
import type { CastLine, DivinationDraft, MockResult } from '@/lib/types';

export async function createDivinationFlow(payload: CreateDivinationRequest) {
  // Authenticated users bypass the guest trial gate
  const session = await getSession();
  if (!session) {
    const trial = getTrialState();
    if (trial.freeTrialUsed) {
      return { ok: false as const, error: '游客仅支持体验一次。请登录后继续使用，登录后不限次数。' };
    }
  }

  const response = await createDivinationApi(payload);
  if (!response.success) {
    return { ok: false as const, error: response.error };
  }

  setCurrentDraft(response.data.draft);
  return { ok: true as const, draft: response.data.draft };
}

export async function submitCastFlow(lines: CastLine[]) {
  const draft = getCurrentDraft();
  if (!draft) {
    return { ok: false as const, error: '没有找到当前问题，请先回到起卦页。' };
  }

  const response = await submitCastApi(draft.id, { lines });
  if (!response.success) {
    return { ok: false as const, error: response.error };
  }

  setCurrentDraft(response.data.draft);
  setCurrentCast(response.data.cast);
  setResultById(draft.id, response.data.result);
  markGuestTrialUsed();
  return { ok: true as const, draft: response.data.draft, result: response.data.result };
}

export async function getDivinationResultFlow(id: string): Promise<MockResult | null> {
  // Load localStorage result first (may contain AI analysis from processing page)
  const localResult = getResultById(id);

  const response = await getDivinationApi(id);
  if (response.success && response.data.result) {
    setCurrentDraft(response.data.draft);

    // Merge: keep AI analysis fields from localStorage if server doesn't have them
    const serverResult = response.data.result;
    const merged: MockResult = {
      ...serverResult,
      summary: serverResult.summary || localResult?.summary || '',
      plainAnalysis: serverResult.plainAnalysis || localResult?.plainAnalysis || '',
      professionalAnalysis: serverResult.professionalAnalysis || localResult?.professionalAnalysis || '',
    };

    setResultById(id, merged);
    return merged;
  }

  return localResult;
}

export function buildCreateDivinationPayload(input: Omit<DivinationDraft, 'createdAt'>): CreateDivinationRequest {
  return {
    id: input.id,
    question: input.question,
    category: input.category,
    timeScope: input.timeScope,
    background: input.background,
    locale: input.locale,
  };
}

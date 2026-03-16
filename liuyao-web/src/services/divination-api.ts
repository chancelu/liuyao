import { createDivinationApi, getDivinationApi, submitCastApi } from '@/lib/api/client';
import { getTrialState } from '@/services/divination-service';
import { getSession } from '@/lib/supabase/auth';
import { getCurrentMessages } from '@/lib/i18n';
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
      return { ok: false as const, error: getCurrentMessages().errors.guestTrialUsed };
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
    return { ok: false as const, error: getCurrentMessages().errors.noDraft };
  }

  const response = await submitCastApi(draft.id, { lines, draft });
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

    const serverResult = response.data.result;
    // Prefer localStorage AI analysis over server fallback analysis.
    // The processing page writes these fields only after a successful LLM call,
    // so if localStorage has them, they're the real AI output.
    // Also preserve chart and isAI which are not stored in Supabase.
    const merged: MockResult = {
      ...serverResult,
      summary: localResult?.summary || serverResult.summary,
      plainAnalysis: localResult?.plainAnalysis || serverResult.plainAnalysis,
      professionalAnalysis: localResult?.professionalAnalysis || serverResult.professionalAnalysis,
      isAI: localResult?.isAI ?? false,
      chart: localResult?.chart ?? serverResult.chart,
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
    gender: input.gender,
    background: input.background,
    locale: input.locale,
  };
}

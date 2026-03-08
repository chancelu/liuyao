import { createDivinationApi, getDivinationApi, submitCastApi } from '@/lib/api/client';
import { getTrialState } from '@/services/divination-service';
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
  const trial = getTrialState();
  if (trial.freeTrialUsed) {
    return { ok: false as const, error: '游客当前只支持体验一次。下一步接入登录后，这里会引导注册继续使用。' };
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
  const response = await getDivinationApi(id);
  if (response.success && response.data.result) {
    setCurrentDraft(response.data.draft);
    if (response.data.result) {
      setResultById(id, response.data.result);
    }
    return response.data.result;
  }

  return getResultById(id);
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

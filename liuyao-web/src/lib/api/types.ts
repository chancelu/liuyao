import type { CastLine, CastRecord, DivinationDraft, MockResult } from '@/lib/types';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

export interface ApiFailure {
  success: false;
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface CreateDivinationRequest {
  id: string;
  question: string;
  category: DivinationDraft['category'];
  timeScope: DivinationDraft['timeScope'];
  background: string;
  locale: string;
}

export interface CreateDivinationResponse {
  draft: DivinationDraft;
  guestSessionId: string;
  freeTrialUsed: boolean;
}

export interface SubmitCastRequest {
  lines: CastLine[];
}

export interface SubmitCastResponse {
  draft: DivinationDraft;
  cast: CastRecord;
  result: MockResult;
}

export interface GetDivinationResponse {
  draft: DivinationDraft;
  cast: CastRecord | null;
  result: MockResult | null;
}

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
  gender?: DivinationDraft['gender'];
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
  /** Optional draft data for fallback when DB is unavailable */
  draft?: DivinationDraft;
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
  isPublic: boolean;
  isSaved: boolean;
}

export interface SaveDivinationResponse {
  saved: boolean;
}

export interface ShareDivinationResponse {
  shareUrl: string;
}

export interface DivinationListItem {
  id: string;
  question: string;
  category: DivinationDraft['category'];
  createdAt: string;
  summary: string | null;
  primaryHexagram: string | null;
  changedHexagram: string | null;
}

export interface ListDivinationsResponse {
  items: DivinationListItem[];
}

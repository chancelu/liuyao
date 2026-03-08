import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';

export interface DivinationRecord {
  draft: DivinationDraft;
  cast: CastRecord | null;
  result: MockResult | null;
}

/**
 * 数据访问抽象接口。
 * Mock 实现使用进程内 Map，Supabase 实现直接写库。
 * 切换只需替换 getRepository() 的返回值。
 */
export interface IDivinationRepository {
  saveDraft(draft: DivinationDraft): Promise<DivinationRecord>;
  saveCast(divinationId: string, cast: CastRecord, result: MockResult): Promise<DivinationRecord | null>;
  getById(id: string): Promise<DivinationRecord | null>;
}

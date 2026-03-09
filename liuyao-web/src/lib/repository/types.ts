import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';

export interface DivinationRecord {
  draft: DivinationDraft;
  cast: CastRecord | null;
  result: MockResult | null;
  savedByUserId?: string | null;
  isPublic?: boolean;
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
  /** 将已完成的卦例关联到用户 */
  saveForUser(divinationId: string, userId: string): Promise<DivinationRecord | null>;
  /** 列出某用户保存的所有卦例（按创建时间倒序） */
  listByUser(userId: string): Promise<DivinationRecord[]>;
  /** 将卦例标记为公开，允许通过分享链接访问 */
  markPublic(divinationId: string): Promise<DivinationRecord | null>;
}

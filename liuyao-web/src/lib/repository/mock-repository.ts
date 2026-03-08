import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';
import type { DivinationRecord, IDivinationRepository } from './types';

// 进程级 Map（等同于旧 mock-db.ts，保留兼容性）
const globalStore = globalThis as typeof globalThis & {
  __liuyaoMockDb__?: Map<string, DivinationRecord>;
};

function getDb(): Map<string, DivinationRecord> {
  if (!globalStore.__liuyaoMockDb__) {
    globalStore.__liuyaoMockDb__ = new Map<string, DivinationRecord>();
  }
  return globalStore.__liuyaoMockDb__;
}

export class MockDivinationRepository implements IDivinationRepository {
  async saveDraft(draft: DivinationDraft): Promise<DivinationRecord> {
    const db = getDb();
    const existing = db.get(draft.id);
    const record: DivinationRecord = {
      draft,
      cast: existing?.cast ?? null,
      result: existing?.result ?? null,
    };
    db.set(draft.id, record);
    return record;
  }

  async saveCast(
    divinationId: string,
    cast: CastRecord,
    result: MockResult,
  ): Promise<DivinationRecord | null> {
    const db = getDb();
    const existing = db.get(divinationId);
    if (!existing) return null;
    const record: DivinationRecord = { draft: existing.draft, cast, result };
    db.set(divinationId, record);
    return record;
  }

  async getById(id: string): Promise<DivinationRecord | null> {
    return getDb().get(id) ?? null;
  }
}

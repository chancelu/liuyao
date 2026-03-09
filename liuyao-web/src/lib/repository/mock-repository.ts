import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';
import type { DivinationRecord, IDivinationRepository } from './types';

// 进程级 Map（等同于旧 mock-db.ts，保留兼容性）
const globalStore = globalThis as typeof globalThis & {
  __liuyaoMockDb__?: Map<string, DivinationRecord>;
  __liuyaoMockUserIndex__?: Map<string, string[]>;
};

function getDb(): Map<string, DivinationRecord> {
  if (!globalStore.__liuyaoMockDb__) {
    globalStore.__liuyaoMockDb__ = new Map<string, DivinationRecord>();
  }
  return globalStore.__liuyaoMockDb__;
}

function getUserIndex(): Map<string, string[]> {
  if (!globalStore.__liuyaoMockUserIndex__) {
    globalStore.__liuyaoMockUserIndex__ = new Map<string, string[]>();
  }
  return globalStore.__liuyaoMockUserIndex__;
}

export class MockDivinationRepository implements IDivinationRepository {
  async saveDraft(draft: DivinationDraft): Promise<DivinationRecord> {
    const db = getDb();
    const existing = db.get(draft.id);
    const record: DivinationRecord = {
      draft,
      cast: existing?.cast ?? null,
      result: existing?.result ?? null,
      savedByUserId: existing?.savedByUserId ?? null,
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
    const record: DivinationRecord = { draft: existing.draft, cast, result, savedByUserId: existing.savedByUserId ?? null };
    db.set(divinationId, record);
    return record;
  }

  async getById(id: string): Promise<DivinationRecord | null> {
    return getDb().get(id) ?? null;
  }

  async saveForUser(divinationId: string, userId: string): Promise<DivinationRecord | null> {
    const db = getDb();
    const existing = db.get(divinationId);
    if (!existing) return null;
    const record: DivinationRecord = { ...existing, savedByUserId: userId };
    db.set(divinationId, record);

    const idx = getUserIndex();
    const ids = idx.get(userId) ?? [];
    if (!ids.includes(divinationId)) {
      idx.set(userId, [divinationId, ...ids]);
    }
    return record;
  }

  async listByUser(userId: string): Promise<DivinationRecord[]> {
    const idx = getUserIndex();
    const ids = idx.get(userId) ?? [];
    const db = getDb();
    return ids.map((id) => db.get(id)).filter((r): r is DivinationRecord => r != null);
  }

  async markPublic(divinationId: string): Promise<DivinationRecord | null> {
    const db = getDb();
    const existing = db.get(divinationId);
    if (!existing) return null;
    const record: DivinationRecord = { ...existing, isPublic: true };
    db.set(divinationId, record);
    return record;
  }
}

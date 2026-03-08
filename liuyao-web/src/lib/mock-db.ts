import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';

interface DivinationRecord {
  draft: DivinationDraft;
  cast: CastRecord | null;
  result: MockResult | null;
}

const globalStore = globalThis as typeof globalThis & {
  __liuyaoMockDb__?: Map<string, DivinationRecord>;
};

function getDb() {
  if (!globalStore.__liuyaoMockDb__) {
    globalStore.__liuyaoMockDb__ = new Map<string, DivinationRecord>();
  }

  return globalStore.__liuyaoMockDb__;
}

export function saveDraftRecord(draft: DivinationDraft) {
  const db = getDb();
  const existing = db.get(draft.id);
  db.set(draft.id, {
    draft,
    cast: existing?.cast ?? null,
    result: existing?.result ?? null,
  });

  return db.get(draft.id)!;
}

export function saveCastRecord(divinationId: string, cast: CastRecord, result: MockResult) {
  const db = getDb();
  const existing = db.get(divinationId);
  if (!existing) {
    return null;
  }

  const next: DivinationRecord = {
    draft: existing.draft,
    cast,
    result,
  };

  db.set(divinationId, next);
  return next;
}

export function getDivinationRecord(id: string) {
  const db = getDb();
  return db.get(id) ?? null;
}

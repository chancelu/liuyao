import type { IDivinationRepository } from './types';
import { MockDivinationRepository } from './mock-repository';

let _repo: IDivinationRepository | null = null;

/**
 * 返回当前配置下的数据仓库实例。
 *
 * - 若 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 均已设置，
 *   则使用 Supabase 实现（延迟 import 避免服务端 bundle 问题）。
 *   若 Supabase 临时不可用，每次操作会自动回退至进程内 Mock。
 * - 否则直接使用 Mock 实现，无需任何外部依赖。
 */
export async function getRepository(): Promise<IDivinationRepository> {
  if (_repo) return _repo;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { SupabaseDivinationRepository } = await import('./supabase-repository');
      _repo = new ResilientRepository(
        new SupabaseDivinationRepository(createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })),
        new MockDivinationRepository(),
      );
    } catch (err) {
      console.warn('[repository] Supabase init failed, using mock fallback:', err);
      _repo = new MockDivinationRepository();
    }
  } else {
    _repo = new MockDivinationRepository();
  }

  return _repo;
}

// ---------------------------------------------------------------------------
// ResilientRepository: 将任何 Supabase 运行时错误转发至 mock
// ---------------------------------------------------------------------------
import type { CastRecord, DivinationDraft, MockResult } from '@/lib/types';
import type { DivinationRecord } from './types';

class ResilientRepository implements IDivinationRepository {
  constructor(
    private readonly primary: IDivinationRepository,
    private readonly fallback: IDivinationRepository,
  ) {}

  async saveDraft(draft: DivinationDraft): Promise<DivinationRecord> {
    try {
      return await this.primary.saveDraft(draft);
    } catch (err) {
      console.warn('[repository] saveDraft fallback to mock:', (err as Error).message);
      return this.fallback.saveDraft(draft);
    }
  }

  async saveCast(
    divinationId: string,
    cast: CastRecord,
    result: MockResult,
  ): Promise<DivinationRecord | null> {
    try {
      return await this.primary.saveCast(divinationId, cast, result);
    } catch (err) {
      console.warn('[repository] saveCast fallback to mock:', (err as Error).message);
      return this.fallback.saveCast(divinationId, cast, result);
    }
  }

  async getById(id: string): Promise<DivinationRecord | null> {
    try {
      return await this.primary.getById(id);
    } catch (err) {
      console.warn('[repository] getById fallback to mock:', (err as Error).message);
      return this.fallback.getById(id);
    }
  }

  async saveForUser(divinationId: string, userId: string): Promise<DivinationRecord | null> {
    try {
      return await this.primary.saveForUser(divinationId, userId);
    } catch (err) {
      console.warn('[repository] saveForUser fallback to mock:', (err as Error).message);
      return this.fallback.saveForUser(divinationId, userId);
    }
  }

  async listByUser(userId: string): Promise<DivinationRecord[]> {
    try {
      return await this.primary.listByUser(userId);
    } catch (err) {
      console.warn('[repository] listByUser fallback to mock:', (err as Error).message);
      return this.fallback.listByUser(userId);
    }
  }

  async markPublic(divinationId: string): Promise<DivinationRecord | null> {
    try {
      return await this.primary.markPublic(divinationId);
    } catch (err) {
      console.warn('[repository] markPublic fallback to mock:', (err as Error).message);
      return this.fallback.markPublic(divinationId);
    }
  }
}

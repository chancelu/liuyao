import type { IDivinationRepository } from './types';
import { MockDivinationRepository } from './mock-repository';

let _repo: IDivinationRepository | null = null;

/**
 * 返回当前配置下的数据仓库实例。
 *
 * - 若 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 均已设置，
 *   则使用 Supabase 实现（延迟 import 避免服务端 bundle 问题）。
 * - 否则回退到进程内 Mock 实现，无需任何外部依赖。
 */
export async function getRepository(): Promise<IDivinationRepository> {
  if (_repo) return _repo;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const { SupabaseDivinationRepository } = await import('./supabase-repository');
    _repo = new SupabaseDivinationRepository(createClient(url, serviceKey));
  } else {
    _repo = new MockDivinationRepository();
  }

  return _repo;
}

import type { CastRecord, CastLine, DivinationDraft, MockResult } from '@/lib/types';
import type { DivinationRecord, IDivinationRepository } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// DB row shapes (mirrors the SQL schema)
// ---------------------------------------------------------------------------
interface DivinationRow {
  id: string;
  question: string;
  category: string;
  time_scope: string;
  background: string;
  locale: string;
  created_at: string;
  saved_by_user_id?: string | null;
}

interface CastRow {
  id: string;
  divination_id: string;
  lines: CastLine[];
  updated_at: string;
}

interface ReadingRow {
  id: string;
  divination_id: string;
  primary_hexagram: string;
  changed_hexagram: string;
  moving_lines: number[];
  summary: string;
  plain_analysis: string;
  professional_analysis: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
function rowToDraft(row: DivinationRow): DivinationDraft {
  return {
    id: row.id,
    question: row.question,
    category: row.category as DivinationDraft['category'],
    timeScope: row.time_scope as DivinationDraft['timeScope'],
    background: row.background,
    locale: row.locale,
    createdAt: row.created_at,
  };
}

function rowToCast(row: CastRow): CastRecord {
  return {
    divinationId: row.divination_id,
    lines: row.lines,
    updatedAt: row.updated_at,
  };
}

function rowToResult(d: DivinationRow, r: ReadingRow): MockResult {
  return {
    id: d.id,
    question: d.question,
    category: d.category as MockResult['category'],
    timeScope: d.time_scope as MockResult['timeScope'],
    background: d.background,
    primaryHexagram: r.primary_hexagram,
    changedHexagram: r.changed_hexagram,
    movingLines: r.moving_lines,
    summary: r.summary,
    plainAnalysis: r.plain_analysis,
    professionalAnalysis: r.professional_analysis,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------
export class SupabaseDivinationRepository implements IDivinationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async saveDraft(draft: DivinationDraft): Promise<DivinationRecord> {
    const { error } = await this.client.from('divinations').upsert({
      id: draft.id,
      question: draft.question,
      category: draft.category,
      time_scope: draft.timeScope,
      background: draft.background,
      locale: draft.locale,
      created_at: draft.createdAt,
    });

    if (error) throw new Error(`saveDraft failed: ${error.message}`);

    return { draft, cast: null, result: null };
  }

  async saveCast(
    divinationId: string,
    cast: CastRecord,
    result: MockResult,
  ): Promise<DivinationRecord | null> {
    const existing = await this.getById(divinationId);
    if (!existing) return null;

    const { error: castError } = await this.client.from('casts').upsert({
      divination_id: divinationId,
      lines: cast.lines,
      updated_at: cast.updatedAt,
    });

    if (castError) throw new Error(`saveCast (cast) failed: ${castError.message}`);

    const { error: readingError } = await this.client.from('readings').upsert({
      divination_id: divinationId,
      primary_hexagram: result.primaryHexagram,
      changed_hexagram: result.changedHexagram,
      moving_lines: result.movingLines,
      summary: result.summary,
      plain_analysis: result.plainAnalysis,
      professional_analysis: result.professionalAnalysis,
      created_at: result.createdAt,
    });

    if (readingError) throw new Error(`saveCast (reading) failed: ${readingError.message}`);

    return { draft: existing.draft, cast, result };
  }

  async getById(id: string): Promise<DivinationRecord | null> {
    const { data: divRow, error: divError } = await this.client
      .from('divinations')
      .select('*')
      .eq('id', id)
      .maybeSingle<DivinationRow>();

    if (divError) throw new Error(`getById (divination) failed: ${divError.message}`);
    if (!divRow) return null;

    const draft = rowToDraft(divRow);

    const { data: castRow } = await this.client
      .from('casts')
      .select('*')
      .eq('divination_id', id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle<CastRow>();

    const { data: readingRow } = await this.client
      .from('readings')
      .select('*')
      .eq('divination_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<ReadingRow>();

    return {
      draft,
      cast: castRow ? rowToCast(castRow) : null,
      result: readingRow ? rowToResult(divRow, readingRow) : null,
      savedByUserId: divRow.saved_by_user_id ?? null,
    };
  }

  async saveForUser(divinationId: string, userId: string): Promise<DivinationRecord | null> {
    const { error } = await this.client
      .from('divinations')
      .update({ saved_by_user_id: userId })
      .eq('id', divinationId);

    if (error) throw new Error(`saveForUser failed: ${error.message}`);

    return this.getById(divinationId);
  }

  async listByUser(userId: string): Promise<DivinationRecord[]> {
    const { data: divRows, error } = await this.client
      .from('divinations')
      .select('*')
      .eq('saved_by_user_id', userId)
      .order('created_at', { ascending: false })
      .returns<DivinationRow[]>();

    if (error) throw new Error(`listByUser failed: ${error.message}`);
    if (!divRows || divRows.length === 0) return [];

    const records: DivinationRecord[] = await Promise.all(
      divRows.map(async (divRow) => {
        const { data: readingRow } = await this.client
          .from('readings')
          .select('*')
          .eq('divination_id', divRow.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle<ReadingRow>();

        return {
          draft: rowToDraft(divRow),
          cast: null,
          result: readingRow ? rowToResult(divRow, readingRow) : null,
          savedByUserId: userId,
          isPublic: (divRow as DivinationRow & { is_public?: boolean }).is_public ?? false,
        };
      }),
    );

    return records;
  }

  async markPublic(divinationId: string): Promise<DivinationRecord | null> {
    const { error } = await this.client
      .from('divinations')
      .update({ is_public: true })
      .eq('id', divinationId);

    if (error) throw new Error(`markPublic failed: ${error.message}`);

    return this.getById(divinationId);
  }
}

import { SiteShell } from '@/components/site-shell';
import { ShareClient } from '@/components/share/share-client';
import { getRepository } from '@/lib/repository';

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repo = await getRepository();
  const record = await repo.getById(id).catch(() => null);

  const isPublic = record?.isPublic ?? false;
  const result = isPublic ? record?.result ?? null : null;
  const draft = isPublic ? record?.draft ?? null : null;

  return (
    <SiteShell>
      <ShareClient
        isPublic={isPublic}
        result={result ? {
          summary: result.summary,
          primaryHexagram: result.primaryHexagram,
          changedHexagram: result.changedHexagram,
          plainAnalysis: result.plainAnalysis,
        } : null}
        draft={draft ? {
          question: draft.question,
          category: draft.category,
        } : null}
      />
    </SiteShell>
  );
}

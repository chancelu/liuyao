import { SiteShell } from '@/components/site-shell';
import { ResultClient } from '@/components/result/result-client';

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SiteShell>
      <ResultClient id={id} />
    </SiteShell>
  );
}

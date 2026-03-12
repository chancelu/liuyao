import { SiteShell } from '@/components/site-shell';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}

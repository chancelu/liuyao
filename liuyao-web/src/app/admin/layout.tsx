import { SiteShell } from '@/components/site-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}

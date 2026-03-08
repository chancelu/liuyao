import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();
const categories = [
  ['relationship', '感情'],
  ['career', '事业'],
  ['wealth', '财运'],
  ['health', '健康'],
  ['study', '学业'],
  ['lost', '失物'],
  ['other', '其他'],
] as const;
const timeScopes = [
  ['recent', '近期'],
  ['this_month', '本月'],
  ['this_year', '本年'],
  ['unspecified', '未限定'],
] as const;

export default function CastAskPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Ask</div>
          <h1 className="text-4xl text-stone-50">{messages.ask.title}</h1>
          <p className="text-sm leading-7 text-stone-300/80">{messages.ask.description}</p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <label className="text-sm text-stone-300">{messages.ask.questionLabel}</label>
            <textarea
              className="min-h-36 w-full rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base text-stone-100 outline-none placeholder:text-stone-500"
              placeholder={messages.ask.questionPlaceholder}
              readOnly
              defaultValue=""
            />
          </section>

          <section className="space-y-3">
            <div className="text-sm text-stone-300">{messages.ask.categoryLabel}</div>
            <div className="flex flex-wrap gap-3">
              {categories.map(([key, label]) => (
                <div key={key} className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300">
                  {label}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-sm text-stone-300">{messages.ask.timeScopeLabel}</div>
            <div className="flex flex-wrap gap-3">
              {timeScopes.map(([key, label]) => (
                <div key={key} className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300">
                  {label}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-sm text-stone-300">{messages.ask.backgroundLabel}</label>
            <textarea
              className="min-h-28 w-full rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base text-stone-100 outline-none placeholder:text-stone-500"
              placeholder={messages.ask.backgroundPlaceholder}
              readOnly
            />
          </section>

          <section className="space-y-3">
            <div className="text-sm text-stone-300">示例问题</div>
            <div className="flex flex-wrap gap-3">
              {messages.home.examples.map((example) => (
                <div key={example} className="rounded-full border border-emerald-200/10 bg-emerald-100/6 px-4 py-2 text-sm text-stone-200">
                  {example}
                </div>
              ))}
            </div>
          </section>

          <div className="pt-2">
            <Link href="/cast/ritual" className="inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
              {messages.ask.submit}
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

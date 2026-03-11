-- ============================================================
-- 六爻占卜 完整 Schema（含补充字段）
-- ============================================================
-- 在 Supabase SQL Editor 中一次性执行即可
-- ============================================================

-- 扩展
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. 用户配置表（与 auth.users 1:1 关联）
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url  text,
  locale      text not null default 'zh-CN',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "用户只能读取自己的 profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "用户只能更新自己的 profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. 游客会话表
-- ============================================================
create table if not exists public.guest_sessions (
  id               text primary key,
  free_trial_used  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.guest_sessions enable row level security;

create policy "匿名用户按 id 读取自己的会话"
  on public.guest_sessions for select
  using (true);

-- ============================================================
-- 3. 起卦记录表（divinations）
-- ============================================================
create table if not exists public.divinations (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete set null,
  guest_session_id text references public.guest_sessions(id) on delete set null,
  question         text not null,
  category         text not null,
  time_scope       text not null default 'unspecified',
  background       text not null default '',
  locale           text not null default 'zh-CN',
  saved_by_user_id uuid references auth.users(id),
  is_public        boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.divinations enable row level security;

create policy "登录用户只能读取自己的卦例"
  on public.divinations for select
  using (auth.uid() = user_id or guest_session_id is not null);

create policy "登录用户只能插入自己的卦例"
  on public.divinations for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "service_role_full_access"
  on public.divinations for all
  using (true) with check (true);

-- ============================================================
-- 4. 六爻摇卦结果表（casts）
-- ============================================================
create table if not exists public.casts (
  id              uuid primary key default uuid_generate_v4(),
  divination_id   uuid not null references public.divinations(id) on delete cascade,
  lines           text[] not null check (array_length(lines, 1) = 6),
  updated_at      timestamptz not null default now()
);

alter table public.casts enable row level security;

create policy "通过 divination 限制 cast 读取"
  on public.casts for select
  using (exists (
    select 1 from public.divinations d
    where d.id = casts.divination_id
      and (d.user_id = auth.uid() or d.user_id is null)
  ));

create policy "service_role_full_access_casts"
  on public.casts for all
  using (true) with check (true);

-- ============================================================
-- 5. 解卦结果表（readings）
-- ============================================================
create table if not exists public.readings (
  id                     uuid primary key default uuid_generate_v4(),
  divination_id          uuid not null references public.divinations(id) on delete cascade,
  primary_hexagram       text not null,
  changed_hexagram       text not null default '',
  moving_lines           integer[] not null default '{}',
  summary                text not null default '',
  plain_analysis         text not null default '',
  professional_analysis  text not null default '',
  created_at             timestamptz not null default now()
);

alter table public.readings enable row level security;

create policy "通过 divination 限制 reading 读取"
  on public.readings for select
  using (exists (
    select 1 from public.divinations d
    where d.id = readings.divination_id
      and (d.user_id = auth.uid() or d.user_id is null)
  ));

create policy "service_role_full_access_readings"
  on public.readings for all
  using (true) with check (true);

-- ============================================================
-- 6. 辅助函数：自动更新 updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger guest_sessions_set_updated_at
  before update on public.guest_sessions
  for each row execute function public.set_updated_at();

create trigger casts_set_updated_at
  before update on public.casts
  for each row execute function public.set_updated_at();

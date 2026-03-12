-- ============================================================
-- 爻镜 v2: 积分系统 + 用户档案 + 管理员
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 1. 用户档案表
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  short_uid text unique not null,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 积分余额表
create table if not exists user_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. 积分流水表
create table if not exists points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null,  -- 'checkin' | 'share' | 'admin_grant'
  description text,
  created_at timestamptz not null default now()
);

-- 4. 签到记录表（每人每天唯一）
create table if not exists checkin_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  created_at timestamptz not null default now(),
  unique(user_id, checkin_date)
);

-- 索引
create index if not exists idx_points_log_user on points_log(user_id, created_at desc);
create index if not exists idx_checkin_user_date on checkin_records(user_id, checkin_date);
create index if not exists idx_profiles_short_uid on user_profiles(short_uid);

-- ============================================================
-- RLS 策略
-- ============================================================

alter table user_profiles enable row level security;
alter table user_points enable row level security;
alter table points_log enable row level security;
alter table checkin_records enable row level security;

-- user_profiles: 用户可读自己的，service_role 可写
create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Service role can insert profiles"
  on user_profiles for insert
  with check (true);

-- user_points: 用户可读自己的
create policy "Users can read own points"
  on user_points for select
  using (auth.uid() = user_id);

create policy "Service role can manage points"
  on user_points for all
  with check (true);

-- points_log: 用户可读自己的
create policy "Users can read own points log"
  on points_log for select
  using (auth.uid() = user_id);

create policy "Service role can insert points log"
  on points_log for insert
  with check (true);

-- checkin_records: 用户可读自己的
create policy "Users can read own checkins"
  on checkin_records for select
  using (auth.uid() = user_id);

create policy "Service role can insert checkins"
  on checkin_records for insert
  with check (true);

-- ============================================================
-- 自动创建 profile 的触发器（新用户注册时）
-- ============================================================

create or replace function generate_short_uid()
returns text as $$
declare
  new_uid text;
  exists_count integer;
begin
  loop
    new_uid := lpad(floor(random() * 100000000)::text, 8, '0');
    select count(*) into exists_count from user_profiles where short_uid = new_uid;
    exit when exists_count = 0;
  end loop;
  return new_uid;
end;
$$ language plpgsql;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, short_uid, role)
  values (new.id, generate_short_uid(), 'user')
  on conflict (id) do nothing;

  insert into user_points (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 给管理员邮箱设置 role
-- ============================================================
-- 注意：需要在用户注册后执行，或者在触发器中判断
-- 这里先创建一个函数，注册后手动调用或在 handle_new_user 中判断

create or replace function set_admin_role()
returns void as $$
begin
  update user_profiles
  set role = 'admin'
  where id in (
    select id from auth.users where email = '18612669630@163.com'
  );
end;
$$ language plpgsql security definer;

-- 如果用户已存在，立即执行
select set_admin_role();

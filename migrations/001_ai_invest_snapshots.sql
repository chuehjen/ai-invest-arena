-- ai_invest_snapshots 建表 + RLS
-- 在 Supabase SQL Editor 执行此文件，或放到 Settings → Database → Migrations 自动应用。
--
-- 字段：
--   snapshot_date  快照日期（PK，一日一行）
--   day_n          竞赛第几天
--   payload        完整 JSONB 快照（与 public/data/latest.json 同 schema）
--   created_at     写入时间
--
-- RLS：
--   anon 可读（前端 fetch 用）
--   service_role 可写（后端 upload_supabase.py 用，走 service_key 绕过 RLS）

create table if not exists public.ai_invest_snapshots (
  snapshot_date date primary key,
  day_n int not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- 索引 created_at 加速 "取最新一条" 查询
create index if not exists idx_ai_invest_snapshots_created_at
  on public.ai_invest_snapshots (created_at desc);

alter table public.ai_invest_snapshots enable row level security;

-- 公开读：任何人可读（前端 fetch 不需要 token）
drop policy if exists "anon_read_snapshots" on public.ai_invest_snapshots;
create policy "anon_read_snapshots"
  on public.ai_invest_snapshots
  for select
  using (true);

-- 注意：写入必须用 service_role key（upload_supabase.py 走 service_key 绕过 RLS），
-- 因此不再创建 insert/update policy。如果未来需要前端写入，请新增专用 policy。

-- ArenaHub — horário de funcionamento da arena
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

create table if not exists opening_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  is_open boolean not null default true,
  created_at timestamptz default now(),
  unique(tenant_id, weekday)
);

alter table opening_hours enable row level security;

-- =========================================
-- GRANTS
-- =========================================
grant select, insert, update, delete on public.opening_hours to authenticated;
grant select on public.opening_hours to anon;

-- =========================================
-- RLS POLICIES
-- =========================================
drop policy if exists "opening_hours_tenant" on opening_hours;
create policy "opening_hours_tenant"
on opening_hours for all
using (tenant_id = get_user_tenant_id())
with check (tenant_id = get_user_tenant_id());

-- Leitura pública (portal de reserva do cliente / anon)
drop policy if exists "opening_hours_public" on opening_hours;
create policy "opening_hours_public"
on opening_hours for select
using (true);

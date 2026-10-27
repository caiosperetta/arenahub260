-- ArenaHub — permissões e policies para a página de Clientes
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

-- =========================================
-- GRANTS
-- =========================================
grant select on public.profiles to authenticated;
grant select on public.monthly_plans to authenticated;
grant select on public.bookings to authenticated;

-- =========================================
-- RLS POLICIES — profiles
-- admin/staff podem ler todos os clientes do seu tenant
-- =========================================
drop policy if exists "profiles_own" on profiles;
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select"
on profiles for select
using (
  id = auth.uid()
  or tenant_id = get_user_tenant_id()
);

-- =========================================
-- RLS POLICIES — bookings
-- admin/staff podem ler todas as reservas do seu tenant (já coberto, policy recriada por clareza)
-- =========================================
drop policy if exists "bookings_client" on bookings;
drop policy if exists "bookings_select" on bookings;
create policy "bookings_select"
on bookings for select
using (
  client_id = auth.uid()
  or tenant_id = get_user_tenant_id()
);

-- =========================================
-- RLS POLICIES — monthly_plans
-- admin/staff leem todos os planos do tenant; cliente lê os próprios
-- =========================================
drop policy if exists "plans_tenant" on monthly_plans;
drop policy if exists "monthly_plans_select" on monthly_plans;
create policy "monthly_plans_select"
on monthly_plans for select
using (
  tenant_id = get_user_tenant_id()
  or client_id = auth.uid()
);

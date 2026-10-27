-- ArenaHub — permissões e policies para courts / court_slots
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

-- =========================================
-- GRANTS
-- =========================================
grant select, insert, update, delete on public.courts to authenticated;
grant select, insert, update, delete on public.court_slots to authenticated;

-- =========================================
-- RLS POLICIES — courts
-- Substitui a policy "for all" única por policies granulares por operação
-- =========================================
drop policy if exists "courts_tenant" on courts;

drop policy if exists "courts_select_tenant" on courts;
create policy "courts_select_tenant" on courts for select
using (tenant_id = get_user_tenant_id());

drop policy if exists "courts_insert_tenant" on courts;
create policy "courts_insert_tenant" on courts for insert
with check (tenant_id = get_user_tenant_id());

drop policy if exists "courts_update_tenant" on courts;
create policy "courts_update_tenant" on courts for update
using (tenant_id = get_user_tenant_id());

drop policy if exists "courts_delete_tenant" on courts;
create policy "courts_delete_tenant" on courts for delete
using (tenant_id = get_user_tenant_id());

-- mantém o acesso público de leitura (portal de reserva do cliente / anon)
drop policy if exists "courts_public_select" on courts;
create policy "courts_public_select" on courts for select
using (active = true);

-- =========================================
-- RLS POLICIES — court_slots
-- =========================================
drop policy if exists "slots_tenant" on court_slots;

drop policy if exists "slots_select_tenant" on court_slots;
create policy "slots_select_tenant" on court_slots for select
using (tenant_id = get_user_tenant_id());

drop policy if exists "slots_insert_tenant" on court_slots;
create policy "slots_insert_tenant" on court_slots for insert
with check (tenant_id = get_user_tenant_id());

drop policy if exists "slots_delete_tenant" on court_slots;
create policy "slots_delete_tenant" on court_slots for delete
using (tenant_id = get_user_tenant_id());

-- mantém o acesso público de leitura (portal de reserva do cliente / anon)
drop policy if exists "slots_public_select" on court_slots;
create policy "slots_public_select" on court_slots for select
using (active = true);

-- ArenaHub — permissões para a página Financeiro
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

-- bookings já possui policy de select da migration 003
-- Garante que admin também pode atualizar o status da reserva (para aprovar/recusar no futuro)
drop policy if exists "bookings_update_admin" on bookings;
create policy "bookings_update_admin"
on bookings for update
using (tenant_id = get_user_tenant_id());

drop policy if exists "bookings_insert" on bookings;
create policy "bookings_insert"
on bookings for insert
with check (
  client_id = auth.uid()
  or tenant_id = get_user_tenant_id()
);

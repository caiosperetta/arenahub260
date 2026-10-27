-- ArenaHub — permissões para o portal do cliente (público)
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

-- Público (anon) pode ler quadras, horários e dados da arena
grant select on public.courts to anon;
grant select on public.court_slots to anon;
grant select on public.tenants to anon;
grant select on public.bookings to anon;

drop policy if exists "courts_anon_select" on courts;
create policy "courts_anon_select"
on courts for select
using (active = true);

drop policy if exists "slots_anon_select" on court_slots;
create policy "slots_anon_select"
on court_slots for select
using (active = true);

drop policy if exists "tenants_anon_select" on tenants;
create policy "tenants_anon_select"
on tenants for select
using (active = true);

drop policy if exists "bookings_anon_select" on bookings;
create policy "bookings_anon_select"
on bookings for select
using (status in ('confirmed', 'pending'));

-- Clientes autenticados podem criar suas próprias reservas
drop policy if exists "bookings_insert" on bookings;
drop policy if exists "bookings_insert_client" on bookings;
create policy "bookings_insert_client"
on bookings for insert
with check (client_id = auth.uid());

grant insert on public.bookings to authenticated;

-- Clientes autenticados podem cancelar suas próprias reservas
drop policy if exists "bookings_cancel_client" on bookings;
create policy "bookings_cancel_client"
on bookings for update
using (client_id = auth.uid())
with check (status = 'cancelled');

-- Clientes autenticados podem criar seu próprio perfil (cadastro)
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_insert_client" on profiles;
create policy "profiles_insert_client"
on profiles for insert
with check (id = auth.uid());

grant insert on public.profiles to authenticated;

-- Clientes autenticados podem atualizar seu próprio perfil
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_update_client" on profiles;
create policy "profiles_update_client"
on profiles for update
using (id = auth.uid());

grant update on public.profiles to authenticated;

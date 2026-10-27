-- ArenaHub — permissões para a página Configurações
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

-- Admin can update their own tenant
drop policy if exists "tenant_select" on tenants;
create policy "tenants_select"
on tenants for select
using (
  id = get_user_tenant_id()
  or get_user_role() = 'super_admin'
);

drop policy if exists "tenants_update" on tenants;
create policy "tenants_update"
on tenants for update
using (
  id = get_user_tenant_id()
  or get_user_role() = 'super_admin'
);

grant select, update on public.tenants to authenticated;

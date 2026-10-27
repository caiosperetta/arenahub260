-- ArenaHub — schema completo
-- Executar no Supabase SQL Editor

-- =========================================
-- EXTENSIONS
-- =========================================
create extension if not exists "pgcrypto";

-- =========================================
-- TABLES
-- =========================================

-- TENANTS (arenas)
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text default '#22C55E',
  plan text not null default 'basico' check (plan in ('basico','profissional','enterprise')),
  active boolean default true,
  created_at timestamptz default now()
);

-- PROFILES (all users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id),
  full_name text not null,
  phone text,
  role text not null default 'client' check (role in ('super_admin','admin','staff','client')),
  avatar_url text,
  created_at timestamptz default now()
);

-- COURTS
create table courts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  sport_type text not null,
  price_per_hour numeric not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- COURT SLOTS (available time slots per court)
create table court_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean default true
);

-- BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  court_id uuid not null references courts(id),
  client_id uuid not null references profiles(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','rejected')),
  notes text,
  price numeric not null,
  created_at timestamptz default now()
);

-- MONTHLY PLANS (mensalistas)
create table monthly_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid not null references profiles(id),
  court_id uuid not null references courts(id),
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  price_per_month numeric not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- =========================================
-- SECURITY DEFINER FUNCTIONS
-- Bypass RLS to avoid recursive policy errors (42P17)
-- =========================================

create or replace function get_user_role()
returns text
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function get_user_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from profiles where id = auth.uid();
$$;

-- =========================================
-- RLS POLICIES
-- Use SECURITY DEFINER functions, never query profiles table directly inside policies
-- =========================================

-- tenants
alter table tenants enable row level security;
create policy "tenant_select" on tenants for select using (id = get_user_tenant_id() or get_user_role() = 'super_admin');

-- profiles
alter table profiles enable row level security;
create policy "profiles_own" on profiles for select using (id = auth.uid() or get_user_tenant_id() = tenant_id);
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

-- courts
alter table courts enable row level security;
grant select, insert, update, delete on public.courts to authenticated;
create policy "courts_select_tenant" on courts for select using (tenant_id = get_user_tenant_id());
create policy "courts_insert_tenant" on courts for insert with check (tenant_id = get_user_tenant_id());
create policy "courts_update_tenant" on courts for update using (tenant_id = get_user_tenant_id());
create policy "courts_delete_tenant" on courts for delete using (tenant_id = get_user_tenant_id());
create policy "courts_public_select" on courts for select using (active = true);

-- court_slots
alter table court_slots enable row level security;
grant select, insert, update, delete on public.court_slots to authenticated;
create policy "slots_select_tenant" on court_slots for select using (tenant_id = get_user_tenant_id());
create policy "slots_insert_tenant" on court_slots for insert with check (tenant_id = get_user_tenant_id());
create policy "slots_delete_tenant" on court_slots for delete using (tenant_id = get_user_tenant_id());
create policy "slots_public_select" on court_slots for select using (active = true);

-- bookings
alter table bookings enable row level security;
create policy "bookings_client" on bookings for select using (client_id = auth.uid() or tenant_id = get_user_tenant_id());
create policy "bookings_insert" on bookings for insert with check (client_id = auth.uid());
create policy "bookings_update_admin" on bookings for update using (tenant_id = get_user_tenant_id() or get_user_role() = 'super_admin');

-- monthly_plans
alter table monthly_plans enable row level security;
create policy "plans_tenant" on monthly_plans for all using (tenant_id = get_user_tenant_id() or get_user_role() = 'super_admin');

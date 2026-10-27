-- ArenaHub — logo da arena
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

alter table tenants add column if not exists logo_url text;

grant update (logo_url) on public.tenants to authenticated;

-- =========================================
-- Supabase Storage — configuração manual
-- Run in Supabase Dashboard → Storage:
-- 1. Create bucket named "arena-logos" (public bucket)
-- 2. Authenticated users can upload to their tenant folder
-- 3. Public read access for all
-- =========================================

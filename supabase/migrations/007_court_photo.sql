-- ArenaHub — foto da quadra
-- Executar no Supabase SQL Editor (idempotente, seguro para rodar mais de uma vez)

alter table courts add column if not exists photo_url text;

grant update (photo_url) on public.courts to authenticated;

-- =========================================
-- Supabase Storage — configuração manual
-- Run in Supabase Dashboard → Storage:
-- 1. Create bucket named "court-photos" (public bucket)
-- 2. Add policy: authenticated users can upload to their tenant folder
--    e.g. storage.foldername(name)[1] = (select tenant_id::text from profiles where id = auth.uid())
-- 3. Public read access for all
-- =========================================

-- ============================================================
-- Elena Bakery — Bucket de imágenes de productos (opcional)
-- Necesario solo si quieres SUBIR imágenes desde el panel.
-- Si prefieres pegar URLs, no hace falta ejecutar esto.
-- Ejecutar en: Supabase Dashboard -> SQL Editor.
-- ============================================================

-- Bucket público (lectura abierta; escritura solo admin por políticas)
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

-- Nota: al ser bucket público, los archivos se sirven por su URL pública
-- (/storage/v1/object/public/productos/...) sin necesidad de una política
-- de SELECT. No agregamos una para evitar que se pueda LISTAR el bucket.

-- Subir / actualizar / borrar: solo administradores
drop policy if exists "productos_admin_insert" on storage.objects;
create policy "productos_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos_admin_update" on storage.objects;
create policy "productos_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos_admin_delete" on storage.objects;
create policy "productos_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'productos' and public.is_admin());

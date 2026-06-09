-- ============================================================
-- Elena Bakery — Días con agenda cerrada (cierre desde el panel)
-- Ejecutar en: Supabase Dashboard -> SQL Editor.
-- Idempotente.
--
-- El admin cierra/reabre días desde el calendario de carga del
-- dashboard. La tienda lee esta tabla y bloquea esas fechas en el
-- calendario de entrega (además de los bloqueos de la planilla
-- de Google, que siguen funcionando).
-- ============================================================

create table if not exists public.dias_bloqueados (
  fecha      date primary key,
  motivo     text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.dias_bloqueados to anon, authenticated;

alter table public.dias_bloqueados enable row level security;

-- La tienda (anónimos) necesita LEER los días cerrados
drop policy if exists dias_select on public.dias_bloqueados;
create policy dias_select on public.dias_bloqueados
  for select using (true);

-- Solo el admin cierra/reabre días
drop policy if exists dias_admin_all on public.dias_bloqueados;
create policy dias_admin_all on public.dias_bloqueados
  for all using (public.is_admin()) with check (public.is_admin());

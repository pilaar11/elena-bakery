-- ============================================================
-- Elena Bakery — Producción (Fase 1): control de abono
-- Ejecutar en: Supabase Dashboard -> SQL Editor.
-- Idempotente.
--
-- Un pedido entra a producción solo cuando se recibió el abono (50%).
-- Agregamos el estado de pago del abono y su fecha.
-- ============================================================

alter table public.pedidos
  add column if not exists abono_pagado boolean not null default false,
  add column if not exists fecha_abono  timestamptz;

create index if not exists idx_pedidos_fecha_entrega on public.pedidos (fecha_entrega);
create index if not exists idx_pedidos_abono_pagado   on public.pedidos (abono_pagado);

-- Las políticas RLS existentes ya cubren estas columnas:
--   - El admin puede actualizarlas (policy pedidos_admin_all).
--   - La tienda inserta con abono_pagado = false por defecto.

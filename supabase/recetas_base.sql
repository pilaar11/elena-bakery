-- ============================================================
-- Elena Bakery — Producción (Fase 2): base / masa compartida
-- Ejecutar en: Supabase Dashboard -> SQL Editor (después de produccion.sql)
-- Idempotente.
--
-- "base" agrupa los productos que comparten el mismo bizcocho/masa, para
-- consolidar la producción (ej: 4 tortas distintas = 4 bizcochos clásicos).
-- Se puede editar luego desde el panel (campo "Base / masa" del producto).
-- ============================================================

alter table public.productos    add column if not exists base text;
alter table public.pedido_items add column if not exists base text;

-- Asignación inicial de base por producto (según las recetas)
update public.productos as p set base = v.base
from (values
  ('PROD-012','Caluga (sin horno)'),
  ('PROD-011','Bizcocho chocolate'),
  ('PROD-025','Bizcocho chocolate'),
  ('PROD-017','Bizcocho red velvet'),
  ('PROD-019','Bizcocho zanahoria'),
  ('PROD-034','Bizcocho zanahoria'),
  ('PROD-032','Bizcocho zanahoria s/azúcar'),
  ('PROD-033','Bizcocho zanahoria s/azúcar'),
  ('PROD-001','Bizcocho clásico s/azúcar'),
  ('PROD-035','Bizcocho clásico s/azúcar'),
  ('PROD-036','Bizcocho clásico s/azúcar'),
  ('PROD-009','Bizcocho clásico'),
  ('PROD-007','Bizcocho clásico'),
  ('PROD-008','Bizcocho clásico'),
  ('PROD-004','Bizcocho clásico'),
  ('PROD-006','Bizcocho clásico'),
  ('PROD-005','Bizcocho clásico'),
  ('PROD-018','Bizcocho Matilda'),
  ('PROD-010','Bizcocho Matilda'),
  ('PROD-027','Hojarasca'),
  ('PROD-030','Hojarasca'),
  ('PROD-031','Hojarasca'),
  ('PROD-015','Panqueque naranja'),
  ('PROD-016','Panqueque chocolate'),
  ('PROD-020','Cheesecake (base galleta)'),
  ('PROD-021','Cheesecake (base galleta)'),
  ('PROD-022','Cheesecake (base galleta)'),
  ('PROD-002','Masa sablé'),
  ('PROD-023','Masa sablé'),
  ('PROD-003','Masa kuchen'),
  ('PROD-026','Masa choux'),
  ('PROD-028','Masa cinnamon roll'),
  ('PROD-029','Masa cinnamon roll'),
  ('PROD-013','Masa galleta (Oreo)'),
  ('PROD-014','Masa berlín'),
  ('PROD-024','Masa alfajor'),
  ('PROD-037','Sin masa (galleta comercial)'),
  ('PROD-038','Sin masa (galleta comercial)')
) as v(codigo, base)
where p.codigo = v.codigo;

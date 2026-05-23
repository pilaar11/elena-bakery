-- ============================================================
-- Elena Bakery — Protección anti-spam para pedidos públicos
-- Ejecutar en: Supabase Dashboard -> SQL Editor (después de schema.sql)
-- Idempotente.
--
-- Estrategia en capas (sin servidor):
--   1) Las inserciones requieren una sesión autenticada (incluida la
--      "anónima" de Supabase). Esto habilita el rate-limit y el CAPTCHA
--      gestionados por Supabase Auth.  -> ver pasos del dashboard abajo.
--   2) Triggers en la BD: validan los datos y limitan la frecuencia.
-- ============================================================

-- ----- (1) RLS: insertar solo con sesión (anon-auth o usuario) -----
-- Pedidos
drop policy if exists pedidos_insert_public on public.pedidos;
drop policy if exists pedidos_insert_auth   on public.pedidos;
create policy pedidos_insert_auth on public.pedidos
  for insert to authenticated with check (true);

-- Clientes
drop policy if exists clientes_insert_public on public.clientes;
drop policy if exists clientes_insert_auth   on public.clientes;
create policy clientes_insert_auth on public.clientes
  for insert to authenticated with check (true);

-- Items de pedido
drop policy if exists items_insert_public on public.pedido_items;
drop policy if exists items_insert_auth   on public.pedido_items;
create policy items_insert_auth on public.pedido_items
  for insert to authenticated with check (true);

-- ----- (2a) Validación + rate-limit en pedidos -----
-- SECURITY DEFINER para poder contar pedidos recientes aunque el rol
-- anónimo no tenga permiso de SELECT sobre la tabla.
create or replace function public.pedidos_antispam()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recientes_tel int;
  recientes_glob int;
begin
  -- Validaciones de cordura
  if new.total < 0 or new.total > 5000000 then
    raise exception 'Total fuera de rango';
  end if;
  if new.abono < 0 or new.abono > new.total then
    raise exception 'Abono inválido';
  end if;
  if length(coalesce(new.detalle, '')) > 4000
     or length(coalesce(new.notas, '')) > 2000 then
    raise exception 'Texto demasiado largo';
  end if;
  if length(coalesce(new.telefono, '')) > 30 then
    raise exception 'Teléfono inválido';
  end if;

  -- Límite por teléfono: máx 5 pedidos en 10 minutos
  if coalesce(new.telefono, '') <> '' then
    select count(*) into recientes_tel
    from public.pedidos
    where telefono = new.telefono
      and created_at > now() - interval '10 minutes';
    if recientes_tel >= 5 then
      raise exception 'Demasiados pedidos recientes desde este teléfono. Intenta más tarde.';
    end if;
  end if;

  -- Tope global de seguridad: máx 30 pedidos por minuto
  select count(*) into recientes_glob
  from public.pedidos
  where created_at > now() - interval '1 minute';
  if recientes_glob >= 30 then
    raise exception 'Servicio ocupado. Intenta nuevamente en unos minutos.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pedidos_antispam on public.pedidos;
create trigger trg_pedidos_antispam
  before insert on public.pedidos
  for each row execute function public.pedidos_antispam();

-- ----- (2b) Validación de items -----
create or replace function public.pedido_items_validate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare cnt int;
begin
  if new.qty < 1 or new.qty > 100 then
    raise exception 'Cantidad inválida';
  end if;
  if new.precio_unit < 0 or new.precio_unit > 5000000 then
    raise exception 'Precio inválido';
  end if;
  if length(coalesce(new.nombre, '')) > 200 then
    raise exception 'Nombre demasiado largo';
  end if;
  select count(*) into cnt from public.pedido_items where pedido_id = new.pedido_id;
  if cnt >= 50 then
    raise exception 'Demasiados ítems en el pedido';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedido_items_validate on public.pedido_items;
create trigger trg_pedido_items_validate
  before insert on public.pedido_items
  for each row execute function public.pedido_items_validate();

-- ----- (2c) Validación de clientes -----
create or replace function public.clientes_validate()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if length(coalesce(new.nombre, '')) > 120
     or length(coalesce(new.telefono, '')) > 30
     or length(coalesce(new.email, '')) > 160 then
    raise exception 'Datos de cliente inválidos';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clientes_validate on public.clientes;
create trigger trg_clientes_validate
  before insert on public.clientes
  for each row execute function public.clientes_validate();

-- ----- (2d) Endurecimiento: estas funciones solo deben correr como
-- triggers. El rol que inserta NO necesita EXECUTE para que el trigger
-- se dispare, así que las quitamos del API (evita /rest/v1/rpc/...).
revoke all on function public.pedidos_antispam()      from public, anon, authenticated;
revoke all on function public.pedido_items_validate() from public, anon, authenticated;
revoke all on function public.clientes_validate()     from public, anon, authenticated;

-- ============================================================
-- PASOS EN EL DASHBOARD (para activar la capa 1):
--   Authentication -> Sign In / Providers -> Anonymous Sign-ins: ENABLE
--   Authentication -> Attack Protection -> Enable CAPTCHA (hCaptcha/Turnstile)
-- La tienda (al conectarla) llamará a supabase.auth.signInAnonymously()
-- antes de guardar el pedido. Así Supabase aplica rate-limit + CAPTCHA.
-- ============================================================

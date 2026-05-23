-- ============================================================
-- Elena Bakery — Esquema Supabase (tablas + RLS + auth admin)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Es idempotente: se puede volver a ejecutar sin romper nada.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- PERFILES (vinculados a auth.users) + rol admin
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  nombre     text,
  role       text not null default 'cliente' check (role in ('cliente','admin')),
  created_at timestamptz not null default now()
);

-- Al crearse un usuario en Auth, se genera su perfil.
-- El correo del administrador inicial se auto-promueve a 'admin'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = 'pilarvm1147@gmail.com' then 'admin' else 'cliente' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- handle_new_user solo corre como trigger; no debe exponerse vía RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Helper: ¿el usuario actual es admin?
-- SECURITY DEFINER -> evita recursión de RLS al leer profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- PRODUCTOS
-- ============================================================
create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique,
  nombre      text not null,
  categoria   text not null,
  descripcion text,
  precio      integer not null default 0,
  porciones   integer,
  emoji       text,
  badge       text,
  imagen_url  text,
  stock       integer not null default 0,
  destacado   boolean not null default false,
  activo      boolean not null default true,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CLIENTES
-- ============================================================
create table if not exists public.clientes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text,
  telefono   text,
  email      text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PEDIDOS
-- ============================================================
create table if not exists public.pedidos (
  id            uuid primary key default gen_random_uuid(),
  numero        text unique,
  cliente_id    uuid references public.clientes(id) on delete set null,
  telefono      text,
  fecha_entrega date,
  total         integer not null default 0,
  abono         integer not null default 0,
  estado        text not null default 'pendiente'
                check (estado in ('pendiente','confirmado','en_preparacion','listo','entregado','cancelado')),
  detalle       text,
  notas         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.pedido_items (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  nombre      text not null,
  porciones   integer,
  qty         integer not null default 1,
  opciones    text,
  precio_unit integer not null default 0
);

-- ============================================================
-- CONFIGURACIÓN GENERAL (fila única id = 1)
-- ============================================================
create table if not exists public.configuracion (
  id             integer primary key default 1 check (id = 1),
  nombre_tienda  text default 'Elena Bakery',
  telefono       text,
  email          text,
  whatsapp       text,
  instagram      text,
  direccion      text,
  horario        text,
  abono_pct      numeric not null default 0.5,
  mensaje_banner text,
  updated_at     timestamptz not null default now()
);

insert into public.configuracion (id) values (1) on conflict (id) do nothing;

-- Índices
create index if not exists idx_pedidos_created    on public.pedidos (created_at desc);
create index if not exists idx_pedidos_estado     on public.pedidos (estado);
create index if not exists idx_productos_categoria on public.productos (categoria);

-- ============================================================
-- GRANTS para los roles de la API (RLS hace el control real)
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.productos     enable row level security;
alter table public.clientes      enable row level security;
alter table public.pedidos       enable row level security;
alter table public.pedido_items  enable row level security;
alter table public.configuracion enable row level security;

-- ---- profiles: cada quien ve el suyo; admin ve/edita todos ----
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- productos: lectura pública solo de activos; admin todo ----
drop policy if exists productos_select on public.productos;
create policy productos_select on public.productos
  for select using (activo = true or public.is_admin());

drop policy if exists productos_admin_all on public.productos;
create policy productos_admin_all on public.productos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- configuracion: lectura pública; solo admin modifica ----
drop policy if exists config_select on public.configuracion;
create policy config_select on public.configuracion
  for select using (true);

drop policy if exists config_admin_all on public.configuracion;
create policy config_admin_all on public.configuracion
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- clientes: alta pública (checkout); solo admin lee/edita ----
drop policy if exists clientes_insert_public on public.clientes;
create policy clientes_insert_public on public.clientes
  for insert with check (true);

drop policy if exists clientes_admin_all on public.clientes;
create policy clientes_admin_all on public.clientes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- pedidos: alta pública (checkout); solo admin lee/edita ----
drop policy if exists pedidos_insert_public on public.pedidos;
create policy pedidos_insert_public on public.pedidos
  for insert with check (true);

drop policy if exists pedidos_admin_all on public.pedidos;
create policy pedidos_admin_all on public.pedidos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- pedido_items: alta pública; solo admin lee/edita ----
drop policy if exists items_insert_public on public.pedido_items;
create policy items_insert_public on public.pedido_items
  for insert with check (true);

drop policy if exists items_admin_all on public.pedido_items;
create policy items_admin_all on public.pedido_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Promover al administrador si el usuario ya existía antes
-- de instalar el trigger (idempotente).
-- ============================================================
insert into public.profiles (id, email, role)
  select id, email, 'admin' from auth.users where email = 'pilarvm1147@gmail.com'
  on conflict (id) do update set role = 'admin';

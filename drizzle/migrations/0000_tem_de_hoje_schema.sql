
create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('admin','comerciante');
create type public.establishment_status as enum ('pendente','aprovado','rejeitado','suspenso');
create type public.establishment_type as enum ('padaria','cafeteria','confeitaria');
create type public.kit_status as enum ('rascunho','publicado','encerrado');
create type public.reservation_status as enum ('reservada','retirada','cancelada');
create type public.request_status as enum ('nova','aprovada','rejeitada');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Faça login primeiro.'; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'admin') then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;

create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  nome text not null check (char_length(nome) between 2 and 120),
  tipo public.establishment_type not null default 'padaria',
  descricao text not null default '',
  endereco text not null check (char_length(endereco) between 3 and 200),
  bairro text not null check (char_length(bairro) between 2 and 80),
  cidade text not null default 'São Paulo',
  telefone text not null default '',
  horario_funcionamento text not null default '',
  status public.establishment_status not null default 'pendente',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index establishments_one_per_owner on public.establishments(owner_id) where owner_id is not null;
grant select, update on public.establishments to authenticated;
grant all on public.establishments to service_role;
alter table public.establishments enable row level security;

create policy "owner or admin read est" on public.establishments for select to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin update est" on public.establishments for update to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create table public.kits (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  descricao text not null default '',
  imagem text,
  preco numeric(10,2) not null check (preco > 0),
  preco_referencia numeric(10,2) check (preco_referencia is null or preco_referencia > 0),
  estoque_total integer not null default 0 check (estoque_total >= 0),
  diario boolean not null default false,
  data_disponibilidade date,
  retirada_inicio time not null,
  retirada_fim time not null,
  ingredientes text not null default '',
  alergenicos text not null default '',
  conservacao text not null default '',
  status public.kit_status not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (retirada_fim > retirada_inicio)
);
create index kits_est_idx on public.kits(establishment_id);
create index kits_status_idx on public.kits(status);
grant select on public.kits to authenticated;
grant all on public.kits to service_role;
alter table public.kits enable row level security;
create policy "owner or admin read kits" on public.kits for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));

create table public.kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 100),
  quantidade numeric(10,2) not null check (quantidade > 0),
  unidade text not null default 'un',
  ordem integer not null default 0
);
create index kit_items_kit_idx on public.kit_items(kit_id);
grant select on public.kit_items to authenticated;
grant all on public.kit_items to service_role;
alter table public.kit_items enable row level security;
create policy "owner or admin read items" on public.kit_items for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.kits k join public.establishments e on e.id = k.establishment_id where k.id = kit_id and e.owner_id = auth.uid()));

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  public_id uuid not null unique default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete restrict,
  establishment_id uuid not null references public.establishments(id) on delete restrict,
  nome_consumidor text not null check (char_length(nome_consumidor) between 2 and 100),
  telefone_consumidor text not null check (char_length(telefone_consumidor) between 10 and 20),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null,
  codigo_confirmacao text not null,
  lookup_token_hash text not null,
  idempotency_key uuid not null unique,
  data_retirada date not null,
  status public.reservation_status not null default 'reservada',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);
create index reservations_kit_idx on public.reservations(kit_id, status);
create index reservations_est_idx on public.reservations(establishment_id, status);
create index reservations_phone_idx on public.reservations(telefone_consumidor, created_at);
grant select on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;
create policy "owner or admin read reservations" on public.reservations for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid()));

create table public.partner_requests (
  id uuid primary key default gen_random_uuid(),
  estabelecimento text not null check (char_length(estabelecimento) between 2 and 120),
  responsavel text not null check (char_length(responsavel) between 2 and 100),
  telefone text not null check (char_length(telefone) between 10 and 20),
  bairro text not null check (char_length(bairro) between 2 and 80),
  tipo public.establishment_type not null,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status public.request_status not null default 'nova',
  created_at timestamptz not null default now()
);
create index partner_requests_phone_idx on public.partner_requests(telefone, created_at);
grant select, update on public.partner_requests to authenticated;
grant all on public.partner_requests to service_role;
alter table public.partner_requests enable row level security;
create policy "admin read requests" on public.partner_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update requests" on public.partner_requests for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.sp_today() returns date language sql stable set search_path = public as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create or replace function public.kit_committed(_kit_id uuid) returns integer
language sql stable security definer set search_path = public as $$
  select coalesce(sum(quantidade),0)::int from public.reservations where kit_id = _kit_id and status in ('reservada','retirada')
$$;

create or replace function public.kit_is_public(k public.kits) returns boolean
language sql stable security definer set search_path = public as $$
  select k.status = 'publicado'
    and exists (select 1 from public.establishments e where e.id = k.establishment_id and e.status = 'aprovado')
    and (k.diario or (k.data_disponibilidade is not null and k.data_disponibilidade >= public.sp_today()))
$$;

create or replace function public.list_public_kits()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x->>'created_at'), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', k.id, 'nome', k.nome, 'descricao', k.descricao, 'imagem', k.imagem,
      'preco', k.preco, 'preco_referencia', k.preco_referencia,
      'disponivel', greatest(k.estoque_total - public.kit_committed(k.id), 0),
      'estoque_total', k.estoque_total,
      'data_retirada', case when k.diario then public.sp_today() else k.data_disponibilidade end,
      'retirada_inicio', k.retirada_inicio, 'retirada_fim', k.retirada_fim,
      'created_at', k.created_at,
      'establishment', jsonb_build_object('id', e.id, 'nome', e.nome, 'tipo', e.tipo, 'bairro', e.bairro, 'is_demo', e.is_demo)
    ) x
    from public.kits k join public.establishments e on e.id = k.establishment_id
    where public.kit_is_public(k)
  ) s
$$;
grant execute on function public.list_public_kits() to anon, authenticated;

create or replace function public.get_public_kit(_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
      'id', k.id, 'nome', k.nome, 'descricao', k.descricao, 'imagem', k.imagem,
      'preco', k.preco, 'preco_referencia', k.preco_referencia,
      'disponivel', greatest(k.estoque_total - public.kit_committed(k.id), 0),
      'estoque_total', k.estoque_total,
      'data_retirada', case when k.diario then public.sp_today() else k.data_disponibilidade end,
      'retirada_inicio', k.retirada_inicio, 'retirada_fim', k.retirada_fim,
      'ingredientes', k.ingredientes, 'alergenicos', k.alergenicos, 'conservacao', k.conservacao,
      'items', coalesce((select jsonb_agg(jsonb_build_object('nome', i.nome, 'quantidade', i.quantidade, 'unidade', i.unidade) order by i.ordem) from public.kit_items i where i.kit_id = k.id), '[]'::jsonb),
      'establishment', jsonb_build_object('id', e.id, 'nome', e.nome, 'tipo', e.tipo, 'bairro', e.bairro, 'endereco', e.endereco, 'cidade', e.cidade, 'horario_funcionamento', e.horario_funcionamento, 'is_demo', e.is_demo)
  )
  from public.kits k join public.establishments e on e.id = k.establishment_id
  where k.id = _id and public.kit_is_public(k)
$$;
grant execute on function public.get_public_kit(uuid) to anon, authenticated;

create or replace function public.create_reservation(
  _kit_id uuid, _nome text, _telefone text, _quantidade integer, _idempotency_key uuid, _lookup_token text, _aceite boolean
) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  k public.kits%rowtype;
  existing public.reservations%rowtype;
  committed int;
  phone text := regexp_replace(coalesce(_telefone,''), '\D', '', 'g');
  nm text := btrim(coalesce(_nome,''));
  code text;
  r public.reservations%rowtype;
begin
  if _idempotency_key is null or _lookup_token is null or char_length(_lookup_token) < 32 then
    raise exception 'Requisição inválida.';
  end if;
  select * into existing from public.reservations where idempotency_key = _idempotency_key;
  if found then
    if existing.lookup_token_hash <> encode(digest(_lookup_token,'sha256'),'hex') then
      raise exception 'Requisição inválida.';
    end if;
    return jsonb_build_object('public_id', existing.public_id, 'duplicada', true);
  end if;
  if not coalesce(_aceite,false) then raise exception 'Confirme a ciência das condições de retirada.'; end if;
  if char_length(nm) < 2 or char_length(nm) > 100 then raise exception 'Informe seu nome.'; end if;
  if char_length(phone) < 10 or char_length(phone) > 13 then raise exception 'Informe um telefone válido com DDD.'; end if;
  if _quantidade is null or _quantidade < 1 or _quantidade > 10 then raise exception 'Quantidade inválida.'; end if;

  select * into k from public.kits where id = _kit_id for update;
  if not found or not public.kit_is_public(k) then raise exception 'Este kit não está mais disponível.'; end if;

  if (select count(*) from public.reservations where telefone_consumidor = phone and status = 'reservada' and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Limite de reservas ativas para este telefone atingido. Tente novamente mais tarde.';
  end if;

  committed := public.kit_committed(k.id);
  if committed + _quantidade > k.estoque_total then
    if k.estoque_total - committed <= 0 then
      raise exception 'Esse kit já foi reservado por completo.';
    end if;
    raise exception 'Só restam % unidade(s) deste kit.', k.estoque_total - committed;
  end if;

  loop
    code := upper(substr(encode(gen_random_bytes(6),'hex'),1,6));
    exit when not exists (select 1 from public.reservations where codigo_confirmacao = code and establishment_id = k.establishment_id and status = 'reservada');
  end loop;

  insert into public.reservations (kit_id, establishment_id, nome_consumidor, telefone_consumidor, quantidade, preco_unitario, codigo_confirmacao, lookup_token_hash, idempotency_key, data_retirada)
  values (k.id, k.establishment_id, nm, phone, _quantidade, k.preco, code,
    encode(digest(_lookup_token,'sha256'),'hex'), _idempotency_key,
    case when k.diario then public.sp_today() else k.data_disponibilidade end)
  returning * into r;
  return jsonb_build_object('public_id', r.public_id, 'duplicada', false);
end $$;
grant execute on function public.create_reservation(uuid,text,text,integer,uuid,text,boolean) to anon, authenticated;

create or replace function public.get_reservation(_public_id uuid, _token text)
returns jsonb language plpgsql stable security definer set search_path = public, extensions as $$
declare r public.reservations%rowtype; res jsonb;
begin
  select * into r from public.reservations where public_id = _public_id;
  if not found or _token is null or r.lookup_token_hash <> encode(digest(_token,'sha256'),'hex') then
    return null;
  end if;
  select jsonb_build_object(
    'public_id', r.public_id, 'codigo', r.codigo_confirmacao, 'status', r.status,
    'quantidade', r.quantidade, 'preco_unitario', r.preco_unitario, 'nome', split_part(r.nome_consumidor,' ',1),
    'data_retirada', r.data_retirada, 'created_at', r.created_at, 'completed_at', r.completed_at,
    'kit', jsonb_build_object('id', k.id, 'nome', k.nome, 'imagem', k.imagem, 'retirada_inicio', k.retirada_inicio, 'retirada_fim', k.retirada_fim, 'conservacao', k.conservacao,
      'items', coalesce((select jsonb_agg(jsonb_build_object('nome', i.nome, 'quantidade', i.quantidade, 'unidade', i.unidade) order by i.ordem) from public.kit_items i where i.kit_id = k.id), '[]'::jsonb)),
    'establishment', jsonb_build_object('nome', e.nome, 'endereco', e.endereco, 'bairro', e.bairro, 'cidade', e.cidade, 'telefone', e.telefone)
  ) into res
  from public.kits k join public.establishments e on e.id = k.establishment_id where k.id = r.kit_id;
  return res;
end $$;
grant execute on function public.get_reservation(uuid,text) to anon, authenticated;

create or replace function public.cancel_reservation_by_token(_public_id uuid, _token text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare r public.reservations%rowtype;
begin
  select * into r from public.reservations where public_id = _public_id for update;
  if not found or _token is null or r.lookup_token_hash <> encode(digest(_token,'sha256'),'hex') then
    raise exception 'Reserva não encontrada.';
  end if;
  if r.status <> 'reservada' then raise exception 'Esta reserva não pode mais ser cancelada.'; end if;
  update public.reservations set status = 'cancelada', cancelled_at = now() where id = r.id;
end $$;
grant execute on function public.cancel_reservation_by_token(uuid,text) to anon, authenticated;

create or replace function public.can_manage_establishment(_est uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'admin') or exists (select 1 from public.establishments where id = _est and owner_id = auth.uid())
$$;

create or replace function public.mark_reservation_picked_up(_id uuid, _codigo text)
returns void language plpgsql security definer set search_path = public as $$
declare r public.reservations%rowtype;
begin
  select * into r from public.reservations where id = _id for update;
  if not found or not public.can_manage_establishment(r.establishment_id) then raise exception 'Reserva não encontrada.'; end if;
  if r.status = 'retirada' then raise exception 'Esta retirada já foi concluída.'; end if;
  if r.status = 'cancelada' then raise exception 'Uma reserva cancelada não pode ser marcada como retirada.'; end if;
  if upper(btrim(coalesce(_codigo,''))) <> r.codigo_confirmacao then raise exception 'Código de confirmação incorreto.'; end if;
  update public.reservations set status = 'retirada', completed_at = now() where id = r.id;
end $$;
revoke execute on function public.mark_reservation_picked_up(uuid,text) from public, anon;
grant execute on function public.mark_reservation_picked_up(uuid,text) to authenticated;

create or replace function public.cancel_reservation(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.reservations%rowtype;
begin
  select * into r from public.reservations where id = _id for update;
  if not found or not public.can_manage_establishment(r.establishment_id) then raise exception 'Reserva não encontrada.'; end if;
  if r.status = 'cancelada' then raise exception 'Esta reserva já foi cancelada.'; end if;
  if r.status = 'retirada' then raise exception 'Uma reserva já retirada não pode ser cancelada.'; end if;
  update public.reservations set status = 'cancelada', cancelled_at = now() where id = r.id;
end $$;
revoke execute on function public.cancel_reservation(uuid) from public, anon;
grant execute on function public.cancel_reservation(uuid) to authenticated;

create or replace function public.save_kit(_id uuid, _data jsonb, _items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  est public.establishments%rowtype;
  kid uuid := _id;
  st public.kit_status := coalesce((_data->>'status')::public.kit_status, 'rascunho');
  v_estoque int := coalesce((_data->>'estoque_total')::int, 0);
  v_preco numeric := (_data->>'preco')::numeric;
  v_pref numeric := nullif(_data->>'preco_referencia','')::numeric;
  v_diario boolean := coalesce((_data->>'diario')::boolean, false);
  v_dt date := nullif(_data->>'data_disponibilidade','')::date;
  v_ini time := nullif(_data->>'retirada_inicio','')::time;
  v_fim time := nullif(_data->>'retirada_fim','')::time;
  it jsonb; n int := 0; idx int := 0; v_comm int;
begin
  if auth.uid() is null then raise exception 'Faça login.'; end if;
  if kid is null then
    select * into est from public.establishments where owner_id = auth.uid();
    if not found then raise exception 'Cadastre seu estabelecimento antes de criar kits.'; end if;
  else
    perform 1 from public.kits where id = kid for update;
    select e.* into est from public.kits k join public.establishments e on e.id = k.establishment_id where k.id = kid;
    if not found or est.owner_id is distinct from auth.uid() then raise exception 'Kit não encontrado.'; end if;
  end if;
  if est.status in ('suspenso','rejeitado') then raise exception 'Seu estabelecimento não está ativo.'; end if;

  if char_length(btrim(coalesce(_data->>'nome',''))) < 2 then raise exception 'Informe o nome do kit.'; end if;
  if v_preco is null or v_preco <= 0 then raise exception 'O preço deve ser maior que zero.'; end if;
  if v_pref is not null and v_pref <= v_preco then raise exception 'O preço de referência deve ser maior que o preço de venda.'; end if;
  if v_estoque < 0 then raise exception 'Estoque inválido.'; end if;
  if v_ini is null or v_fim is null then raise exception 'Informe a janela de retirada.'; end if;
  if v_fim <= v_ini then raise exception 'O horário final da retirada deve ser posterior ao inicial.'; end if;
  if not v_diario and v_dt is null then raise exception 'Informe a data de disponibilidade.'; end if;
  if jsonb_typeof(_items) <> 'array' then raise exception 'Itens inválidos.'; end if;
  for it in select * from jsonb_array_elements(_items) loop
    if char_length(btrim(coalesce(it->>'nome',''))) < 1 then raise exception 'Todo item precisa de um nome.'; end if;
    if coalesce((it->>'quantidade')::numeric,0) <= 0 then raise exception 'A quantidade de cada item deve ser positiva.'; end if;
    n := n + 1;
  end loop;
  if st = 'publicado' then
    if n < 1 then raise exception 'Cadastre pelo menos um item para publicar.'; end if;
    if v_estoque < 1 then raise exception 'Para publicar, o estoque deve ser maior que zero.'; end if;
    if not v_diario and v_dt < public.sp_today() then raise exception 'A data de disponibilidade já passou.'; end if;
    if est.status <> 'aprovado' then raise exception 'Seu estabelecimento ainda não foi aprovado. Salve como rascunho por enquanto.'; end if;
  end if;
  if kid is not null then
    v_comm := public.kit_committed(kid);
    if v_estoque < v_comm then
      raise exception 'O estoque não pode ser menor que as % unidade(s) já reservadas.', v_comm;
    end if;
  end if;

  if kid is null then
    insert into public.kits (establishment_id, nome, descricao, imagem, preco, preco_referencia, estoque_total, diario, data_disponibilidade, retirada_inicio, retirada_fim, ingredientes, alergenicos, conservacao, status)
    values (est.id, btrim(_data->>'nome'), coalesce(_data->>'descricao',''), nullif(_data->>'imagem',''), v_preco, v_pref, v_estoque, v_diario, v_dt, v_ini, v_fim,
      coalesce(_data->>'ingredientes',''), coalesce(_data->>'alergenicos',''), coalesce(_data->>'conservacao',''), st)
    returning id into kid;
  else
    update public.kits set nome = btrim(_data->>'nome'), descricao = coalesce(_data->>'descricao',''), imagem = nullif(_data->>'imagem',''),
      preco = v_preco, preco_referencia = v_pref, estoque_total = v_estoque, diario = v_diario, data_disponibilidade = v_dt,
      retirada_inicio = v_ini, retirada_fim = v_fim, ingredientes = coalesce(_data->>'ingredientes',''), alergenicos = coalesce(_data->>'alergenicos',''),
      conservacao = coalesce(_data->>'conservacao',''), status = st, updated_at = now()
    where id = kid;
    delete from public.kit_items where kit_id = kid;
  end if;
  for it in select * from jsonb_array_elements(_items) loop
    insert into public.kit_items (kit_id, nome, quantidade, unidade, ordem)
    values (kid, btrim(it->>'nome'), (it->>'quantidade')::numeric, coalesce(nullif(btrim(it->>'unidade'),''),'un'), idx);
    idx := idx + 1;
  end loop;
  return kid;
end $$;
revoke execute on function public.save_kit(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.save_kit(uuid,jsonb,jsonb) to authenticated;

create or replace function public.set_kit_status(_id uuid, _status public.kit_status)
returns void language plpgsql security definer set search_path = public as $$
declare k public.kits%rowtype; est public.establishments%rowtype; n int;
begin
  select * into k from public.kits where id = _id for update;
  if not found then raise exception 'Kit não encontrado.'; end if;
  select * into est from public.establishments where id = k.establishment_id;
  if not (est.owner_id is not distinct from auth.uid() and auth.uid() is not null or public.has_role(auth.uid(),'admin')) then raise exception 'Kit não encontrado.'; end if;
  if _status = 'publicado' then
    select count(*) into n from public.kit_items where kit_id = k.id;
    if n < 1 then raise exception 'Cadastre pelo menos um item para publicar.'; end if;
    if k.estoque_total < 1 then raise exception 'Para publicar, o estoque deve ser maior que zero.'; end if;
    if not k.diario and (k.data_disponibilidade is null or k.data_disponibilidade < public.sp_today()) then raise exception 'Atualize a data de disponibilidade antes de publicar.'; end if;
    if est.status <> 'aprovado' then raise exception 'O estabelecimento ainda não foi aprovado.'; end if;
  end if;
  update public.kits set status = _status, updated_at = now() where id = k.id;
end $$;
revoke execute on function public.set_kit_status(uuid,public.kit_status) from public, anon;
grant execute on function public.set_kit_status(uuid,public.kit_status) to authenticated;

create or replace function public.register_establishment(_data jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare eid uuid;
begin
  if auth.uid() is null then raise exception 'Faça login.'; end if;
  if char_length(btrim(coalesce(_data->>'nome',''))) < 2 then raise exception 'Informe o nome comercial.'; end if;
  if char_length(btrim(coalesce(_data->>'endereco',''))) < 3 then raise exception 'Informe o endereço.'; end if;
  if char_length(btrim(coalesce(_data->>'bairro',''))) < 2 then raise exception 'Informe o bairro.'; end if;
  select id into eid from public.establishments where owner_id = auth.uid();
  if eid is not null then
    update public.establishments set nome = btrim(_data->>'nome'), tipo = (_data->>'tipo')::public.establishment_type,
      descricao = coalesce(_data->>'descricao',''), endereco = btrim(_data->>'endereco'), bairro = btrim(_data->>'bairro'),
      cidade = coalesce(nullif(btrim(_data->>'cidade'),''),'São Paulo'), telefone = coalesce(_data->>'telefone',''),
      horario_funcionamento = coalesce(_data->>'horario_funcionamento','')
    where id = eid;
  else
    insert into public.establishments (owner_id, nome, tipo, descricao, endereco, bairro, cidade, telefone, horario_funcionamento, status)
    values (auth.uid(), btrim(_data->>'nome'), (_data->>'tipo')::public.establishment_type, coalesce(_data->>'descricao',''),
      btrim(_data->>'endereco'), btrim(_data->>'bairro'), coalesce(nullif(btrim(_data->>'cidade'),''),'São Paulo'),
      coalesce(_data->>'telefone',''), coalesce(_data->>'horario_funcionamento',''), 'pendente')
    returning id into eid;
    insert into public.user_roles (user_id, role) values (auth.uid(), 'comerciante') on conflict do nothing;
  end if;
  return eid;
end $$;
revoke execute on function public.register_establishment(jsonb) from public, anon;
grant execute on function public.register_establishment(jsonb) to authenticated;

create or replace function public.submit_partner_request(_data jsonb, _website text)
returns void language plpgsql security definer set search_path = public as $$
declare phone text := regexp_replace(coalesce(_data->>'telefone',''), '\D', '', 'g');
begin
  if coalesce(_website,'') <> '' then return; end if;
  if char_length(phone) < 10 or char_length(phone) > 13 then raise exception 'Informe um telefone válido com DDD.'; end if;
  if (select count(*) from public.partner_requests where telefone = phone and created_at > now() - interval '1 day') >= 2 then
    raise exception 'Já recebemos sua solicitação. Em breve entraremos em contato.';
  end if;
  if (select count(*) from public.partner_requests where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'Muitas solicitações no momento. Tente novamente em instantes.';
  end if;
  insert into public.partner_requests (estabelecimento, responsavel, telefone, bairro, tipo, email)
  values (btrim(_data->>'estabelecimento'), btrim(_data->>'responsavel'), phone, btrim(_data->>'bairro'),
    (_data->>'tipo')::public.establishment_type, nullif(lower(btrim(_data->>'email')),''));
end $$;
grant execute on function public.submit_partner_request(jsonb,text) to anon, authenticated;

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Acesso negado.'; end if;
  return jsonb_build_object(
    'estabelecimentos', (select count(*) from public.establishments),
    'aprovados', (select count(*) from public.establishments where status = 'aprovado'),
    'pendentes', (select count(*) from public.establishments where status = 'pendente'),
    'kits_publicados', (select count(*) from public.kits where status = 'publicado'),
    'reservas', (select count(*) from public.reservations),
    'reservas_ativas', (select count(*) from public.reservations where status = 'reservada'),
    'concluidas', (select count(*) from public.reservations where status = 'retirada'),
    'canceladas', (select count(*) from public.reservations where status = 'cancelada'),
    'kits_retirados', (select coalesce(sum(quantidade),0) from public.reservations where status = 'retirada'),
    'solicitacoes_novas', (select count(*) from public.partner_requests where status = 'nova')
  );
end $$;
revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

revoke execute on function public.kit_committed(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

insert into public.establishments (id, owner_id, nome, tipo, descricao, endereco, bairro, cidade, telefone, horario_funcionamento, status, is_demo) values
 ('11111111-1111-4111-8111-111111111111', null, 'Padaria Vila Verde', 'padaria', 'Padaria de bairro fictícia, com pães saindo do forno o dia todo.', 'Rua Fictícia das Flores, 100', 'Vila Mariana', 'São Paulo', '(11) 0000-0001', 'Seg a sáb, 6h às 20h', 'aprovado', true),
 ('22222222-2222-4222-8222-222222222222', null, 'Café Aurora', 'cafeteria', 'Cafeteria fictícia com bolos caseiros e cafés especiais.', 'Rua Exemplo do Sol, 250', 'Pinheiros', 'São Paulo', '(11) 0000-0002', 'Todos os dias, 8h às 19h', 'aprovado', true),
 ('33333333-3333-4333-8333-333333333333', null, 'Pão da Esquina', 'padaria', 'Padaria artesanal fictícia de fermentação natural.', 'Avenida Demonstração, 42', 'Moema', 'São Paulo', '(11) 0000-0003', 'Ter a dom, 7h às 21h', 'aprovado', true);

insert into public.kits (id, establishment_id, nome, descricao, imagem, preco, preco_referencia, estoque_total, diario, retirada_inicio, retirada_fim, ingredientes, alergenicos, conservacao, status) values
 ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Kit Café da Tarde', 'Croissants amanteigados e pães franceses produzidos hoje.', '/images/kit-cafe-da-tarde.jpg', 12.90, null, 5, true, '17:00', '19:30', 'Farinha de trigo, manteiga, ovos, fermento, sal.', 'Contém glúten, lactose e ovos.', 'Consumir em até 24 horas. Manter em local seco.', 'publicado'),
 ('aaaaaaa2-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Kit Bolos do Dia', 'Fatias de bolos caseiros feitos hoje pela manhã.', '/images/kit-bolos-do-dia.jpg', 14.90, null, 4, true, '16:00', '18:30', 'Cenoura, laranja, farinha de trigo, açúcar, ovos, óleo, chocolate.', 'Contém glúten e ovos. Pode conter traços de leite.', 'Manter refrigerado e consumir em até 2 dias.', 'publicado'),
 ('aaaaaaa3-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'Kit Pães Artesanais', 'Pão integral de fermentação natural e pães de queijo.', '/images/kit-paes-artesanais.jpg', 16.90, null, 6, true, '18:00', '20:30', 'Farinha integral, polvilho, queijo, ovos, leite, sal.', 'Contém glúten, lactose e ovos.', 'Pão integral: até 3 dias em saco de papel. Pão de queijo: aquecer antes de consumir.', 'publicado');

insert into public.kit_items (kit_id, nome, quantidade, unidade, ordem) values
 ('aaaaaaa1-0000-4000-8000-000000000001', 'Croissant', 2, 'un', 0),
 ('aaaaaaa1-0000-4000-8000-000000000001', 'Pão francês', 2, 'un', 1),
 ('aaaaaaa2-0000-4000-8000-000000000002', 'Fatia de bolo de cenoura', 2, 'un', 0),
 ('aaaaaaa2-0000-4000-8000-000000000002', 'Fatia de bolo de laranja', 1, 'un', 1),
 ('aaaaaaa3-0000-4000-8000-000000000003', 'Pão integral', 1, 'un', 0),
 ('aaaaaaa3-0000-4000-8000-000000000003', 'Pão de queijo', 2, 'un', 1);

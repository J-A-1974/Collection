-- Base de données de l'application Collection
-- À exécuter une seule fois dans le projet Supabase (hdqfnciddvarazbxykus).

create table if not exists public.collection_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  color text not null default '#6366f1',
  shape text not null default 'classique',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.collection_categories(id) on delete cascade,
  name text not null,
  platform text,
  owner text,
  condition text,
  year int,
  brand text,
  purchase_price numeric(10,2),
  estimated_value numeric(10,2),
  location text,
  notes text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Réglages de l'appli (fond d'écran, logo), un par utilisateur
create table if not exists public.collection_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  theme text not null default 'synthwave',
  bg_path text,
  logo_url text,
  logo_path text,
  updated_at timestamptz not null default now()
);

create index if not exists collection_items_category_idx on public.collection_items(category_id);
create index if not exists collection_items_user_idx on public.collection_items(user_id);
create index if not exists collection_categories_user_idx on public.collection_categories(user_id);

alter table public.collection_categories enable row level security;
alter table public.collection_items enable row level security;
alter table public.collection_settings enable row level security;

-- Chacun ne voit et ne modifie que ses propres données
drop policy if exists "collection_categories_owner" on public.collection_categories;
create policy "collection_categories_owner" on public.collection_categories
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "collection_items_owner" on public.collection_items;
create policy "collection_items_owner" on public.collection_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "collection_settings_owner" on public.collection_settings;
create policy "collection_settings_owner" on public.collection_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Stockage des photos (privé, une dossier par utilisateur)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('collection-photos', 'collection-photos', false, 524288, array['image/webp','image/jpeg','image/png','image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "collection_photos_owner_select" on storage.objects;
create policy "collection_photos_owner_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'collection-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "collection_photos_owner_insert" on storage.objects;
create policy "collection_photos_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'collection-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "collection_photos_owner_update" on storage.objects;
create policy "collection_photos_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'collection-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "collection_photos_owner_delete" on storage.objects;
create policy "collection_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'collection-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

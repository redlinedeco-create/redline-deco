-- Redline Deco — Supabase schema
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Shared type: a trilingual string. Mirrors the { en, fr, ar } shape used
-- throughout data/*.ts so the mapping stays one-to-one.
-- Requires all three keys to be present, but allows empty values so the admin
-- UI can surface and report missing translations rather than reject the save.
-- ---------------------------------------------------------------------------
create domain if not exists i18n_text as jsonb
  check (jsonb_typeof(value) = 'object' and value ?& array['en', 'fr', 'ar']);

-- ---------------------------------------------------------------------------
-- Keep updated_at honest without relying on the client clock.
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table definitions
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id          text primary key,
  slug        text unique not null,
  name        i18n_text not null default '{"en":"","fr":"","ar":""}'::jsonb,
  description i18n_text,
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists projects (
  id          text primary key,
  slug        text unique not null,
  title       i18n_text not null,
  category    text not null references categories (slug) on update cascade,
  location    i18n_text not null,
  description i18n_text not null,
  services    text[] not null default '{}',
  year        int,
  cover_path  text,
  images      text[] not null default '{}',
  before_path text,
  after_path  text,
  featured    boolean not null default false,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists services (
  id             text primary key,
  name           i18n_text not null,
  description    i18n_text not null,
  icon           text not null default 'layers',
  starting_price numeric,
  unit           i18n_text,
  sort_order     int  not null default 0,
  updated_at     timestamptz not null default now()
);

create table if not exists prices (
  id          text primary key,
  service     i18n_text not null,
  category    text references categories (slug) on update cascade,
  description i18n_text not null,
  unit        i18n_text not null,
  price_from  numeric not null,
  price_to    numeric,
  currency    text not null default 'DZD',
  notes       i18n_text,
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists testimonials (
  id           text primary key,
  name         text not null,
  project      text,
  review       i18n_text not null,
  rating       int,
  review_date  date,
  photo_path   text,
  is_placeholder boolean not null default true,
  sort_order   int not null default 0,
  updated_at   timestamptz not null default now()
);

-- Every editable UI string, keyed by its dotted i18n path (e.g. "hero.headline").
create table if not exists site_text (
  key        text primary key,
  value      i18n_text not null,
  updated_at timestamptz not null default now()
);

-- Singleton-ish key/value store for things like CONTACT_INFO.
create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists media (
  id         uuid primary key default gen_random_uuid(),
  path       text unique not null,
  filename   text not null,
  mime       text,
  size_bytes bigint,
  width      int,
  height     int,
  alt        i18n_text,
  folder     text not null default 'general',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes for the read paths the public site uses.
-- ---------------------------------------------------------------------------
create index if not exists projects_sort_idx        on projects (sort_order);
create index if not exists projects_category_idx     on projects (category);
create index if not exists categories_sort_idx      on categories (sort_order);
create index if not exists services_sort_idx        on services (sort_order);
create index if not exists prices_sort_idx          on prices (sort_order);
create index if not exists prices_category_idx      on prices (category);
create index if not exists testimonials_sort_idx    on testimonials (sort_order);
create index if not exists media_folder_idx         on media (folder);
create index if not exists media_created_at_idx     on media (created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'projects', 'services', 'prices',
    'testimonials', 'site_text', 'settings'
  ] loop
    execute format('drop trigger if exists %I on %I', t || '_touch', t);
    execute format(
      'create trigger %I before update on %I
       for each row execute function touch_updated_at()',
      t || '_touch', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- All application access goes through server-side helpers that use the
-- service_role key, which bypasses RLS. Enabling RLS with no policies means
-- the anon key -- which is public in the client bundle and used only for the
-- admin sign-in call -- cannot read or write anything even if it leaks.
-- ---------------------------------------------------------------------------
alter table categories    enable row level security;
alter table projects      enable row level security;
alter table services      enable row level security;
alter table prices        enable row level security;
alter table testimonials  enable row level security;
alter table site_text     enable row level security;
alter table settings      enable row level security;
alter table media         enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket for photos. Run separately if the dashboard has already
-- created it; the insert is idempotent.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of photos. Writes only ever happen server-side with the
-- service_role key, which bypasses storage policies as well.
create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

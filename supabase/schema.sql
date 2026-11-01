-- Redline Deco — Supabase schema
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Shared type: a trilingual string. Mirrors the { en, fr, ar } shape used
-- throughout data/*.ts so the mapping stays one-to-one.
-- Requires all three keys to be present, but allows empty values so the admin
-- UI can surface and report missing translations rather than reject the save.
--
-- CREATE DOMAIN has no IF NOT EXISTS, hence the existence check.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'i18n_text' and n.nspname = 'public'
  ) then
    execute $q$create domain i18n_text as jsonb
      check (jsonb_typeof(value) = 'object' and value ?& array['en', 'fr', 'ar'])$q$;
  end if;
end;
$$;

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
  id             text primary key,
  name           text not null,
  phone          text,
  status         text not null default 'approved'
                   check (status in ('pending', 'approved', 'rejected')),
  project        text,
  review         i18n_text not null,
  rating         int,
  review_date    date,
  photo_path     text,
  is_placeholder boolean not null default true,
  sort_order     int not null default 0,
  updated_at     timestamptz not null default now()
);

-- Quote requests submitted through /quote and the contact page. This is the
-- only table holding customer data, so it is the one table with no public
-- read policy: see the RLS notes further down.
create table if not exists contact_requests (
  id             text primary key,
  -- Short human-quotable code the owner can read over the phone, e.g. RD-7QK4M2.
  reference      text unique not null,
  name           text not null,
  -- Nullable: the short contact form only asks for a name and email.
  phone          text,
  email          text,
  -- Subject line, from the contact form's "Subject" box.
  subject        text,
  location       text,
  project_type   text not null default 'other'
                   check (project_type in ('residential', 'commercial', 'other')),
  service        text,
  area           text,
  budget         text,
  preferred_date date,
  description    text not null,
  -- Storage paths inside the private `quote-attachments` bucket. Never public
  -- URLs: these are customers' floor plans and photos of their homes.
  photos         text[] not null default '{}',
  documents      text[] not null default '{}',
  -- Which language the visitor was using, plus where the form was filled in, so
  -- a reply can be sent in the same language from the same page.
  locale         text not null default 'en',
  source         text not null default 'quote'
                   check (source in ('quote', 'contact')),
  status         text not null default 'new'
                   check (status in ('new', 'in_progress', 'won', 'lost', 'spam')),
  -- Private note for the owner. Never shown on the public site.
  admin_note     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- A form submission that cannot be answered is worthless, so at least one
  -- contact route is required no matter which form it came from.
  constraint contact_requests_replyable check (
    length(trim(coalesce(email, ''))) > 0
    or length(trim(coalesce(phone, ''))) > 0
  )
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
create index if not exists contact_requests_new_idx on contact_requests (created_at desc) where status = 'new';
create index if not exists contact_requests_created_idx on contact_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'projects', 'services', 'prices',
    'testimonials', 'site_text', 'settings', 'contact_requests'
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
-- Split by capability rather than by table:
--
--   READ  (anon key)  Everything in these tables is already published on the
--                     marketing site -- project names, prices, service copy,
--                     contact details. Granting SELECT costs nothing and keeps
--                     the service_role key out of the public render path.
--
--   WRITE (service_role, server only)  No anon INSERT/UPDATE/DELETE policy
--                     exists, so the public key cannot change anything even if
--                     it leaks. Writes go through lib/supabase/server.ts.
--
-- `contact_requests` is deliberately NOT in the read list below. It holds names,
-- phone numbers, addresses and floor plans, so RLS is enabled with no policy at
-- all: only the service_role key used by app/api/quote can write to it and only
-- app/api/admin/requests can read it. The public form posts through our own
-- route handler rather than straight to Supabase, which is what lets us
-- validate, rate limit and strip honeypot spam before anything is stored.
-- ---------------------------------------------------------------------------
alter table categories    enable row level security;
alter table projects      enable row level security;
alter table services      enable row level security;
alter table prices        enable row level security;
alter table testimonials  enable row level security;
alter table site_text     enable row level security;
alter table settings      enable row level security;
alter table media         enable row level security;
alter table contact_requests enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'projects', 'services', 'prices',
    'testimonials', 'site_text', 'settings', 'media'
  ] loop
    execute format('drop policy if exists %I on %I', t || '_public_read', t);
    execute format(
      'create policy %I on %I for select using (true)',
      t || '_public_read', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage buckets. Both inserts are idempotent.
-- ---------------------------------------------------------------------------

-- Portfolio photos: public, so Next.js can render them straight from a URL.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of photos. Writes only ever happen server-side with the
-- service_role key, which bypasses storage policies as well.
drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

-- Quote attachments: PRIVATE, and no storage.objects policy is created for it.
-- A customer's floor plans and photos of their home are served only through
-- short-lived signed URLs generated by /api/admin/requests, so a leaked URL
-- cannot be turned into an album of every enquiry ever received.
insert into storage.buckets (id, name, public)
values ('quote-attachments', 'quote-attachments', false)
on conflict (id) do nothing;

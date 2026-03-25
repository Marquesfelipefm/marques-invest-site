create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_link text not null default '#',
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings
add column if not exists social_links jsonb not null default '{}'::jsonb;

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text,
  category text not null default 'markets',
  source text default 'Marques Invest',
  external_url text,
  cover_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.posts
add column if not exists content_type text not null default 'news',
add column if not exists seo_title text,
add column if not exists seo_description text,
add column if not exists cover_alt text,
add column if not exists featured boolean not null default false;

create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  event_at timestamptz not null,
  impact text not null default 'Alta',
  region text,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  service text not null,
  investment_range text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.contact_leads
add column if not exists objective text,
add column if not exists horizon text,
add column if not exists patrimony_band text,
add column if not exists already_invests text;

alter table public.site_settings enable row level security;
alter table public.site_content enable row level security;
alter table public.posts enable row level security;
alter table public.agenda_events enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_leads enable row level security;

drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings"
on public.site_settings for select
using (true);

drop policy if exists "authenticated can manage site settings" on public.site_settings;
create policy "authenticated can manage site settings"
on public.site_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content for select
using (true);

drop policy if exists "authenticated can manage site content" on public.site_content;
create policy "authenticated can manage site content"
on public.site_content for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts"
on public.posts for select
using (status = 'published');

drop policy if exists "authenticated can manage posts" on public.posts;
create policy "authenticated can manage posts"
on public.posts for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can read published agenda" on public.agenda_events;
create policy "public can read published agenda"
on public.agenda_events for select
using (status = 'published');

drop policy if exists "authenticated can manage agenda" on public.agenda_events;
create policy "authenticated can manage agenda"
on public.agenda_events for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can create newsletter subscribers" on public.newsletter_subscribers;
create policy "public can create newsletter subscribers"
on public.newsletter_subscribers for insert
with check (true);

drop policy if exists "authenticated can read newsletter subscribers" on public.newsletter_subscribers;
create policy "authenticated can read newsletter subscribers"
on public.newsletter_subscribers for select
to authenticated
using (true);

drop policy if exists "authenticated can manage newsletter subscribers" on public.newsletter_subscribers;
create policy "authenticated can manage newsletter subscribers"
on public.newsletter_subscribers for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can create contact leads" on public.contact_leads;
create policy "public can create contact leads"
on public.contact_leads for insert
with check (true);

drop policy if exists "authenticated can read contact leads" on public.contact_leads;
create policy "authenticated can read contact leads"
on public.contact_leads for select
to authenticated
using (true);

drop policy if exists "authenticated can manage contact leads" on public.contact_leads;
create policy "authenticated can manage contact leads"
on public.contact_leads for all
to authenticated
using (true)
with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_updated_at_site_settings on public.site_settings;
create trigger set_updated_at_site_settings
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_site_content on public.site_content;
create trigger set_updated_at_site_content
before update on public.site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_posts on public.posts;
create trigger set_updated_at_posts
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_agenda_events on public.agenda_events;
create trigger set_updated_at_agenda_events
before update on public.agenda_events
for each row execute function public.set_updated_at();

insert into public.site_settings (id, whatsapp_link)
values (1, '#')
on conflict (id) do nothing;

insert into public.site_content (key, value)
values
  ('home', '{}'::jsonb),
  ('analysis', '{}'::jsonb),
  ('highlights', '{}'::jsonb),
  ('newsletter', '{}'::jsonb),
  ('contact', '{}'::jsonb)
on conflict (key) do nothing;

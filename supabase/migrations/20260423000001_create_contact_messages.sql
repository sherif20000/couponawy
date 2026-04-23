-- contact_messages: stores user-submitted contact form inquiries.
-- Inserted anonymously from the public /contact page (anon key, RLS enforced).

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- Only service role can read; anon can insert (no auth required).
alter table public.contact_messages enable row level security;

create policy "anon_insert_contact_messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "service_role_all_contact_messages"
  on public.contact_messages
  for all
  to service_role
  using (true)
  with check (true);

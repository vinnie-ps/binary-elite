-- Create Posts Table (News/Announcements)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,
  is_published boolean default false,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Resources Table (Library)
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  url text not null, -- Can be external link or internal storage path
  type text not null check (type in ('pdf', 'document', 'video', 'link', 'other')),
  category text, -- e.g., 'guides', 'templates', 'contracts'
  is_member_only boolean default true,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table posts enable row level security;
alter table resources enable row level security;

-- Policies for Posts
-- Public/Members: Can read published posts
create policy "Anyone can read published posts"
  on posts for select
  using ( is_published = true );

-- Admins: Full access
create policy "Admins can do everything with posts"
  on posts for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policies for Resources
-- Members: Can read active resources
create policy "Members can read active resources"
  on resources for select
  using ( is_active = true );

-- Admins: Full access
create policy "Admins can do everything with resources"
  on resources for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Storage Buckets (Optional, if not already handled)
insert into storage.buckets (id, name, public)
values ('content-assets', 'content-assets', true)
on conflict (id) do nothing;

create policy "Public Access to Content Assets"
  on storage.objects for select
  using ( bucket_id = 'content-assets' );

create policy "Admins can upload Content Assets"
  on storage.objects for insert
  with check (
    bucket_id = 'content-assets'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

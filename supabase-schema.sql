-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Syllabi table
create table public.syllabi (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  duration text not null,
  learning_style text not null,
  current_learning_style text not null,
  module_count int not null default 0,
  created_at timestamptz default now() not null
);

alter table public.syllabi enable row level security;

create policy "Users can view own syllabi"
  on public.syllabi for select
  using (auth.uid() = user_id);

create policy "Users can insert own syllabi"
  on public.syllabi for insert
  with check (auth.uid() = user_id);

create policy "Users can update own syllabi"
  on public.syllabi for update
  using (auth.uid() = user_id);

create policy "Users can delete own syllabi"
  on public.syllabi for delete
  using (auth.uid() = user_id);

-- 3. Modules table
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  syllabus_id uuid references public.syllabi on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text not null,
  objectives text[] not null default '{}',
  lesson_content text,
  status text not null default 'not_started',
  order_index int not null,
  created_at timestamptz default now() not null
);

alter table public.modules enable row level security;

create policy "Users can view own modules"
  on public.modules for select
  using (auth.uid() = user_id);

create policy "Users can insert own modules"
  on public.modules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own modules"
  on public.modules for update
  using (auth.uid() = user_id);

-- 4. Quiz attempts table
create table public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules on delete cascade not null,
  syllabus_id uuid references public.syllabi on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  questions jsonb not null default '[]',
  answers jsonb not null default '[]',
  score int not null default 0,
  passed boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.quiz_attempts enable row level security;

create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- 5. Learning style events table
create table public.learning_style_events (
  id uuid default gen_random_uuid() primary key,
  syllabus_id uuid references public.syllabi on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  previous_style text not null,
  new_style text not null,
  trigger_score numeric not null,
  created_at timestamptz default now() not null
);

alter table public.learning_style_events enable row level security;

create policy "Users can view own learning style events"
  on public.learning_style_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own learning style events"
  on public.learning_style_events for insert
  with check (auth.uid() = user_id);

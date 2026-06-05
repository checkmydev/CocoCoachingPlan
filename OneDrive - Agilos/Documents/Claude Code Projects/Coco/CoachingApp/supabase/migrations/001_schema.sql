-- Tables
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('coach', 'client')),
  name text not null default '',
  email text not null default ''
);

create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  instructions text,
  muscle_groups text[] default '{}',
  equipment text[] default '{}',
  video_url text,
  video_type text check (video_type in ('youtube', 'vimeo', 'upload')),
  thumbnail_url text,
  created_by uuid references profiles not null,
  created_at timestamptz default now()
);

create table programs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  coach_id uuid references profiles not null,
  created_at timestamptz default now()
);

create table program_sessions (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs on delete cascade not null,
  week int not null,
  day int not null,
  name text not null
);

create table session_exercises (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references program_sessions on delete cascade not null,
  exercise_id uuid references exercises not null,
  sets int,
  reps text,
  rest_seconds int,
  notes text,
  "order" int not null default 0
);

create table client_programs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles not null,
  program_id uuid references programs not null,
  start_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'done'))
);

create table session_logs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles not null,
  program_session_id uuid references program_sessions not null,
  logged_at timestamptz default now(),
  exercises_data jsonb default '[]',
  completed boolean default false
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table programs enable row level security;
alter table program_sessions enable row level security;
alter table session_exercises enable row level security;
alter table client_programs enable row level security;
alter table session_logs enable row level security;

-- profiles
create policy "Own profile" on profiles for all using (auth.uid() = id);
create policy "Coach reads client profiles" on profiles for select using (
  exists (
    select 1 from client_programs cp
    join programs p on p.id = cp.program_id
    where cp.client_id = profiles.id and p.coach_id = auth.uid()
  )
);

-- exercises
create policy "Coach manages exercises" on exercises for all using (created_by = auth.uid());
create policy "Client reads exercises in programs" on exercises for select using (
  exists (
    select 1 from session_exercises se
    join program_sessions ps on ps.id = se.session_id
    join client_programs cp on cp.program_id = ps.program_id
    where se.exercise_id = exercises.id and cp.client_id = auth.uid()
  )
);

-- programs
create policy "Coach manages programs" on programs for all using (coach_id = auth.uid());
create policy "Client reads assigned programs" on programs for select using (
  exists (select 1 from client_programs where program_id = programs.id and client_id = auth.uid())
);

-- program_sessions
create policy "Coach manages sessions" on program_sessions for all using (
  exists (select 1 from programs where id = program_sessions.program_id and coach_id = auth.uid())
);
create policy "Client reads program sessions" on program_sessions for select using (
  exists (
    select 1 from client_programs
    where program_id = program_sessions.program_id and client_id = auth.uid()
  )
);

-- session_exercises
create policy "Coach manages session exercises" on session_exercises for all using (
  exists (
    select 1 from program_sessions ps
    join programs p on p.id = ps.program_id
    where ps.id = session_exercises.session_id and p.coach_id = auth.uid()
  )
);
create policy "Client reads session exercises" on session_exercises for select using (
  exists (
    select 1 from program_sessions ps
    join client_programs cp on cp.program_id = ps.program_id
    where ps.id = session_exercises.session_id and cp.client_id = auth.uid()
  )
);

-- client_programs
create policy "Coach manages client programs" on client_programs for all using (
  exists (select 1 from programs where id = client_programs.program_id and coach_id = auth.uid())
);
create policy "Client reads own programs" on client_programs for select using (client_id = auth.uid());

-- session_logs
create policy "Client manages own logs" on session_logs for all using (client_id = auth.uid());
create policy "Coach reads client logs" on session_logs for select using (
  exists (
    select 1 from program_sessions ps
    join programs p on p.id = ps.program_id
    where ps.id = session_logs.program_session_id and p.coach_id = auth.uid()
  )
);

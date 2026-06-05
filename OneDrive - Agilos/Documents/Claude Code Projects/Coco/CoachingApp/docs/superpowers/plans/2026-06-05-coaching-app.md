# Coaching App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sports coaching web app where a coach creates exercise programs with videos, shares them with clients, and tracks their progress.

**Architecture:** React 18 + Vite SPA on GitHub Pages. Supabase handles auth, PostgreSQL, file storage, and Edge Functions. Two role-based spaces: `/coach/*` and `/client/*`, using HashRouter for GitHub Pages compatibility.

**Tech Stack:** React 18, Vite 5, TailwindCSS 3, React Router v6 (HashRouter), Supabase JS v2, @dnd-kit/sortable, recharts, date-fns, Vitest, React Testing Library

---

## Prerequisites (manual steps before coding)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `Project URL` and `anon public` key from Settings > API
3. Create a Storage bucket named `exercises` (public access ON)
4. Create GitHub repo named `CoachingApp`
5. Add GitHub Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
6. Enable GitHub Pages from Settings > Pages > Source: gh-pages branch

---

## File Structure

```
CoachingApp/
├── .github/workflows/deploy.yml
├── src/
│   ├── index.css
│   ├── main.jsx
│   ├── App.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── videoUtils.js
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Layout.jsx
│   │   ├── ClientLayout.jsx
│   │   ├── VideoPlayer.jsx
│   │   └── SortableExercise.jsx
│   ├── hooks/
│   │   ├── useExercises.js
│   │   ├── usePrograms.js
│   │   └── useClients.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── coach/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExerciseList.jsx
│   │   │   ├── ExerciseForm.jsx
│   │   │   ├── ProgramList.jsx
│   │   │   ├── ProgramBuilder.jsx
│   │   │   ├── ClientList.jsx
│   │   │   └── ClientDetail.jsx
│   │   └── client/
│   │       ├── MyPrograms.jsx
│   │       ├── ProgramDetail.jsx
│   │       └── ActiveSession.jsx
│   └── test/
│       └── setup.js
├── supabase/
│   ├── migrations/001_schema.sql
│   └── functions/send-client-invitation/index.ts
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

---

## Phase 1 — Foundation

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/index.css`, `src/main.jsx`, `src/App.jsx`, `src/test/setup.js`, `.env.example`

- [ ] **Step 1: Initialize project**

```bash
npm create vite@latest . -- --template react
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js react-router-dom @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts date-fns
npm install -D tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/CoachingApp/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Write `tailwind.config.js`**

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 5: Write `postcss.config.js`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CoachApp</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Write `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 9: Write `.env.example`**

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Copy to `.env.local` and fill in your values.

- [ ] **Step 10: Write `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
```

- [ ] **Step 11: Write `src/App.jsx` (skeleton — pages are stubs for now)**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/coach/Dashboard'
import ExerciseList from './pages/coach/ExerciseList'
import ExerciseForm from './pages/coach/ExerciseForm'
import ProgramList from './pages/coach/ProgramList'
import ProgramBuilder from './pages/coach/ProgramBuilder'
import ClientList from './pages/coach/ClientList'
import ClientDetail from './pages/coach/ClientDetail'
import MyPrograms from './pages/client/MyPrograms'
import ProgramDetail from './pages/client/ProgramDetail'
import ActiveSession from './pages/client/ActiveSession'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/coach" element={<ProtectedRoute role="coach" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exercises" element={<ExerciseList />} />
          <Route path="exercises/new" element={<ExerciseForm />} />
          <Route path="exercises/:id" element={<ExerciseForm />} />
          <Route path="programs" element={<ProgramList />} />
          <Route path="programs/new" element={<ProgramBuilder />} />
          <Route path="programs/:id" element={<ProgramBuilder />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetail />} />
        </Route>
        <Route path="/client" element={<ProtectedRoute role="client" />}>
          <Route path="programs" element={<MyPrograms />} />
          <Route path="programs/:id" element={<ProgramDetail />} />
          <Route path="session/:id" element={<ActiveSession />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
```

- [ ] **Step 12: Create stub files for all pages** (empty components so App.jsx compiles)

For each file listed below, create a stub:
```jsx
// e.g. src/pages/coach/Dashboard.jsx
export default function Dashboard() { return <div>Dashboard</div> }
```

Files to stub: `src/pages/Login.jsx`, `src/pages/coach/Dashboard.jsx`, `src/pages/coach/ExerciseList.jsx`, `src/pages/coach/ExerciseForm.jsx`, `src/pages/coach/ProgramList.jsx`, `src/pages/coach/ProgramBuilder.jsx`, `src/pages/coach/ClientList.jsx`, `src/pages/coach/ClientDetail.jsx`, `src/pages/client/MyPrograms.jsx`, `src/pages/client/ProgramDetail.jsx`, `src/pages/client/ActiveSession.jsx`

Also stub: `src/contexts/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/Layout.jsx`, `src/components/ClientLayout.jsx`, `src/components/VideoPlayer.jsx`, `src/components/SortableExercise.jsx`, `src/lib/supabase.js`, `src/lib/videoUtils.js`, `src/hooks/useExercises.js`, `src/hooks/usePrograms.js`, `src/hooks/useClients.js`

- [ ] **Step 13: Verify dev server starts**

```bash
npm run dev
```

Expected: App runs at `http://localhost:5173/CoachingApp/` with no console errors.

- [ ] **Step 14: Commit**

```bash
git add .
git commit -m "feat: scaffold React+Vite+Tailwind project"
```

---

### Task 2: Supabase schema + RLS

**Files:**
- Create: `supabase/migrations/001_schema.sql`

- [ ] **Step 1: Write `supabase/migrations/001_schema.sql`**

```sql
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
```

- [ ] **Step 2: Run migration in Supabase**

Go to Supabase dashboard > SQL Editor, paste the full content of `001_schema.sql` and click Run.

- [ ] **Step 3: Create coach account in Supabase**

Go to Authentication > Users > Invite user (your email). Then in SQL Editor:
```sql
update profiles set role = 'coach', name = 'Ton Nom' where email = 'your@email.com';
```

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema, RLS, and auto-profile trigger"
```

---

### Task 3: Auth + routing

**Files:**
- Write: `src/lib/supabase.js`, `src/contexts/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/Layout.jsx`, `src/components/ClientLayout.jsx`, `src/pages/Login.jsx`

- [ ] **Step 1: Write `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 2: Write `src/contexts/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading: session === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 3: Write `src/components/ProtectedRoute.jsx`**

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'
import ClientLayout from './ClientLayout'

export default function ProtectedRoute({ role }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (profile && profile.role !== role) {
    return <Navigate to={profile.role === 'coach' ? '/coach/dashboard' : '/client/programs'} replace />
  }

  return role === 'coach'
    ? <Layout><Outlet /></Layout>
    : <ClientLayout><Outlet /></ClientLayout>
}
```

- [ ] **Step 4: Write `src/components/Layout.jsx`**

```jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/coach/dashboard', label: 'Tableau de bord' },
  { to: '/coach/exercises', label: 'Exercices' },
  { to: '/coach/programs', label: 'Programmes' },
  { to: '/coach/clients', label: 'Clients' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 text-lg font-bold border-b border-gray-700">CoachApp</div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="m-4 text-sm text-gray-400 hover:text-white text-left">
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/components/ClientLayout.jsx`**

```jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientLayout({ children }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">CoachApp</span>
        <NavLink to="/client/programs"
          className={({ isActive }) => isActive ? 'text-blue-600 font-medium text-sm' : 'text-gray-600 hover:text-gray-900 text-sm'}>
          Mes programmes
        </NavLink>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
          Déconnexion
        </button>
      </header>
      <main className="max-w-2xl mx-auto p-4">{children}</main>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/pages/Login.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()
    navigate(profile?.role === 'coach' ? '/coach/dashboard' : '/client/programs', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">CoachApp</h1>
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="password" placeholder="Mot de passe" value={password}
          onChange={e => setPassword(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 7: Test auth flow manually**

```bash
npm run dev
```

Navigate to `http://localhost:5173/CoachingApp/`. Log in with your coach account. Verify redirect to `/coach/dashboard`.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add auth, role-based routing, and layouts"
```

---

## Phase 2 — Video utilities + Exercise Library

### Task 4: Video utilities + tests

**Files:**
- Create: `src/lib/videoUtils.js`, `src/lib/videoUtils.test.js`

- [ ] **Step 1: Write failing tests in `src/lib/videoUtils.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { detectVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from './videoUtils'

describe('detectVideoType', () => {
  it('detects YouTube watch URL', () => {
    expect(detectVideoType('https://www.youtube.com/watch?v=abc123')).toBe('youtube')
  })
  it('detects YouTube short URL', () => {
    expect(detectVideoType('https://youtu.be/abc123')).toBe('youtube')
  })
  it('detects Vimeo URL', () => {
    expect(detectVideoType('https://vimeo.com/123456789')).toBe('vimeo')
  })
  it('returns upload for storage URLs', () => {
    expect(detectVideoType('https://storage.example.com/video.mp4')).toBe('upload')
  })
  it('returns null for empty input', () => {
    expect(detectVideoType('')).toBe(null)
    expect(detectVideoType(null)).toBe(null)
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('extracts ID from watch URL', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
  it('extracts ID from short URL', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
  it('returns null for invalid URL', () => {
    expect(getYouTubeEmbedUrl('https://vimeo.com/123')).toBe(null)
  })
})

describe('getVimeoEmbedUrl', () => {
  it('extracts ID from Vimeo URL', () => {
    expect(getVimeoEmbedUrl('https://vimeo.com/123456789'))
      .toBe('https://player.vimeo.com/video/123456789')
  })
  it('returns null for invalid URL', () => {
    expect(getVimeoEmbedUrl('https://youtube.com/watch?v=abc')).toBe(null)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: All tests fail with "Cannot find module './videoUtils'"

- [ ] **Step 3: Write `src/lib/videoUtils.js`**

```js
export function detectVideoType(url) {
  if (!url) return null
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/vimeo\.com/.test(url)) return 'vimeo'
  return 'upload'
}

export function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export function getVimeoEmbedUrl(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}` : null
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 8 tests pass.

- [ ] **Step 5: Write `src/components/VideoPlayer.jsx`**

```jsx
import { detectVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '../lib/videoUtils'

export default function VideoPlayer({ url, className = '' }) {
  const type = detectVideoType(url)
  if (!type) return null

  if (type === 'youtube') {
    return (
      <div className={`aspect-video ${className}`}>
        <iframe src={getYouTubeEmbedUrl(url)} className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
    )
  }
  if (type === 'vimeo') {
    return (
      <div className={`aspect-video ${className}`}>
        <iframe src={getVimeoEmbedUrl(url)} className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    )
  }
  return <video src={url} controls className={`w-full rounded-lg ${className}`} />
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/ src/components/VideoPlayer.jsx
git commit -m "feat: add video utilities and VideoPlayer component"
```

---

### Task 5: Exercise hooks + ExerciseList

**Files:**
- Write: `src/hooks/useExercises.js`, `src/pages/coach/ExerciseList.jsx`

- [ ] **Step 1: Write `src/hooks/useExercises.js`**

```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useExercises() {
  const { profile } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetchExercises()
  }, [profile])

  async function fetchExercises() {
    setLoading(true)
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('created_by', profile.id)
      .order('name')
    setExercises(data ?? [])
    setLoading(false)
  }

  async function createExercise(values) {
    const { data, error } = await supabase
      .from('exercises')
      .insert({ ...values, created_by: profile.id })
      .select()
      .single()
    if (!error) setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  async function updateExercise(id, values) {
    const { data, error } = await supabase
      .from('exercises').update(values).eq('id', id).select().single()
    if (!error) setExercises(prev => prev.map(e => e.id === id ? data : e))
    return { data, error }
  }

  async function deleteExercise(id) {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (!error) setExercises(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { exercises, loading, createExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}
```

- [ ] **Step 2: Write `src/pages/coach/ExerciseList.jsx`**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExercises } from '../../hooks/useExercises'

const MUSCLE_GROUPS = ['Dos', 'Pectoraux', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Abdominaux', 'Full body']

export default function ExerciseList() {
  const { exercises, loading, deleteExercise } = useExercises()
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')

  const filtered = exercises.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = !muscleFilter || (e.muscle_groups ?? []).includes(muscleFilter)
    return matchName && matchMuscle
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bibliothèque d'exercices</h1>
        <Link to="/coach/exercises/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Ajouter
        </Link>
      </div>

      <div className="flex gap-3 mb-5">
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={muscleFilter} onChange={e => setMuscleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tous les muscles</option>
          {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : filtered.length === 0 ? <p className="text-gray-400">Aucun exercice trouvé.</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ex => (
              <div key={ex.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {ex.thumbnail_url && (
                  <img src={ex.thumbnail_url} alt="" className="w-full h-36 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{ex.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ex.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(ex.muscle_groups ?? []).map(m => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/coach/exercises/${ex.id}`}
                      className="flex-1 text-center text-sm border rounded-lg py-1.5 hover:bg-gray-50">
                      Modifier
                    </Link>
                    <button onClick={() => {
                      if (confirm(`Supprimer "${ex.name}" ?`)) deleteExercise(ex.id)
                    }} className="text-sm text-red-500 hover:text-red-700 px-2">
                      Suppr.
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useExercises.js src/pages/coach/ExerciseList.jsx
git commit -m "feat: add exercise list with search and muscle filter"
```

---

### Task 6: Exercise form (create + edit + video upload)

**Files:**
- Write: `src/pages/coach/ExerciseForm.jsx`

- [ ] **Step 1: Write `src/pages/coach/ExerciseForm.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useExercises } from '../../hooks/useExercises'
import VideoPlayer from '../../components/VideoPlayer'
import { detectVideoType } from '../../lib/videoUtils'

const MUSCLE_GROUPS = ['Dos', 'Pectoraux', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Abdominaux', 'Full body']
const EQUIPMENT = ['Haltères', 'Barre', 'Machine', 'Câble', 'Poids du corps', 'Bandes élastiques', 'Kettlebell']

const EMPTY = { name: '', description: '', instructions: '', muscle_groups: [], equipment: [], video_url: '', thumbnail_url: '' }

export default function ExerciseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { exercises, createExercise, updateExercise } = useExercises()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [videoMode, setVideoMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const ex = exercises.find(e => e.id === id)
      if (ex) setForm({
        name: ex.name ?? '',
        description: ex.description ?? '',
        instructions: ex.instructions ?? '',
        muscle_groups: ex.muscle_groups ?? [],
        equipment: ex.equipment ?? [],
        video_url: ex.video_url ?? '',
        thumbnail_url: ex.thumbnail_url ?? '',
      })
    }
  }, [id, exercises])

  function toggle(field, value) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value]
    }))
  }

  async function handleVideoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `videos/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { data, error: uploadError } = await supabase.storage.from('exercises').upload(path, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('exercises').getPublicUrl(data.path)
      setForm(f => ({ ...f, video_url: publicUrl }))
    } else {
      setError(`Upload échoué: ${uploadError.message}`)
    }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form, video_type: detectVideoType(form.video_url) }
    const { error: saveError } = isEdit
      ? await updateExercise(id, payload)
      : await createExercise(payload)
    if (saveError) { setError(saveError.message); setSaving(false); return }
    navigate('/coach/exercises')
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Modifier' : 'Nouvel'} exercice</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea rows={4} value={form.instructions}
            onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Groupes musculaires</label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map(m => (
              <button type="button" key={m} onClick={() => toggle('muscle_groups', m)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.muscle_groups.includes(m)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                }`}>{m}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Équipement</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map(eq => (
              <button type="button" key={eq} onClick={() => toggle('equipment', eq)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.equipment.includes(eq)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 hover:border-green-400'
                }`}>{eq}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vidéo</label>
          <div className="flex gap-2 mb-3">
            {['url', 'upload'].map(mode => (
              <button type="button" key={mode} onClick={() => setVideoMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm ${videoMode === mode ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
                {mode === 'url' ? 'Lien URL' : 'Upload fichier'}
              </button>
            ))}
          </div>
          {videoMode === 'url' ? (
            <input placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
              value={form.video_url}
              onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          ) : (
            <div>
              <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="text-sm" />
              {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
            </div>
          )}
          {form.video_url && <div className="mt-3"><VideoPlayer url={form.video_url} /></div>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => navigate('/coach/exercises')}
            className="border px-6 py-2 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify manually**

Start dev server. Create an exercise with a YouTube URL. Verify video preview appears. Edit the exercise. Verify form pre-fills correctly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/coach/ExerciseForm.jsx
git commit -m "feat: add exercise create/edit form with video upload support"
```

---

## Phase 3 — Program Builder

### Task 7: Program list + hooks

**Files:**
- Write: `src/hooks/usePrograms.js`, `src/pages/coach/ProgramList.jsx`

- [ ] **Step 1: Write `src/hooks/usePrograms.js`**

```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePrograms() {
  const { profile } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetchPrograms()
  }, [profile])

  async function fetchPrograms() {
    setLoading(true)
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('coach_id', profile.id)
      .order('created_at', { ascending: false })
    setPrograms(data ?? [])
    setLoading(false)
  }

  async function createProgram(values) {
    const { data, error } = await supabase
      .from('programs')
      .insert({ ...values, coach_id: profile.id })
      .select().single()
    if (!error) setPrograms(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteProgram(id) {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (!error) setPrograms(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  return { programs, loading, createProgram, deleteProgram, refetch: fetchPrograms }
}
```

- [ ] **Step 2: Write `src/pages/coach/ProgramList.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'

export default function ProgramList() {
  const { programs, loading, deleteProgram } = usePrograms()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Programmes</h1>
        <Link to="/coach/programs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Nouveau programme
        </Link>
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : programs.length === 0 ? <p className="text-gray-400">Aucun programme. Créez-en un !</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => (
              <div key={p.id} className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex gap-2 mt-5">
                  <Link to={`/coach/programs/${p.id}`}
                    className="flex-1 text-center text-sm border rounded-lg py-1.5 hover:bg-gray-50">
                    Éditer
                  </Link>
                  <button
                    onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteProgram(p.id) }}
                    className="text-sm text-red-500 hover:text-red-700 px-2">
                    Suppr.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePrograms.js src/pages/coach/ProgramList.jsx
git commit -m "feat: add programs list and usePrograms hook"
```

---

### Task 8: SortableExercise component + Program Builder

**Files:**
- Write: `src/components/SortableExercise.jsx`, `src/pages/coach/ProgramBuilder.jsx`

- [ ] **Step 1: Write `src/components/SortableExercise.jsx`**

```jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableExercise({ id, exercise, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <button {...attributes} {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing text-lg select-none">
        ⠿
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{exercise.exercise?.name ?? 'Exercice'}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
        <label>Séries</label>
        <input type="number" min={1} value={exercise.sets}
          onChange={e => onUpdate('sets', +e.target.value)}
          className="w-11 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <label>Reps</label>
        <input value={exercise.reps}
          onChange={e => onUpdate('reps', e.target.value)}
          className="w-14 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <label>Repos</label>
        <input type="number" min={0} step={15} value={exercise.rest_seconds}
          onChange={e => onUpdate('rest_seconds', +e.target.value)}
          className="w-14 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <span>s</span>
      </div>
      <button onClick={onRemove} className="text-red-300 hover:text-red-500 text-sm ml-1">✕</button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/coach/ProgramBuilder.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useExercises } from '../../hooks/useExercises'
import SortableExercise from '../../components/SortableExercise'

export default function ProgramBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { exercises: library } = useExercises()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState([])
  const [saving, setSaving] = useState(false)
  const [openPickerFor, setOpenPickerFor] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isEdit) loadProgram()
  }, [id])

  async function loadProgram() {
    const { data: prog } = await supabase.from('programs').select('*').eq('id', id).single()
    if (!prog) return
    setName(prog.name)
    setDescription(prog.description ?? '')
    const { data: sess } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(*))')
      .eq('program_id', id)
      .order('week').order('day')
    setSessions((sess ?? []).map(s => ({
      ...s,
      exercises: (s.session_exercises ?? []).sort((a, b) => a.order - b.order)
    })))
  }

  const sessionKey = s => s.id ?? s._tempId

  function addSession() {
    const maxWeek = sessions.reduce((m, s) => Math.max(m, s.week), 0)
    setSessions(prev => [...prev, {
      _tempId: Date.now(),
      week: maxWeek + 1, day: 1,
      name: `Séance ${prev.length + 1}`,
      exercises: []
    }])
  }

  function updateSession(key, field, value) {
    setSessions(prev => prev.map(s => sessionKey(s) === key ? { ...s, [field]: value } : s))
  }

  function removeSession(key) {
    setSessions(prev => prev.filter(s => sessionKey(s) !== key))
  }

  function addExToSession(key, ex) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== key) return s
      return {
        ...s, exercises: [...s.exercises, {
          _tempId: Date.now() + Math.random(),
          exercise_id: ex.id, exercise: ex,
          sets: 3, reps: '10', rest_seconds: 60, notes: '', order: s.exercises.length
        }]
      }
    }))
    setOpenPickerFor(null)
    setSearch('')
  }

  function updateEx(sessionKey_, exKey, field, value) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sessionKey_) return s
      return { ...s, exercises: s.exercises.map(e => (e.id ?? e._tempId) === exKey ? { ...e, [field]: value } : e) }
    }))
  }

  function removeEx(sessionKey_, exKey) {
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sessionKey_) return s
      return { ...s, exercises: s.exercises.filter(e => (e.id ?? e._tempId) !== exKey) }
    }))
  }

  function handleDragEnd(event, sKey) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSessions(prev => prev.map(s => {
      if (sessionKey(s) !== sKey) return s
      const ids = s.exercises.map(e => e.id ?? e._tempId)
      const reordered = arrayMove(s.exercises, ids.indexOf(active.id), ids.indexOf(over.id))
        .map((e, i) => ({ ...e, order: i }))
      return { ...s, exercises: reordered }
    }))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    let programId = id

    if (!isEdit) {
      const { data } = await supabase.from('programs')
        .insert({ name, description, coach_id: profile.id }).select().single()
      programId = data.id
    } else {
      await supabase.from('programs').update({ name, description }).eq('id', id)
      await supabase.from('program_sessions').delete().eq('program_id', programId)
    }

    for (const session of sessions) {
      const { data: newSess } = await supabase.from('program_sessions')
        .insert({ program_id: programId, week: session.week, day: session.day, name: session.name })
        .select().single()

      if (session.exercises.length > 0) {
        await supabase.from('session_exercises').insert(
          session.exercises.map((e, i) => ({
            session_id: newSess.id,
            exercise_id: e.exercise_id,
            sets: e.sets, reps: e.reps,
            rest_seconds: e.rest_seconds, notes: e.notes, order: i
          }))
        )
      }
    }

    navigate('/coach/programs')
    setSaving(false)
  }

  const filteredLib = library.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Éditer' : 'Nouveau'} programme</h1>

      <div className="space-y-3 mb-8">
        <input placeholder="Nom du programme *" value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea placeholder="Description (optionnel)" rows={2} value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-5">
        {sessions.map(session => {
          const sKey = sessionKey(session)
          return (
            <div key={sKey} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <input value={session.name} onChange={e => updateSession(sKey, 'name', e.target.value)}
                  className="flex-1 font-semibold text-base border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none" />
                <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
                  <span>Sem.</span>
                  <input type="number" min={1} value={session.week}
                    onChange={e => updateSession(sKey, 'week', +e.target.value)}
                    className="w-12 border rounded px-1 py-0.5 text-center focus:outline-none" />
                  <span>Jour</span>
                  <input type="number" min={1} max={7} value={session.day}
                    onChange={e => updateSession(sKey, 'day', +e.target.value)}
                    className="w-12 border rounded px-1 py-0.5 text-center focus:outline-none" />
                </div>
                <button onClick={() => removeSession(sKey)}
                  className="text-red-400 hover:text-red-600 text-sm ml-1">✕</button>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(e, sKey)}>
                <SortableContext
                  items={session.exercises.map(e => e.id ?? e._tempId)}
                  strategy={verticalListSortingStrategy}>
                  {session.exercises.map(ex => (
                    <SortableExercise
                      key={ex.id ?? ex._tempId}
                      id={ex.id ?? ex._tempId}
                      exercise={ex}
                      onUpdate={(f, v) => updateEx(sKey, ex.id ?? ex._tempId, f, v)}
                      onRemove={() => removeEx(sKey, ex.id ?? ex._tempId)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <div className="mt-3">
                {openPickerFor === sKey ? (
                  <div className="border rounded-lg p-3 bg-gray-50 mt-2">
                    <input placeholder="Rechercher un exercice..." value={search}
                      onChange={e => setSearch(e.target.value)} autoFocus
                      className="w-full border rounded px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    <div className="max-h-44 overflow-y-auto space-y-0.5">
                      {filteredLib.map(ex => (
                        <button key={ex.id} onClick={() => addExToSession(sKey, ex)}
                          className="w-full text-left text-sm px-3 py-2 rounded hover:bg-white hover:shadow-sm">
                          <span className="font-medium">{ex.name}</span>
                          {(ex.muscle_groups ?? []).length > 0 && (
                            <span className="text-gray-400 ml-2 text-xs">{ex.muscle_groups.join(', ')}</span>
                          )}
                        </button>
                      ))}
                      {filteredLib.length === 0 && <p className="text-gray-400 text-sm px-3 py-2">Aucun résultat.</p>}
                    </div>
                    <button onClick={() => setOpenPickerFor(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-2">Fermer</button>
                  </div>
                ) : (
                  <button onClick={() => { setOpenPickerFor(sKey); setSearch('') }}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    + Ajouter un exercice
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={addSession}
        className="mt-4 w-full border border-dashed rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Ajouter une séance
      </button>

      <div className="flex gap-3 mt-8">
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {saving ? 'Sauvegarde...' : 'Sauvegarder le programme'}
        </button>
        <button onClick={() => navigate('/coach/programs')}
          className="border px-6 py-2.5 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test manually**

Create a new program. Add 2 sessions. Add exercises to each session. Drag to reorder. Save. Verify it appears in ProgramList. Edit it and verify it loads correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/SortableExercise.jsx src/pages/coach/ProgramBuilder.jsx
git commit -m "feat: add program builder with sessions and drag-and-drop exercise ordering"
```

---

## Phase 4 — Client Management

### Task 9: Client list + invitation Edge Function

**Files:**
- Write: `src/hooks/useClients.js`, `src/pages/coach/ClientList.jsx`, `supabase/functions/send-client-invitation/index.ts`

- [ ] **Step 1: Write `src/hooks/useClients.js`**

```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePrograms } from './usePrograms'

export function useClients() {
  const { programs } = usePrograms()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programs.length === 0) { setLoading(false); return }
    fetchClients()
  }, [programs])

  async function fetchClients() {
    setLoading(true)
    const programIds = programs.map(p => p.id)
    const { data: cp } = await supabase
      .from('client_programs')
      .select('client_id')
      .in('program_id', programIds)
    const clientIds = [...new Set((cp ?? []).map(c => c.client_id))]
    if (clientIds.length === 0) { setClients([]); setLoading(false); return }
    const { data } = await supabase.from('profiles').select('*').in('id', clientIds)
    setClients(data ?? [])
    setLoading(false)
  }

  return { clients, loading, refetch: fetchClients }
}
```

- [ ] **Step 2: Write `supabase/functions/send-client-invitation/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const { email, coachName } = await req.json()
  const appUrl = Deno.env.get('APP_URL') ?? 'https://your-username.github.io/CoachingApp'

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: 'client' },
    redirectTo: `${appUrl}/#/login`,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
```

- [ ] **Step 3: Deploy Edge Function**

```bash
npx supabase functions deploy send-client-invitation --project-ref YOUR_PROJECT_REF
```

Set env var in Supabase dashboard > Edge Functions > send-client-invitation > Secrets:
- `APP_URL` = `https://your-github-username.github.io/CoachingApp`

- [ ] **Step 4: Write `src/pages/coach/ClientList.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useClients } from '../../hooks/useClients'

export default function ClientList() {
  const { clients, loading } = useClients()
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    setStatus(null)
    const { error } = await supabase.functions.invoke('send-client-invitation', {
      body: { email, coachName: profile.name }
    })
    setStatus(error ? `Erreur: ${error.message}` : `Invitation envoyée à ${email} ✓`)
    setEmail('')
    setInviting(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>

      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 max-w-md">
        <h2 className="font-semibold mb-3">Inviter un nouveau client</h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input type="email" placeholder="Email du client" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={inviting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {inviting ? '...' : 'Inviter'}
          </button>
        </form>
        {status && (
          <p className={`text-sm mt-2 ${status.startsWith('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
            {status}
          </p>
        )}
      </div>

      {loading ? <p className="text-gray-400">Chargement...</p>
        : clients.length === 0 ? <p className="text-gray-400">Aucun client pour l'instant. Invitez quelqu'un !</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map(client => (
              <Link key={client.id} to={`/coach/clients/${client.id}`}
                className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mb-2">
                  {(client.name ?? client.email).charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useClients.js src/pages/coach/ClientList.jsx supabase/functions/
git commit -m "feat: add client list, invitation form, and send-client-invitation Edge Function"
```

---

### Task 10: Client detail + progress charts + program assignment

**Files:**
- Write: `src/pages/coach/ClientDetail.jsx`

- [ ] **Step 1: Write `src/pages/coach/ClientDetail.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { usePrograms } from '../../hooks/usePrograms'

export default function ClientDetail() {
  const { id } = useParams()
  const { programs } = usePrograms()
  const [client, setClient] = useState(null)
  const [clientPrograms, setClientPrograms] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadClient()
    loadClientPrograms()
    loadLogs()
  }, [id])

  async function loadClient() {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setClient(data)
  }

  async function loadClientPrograms() {
    const { data } = await supabase
      .from('client_programs')
      .select('*, program:programs(*)')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
    setClientPrograms(data ?? [])
  }

  async function loadLogs() {
    const { data } = await supabase
      .from('session_logs')
      .select('*, session:program_sessions(name, week, day)')
      .eq('client_id', id)
      .order('logged_at', { ascending: false })
      .limit(50)
    setLogs(data ?? [])
  }

  async function assignProgram(e) {
    e.preventDefault()
    if (!selectedProgram) return
    setAssigning(true)
    await supabase.from('client_programs').insert({
      client_id: id,
      program_id: selectedProgram,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active'
    })
    await loadClientPrograms()
    setSelectedProgram('')
    setAssigning(false)
  }

  async function updateProgramStatus(cpId, status) {
    await supabase.from('client_programs').update({ status }).eq('id', cpId)
    await loadClientPrograms()
  }

  // Weekly completion data for chart
  const completionByWeek = logs
    .filter(l => l.completed)
    .reduce((acc, log) => {
      const week = format(new Date(log.logged_at), 'dd/MM')
      const existing = acc.find(d => d.date === week)
      if (existing) existing.séances++
      else acc.push({ date: week, séances: 1 })
      return acc
    }, [])
    .slice(-8)

  if (!client) return <div className="p-6 text-gray-400">Chargement...</div>

  const statusColors = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', done: 'bg-gray-100 text-gray-500' }
  const statusLabels = { active: 'Actif', paused: 'En pause', done: 'Terminé' }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
          {(client.name ?? client.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="text-gray-500">{client.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Programmes assignés</h2>
          <form onSubmit={assignProgram} className="flex gap-2 mb-4">
            <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choisir un programme...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="submit" disabled={assigning || !selectedProgram}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700">
              Assigner
            </button>
          </form>
          <div className="divide-y">
            {clientPrograms.map(cp => (
              <div key={cp.id} className="flex items-center justify-between py-3">
                <span className="font-medium text-sm">{cp.program?.name}</span>
                <select value={cp.status}
                  onChange={e => updateProgramStatus(cp.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 ${statusColors[cp.status]}`}>
                  {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            {clientPrograms.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun programme assigné.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Séances complétées (8 dernières semaines)</h2>
          {completionByWeek.length === 0
            ? <p className="text-sm text-gray-400">Aucune séance enregistrée.</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={completionByWeek}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="séances" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Historique des séances</h2>
        {logs.length === 0 ? <p className="text-sm text-gray-400">Aucune séance enregistrée.</p> : (
          <div className="divide-y">
            {logs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{log.session?.name}</p>
                  <p className="text-xs text-gray-400">Sem. {log.session?.week} / Jour {log.session?.day}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{format(new Date(log.logged_at), 'dd/MM/yyyy HH:mm')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${log.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {log.completed ? 'Complétée' : 'Partielle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/coach/ClientDetail.jsx
git commit -m "feat: add client detail page with program assignment and progress chart"
```

---

### Task 11: Coach Dashboard

**Files:**
- Write: `src/pages/coach/Dashboard.jsx`

- [ ] **Step 1: Write `src/pages/coach/Dashboard.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ programs: 0, exercises: 0, clients: 0 })
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    if (!profile) return
    loadStats()
  }, [profile])

  async function loadStats() {
    const [progRes, exRes, programIds] = await Promise.all([
      supabase.from('programs').select('id', { count: 'exact', head: true }).eq('coach_id', profile.id),
      supabase.from('exercises').select('id', { count: 'exact', head: true }).eq('created_by', profile.id),
      supabase.from('programs').select('id').eq('coach_id', profile.id),
    ])

    const ids = (programIds.data ?? []).map(p => p.id)
    if (ids.length === 0) {
      setStats({ programs: progRes.count ?? 0, exercises: exRes.count ?? 0, clients: 0 })
      return
    }

    const sessionIds = (await supabase.from('program_sessions').select('id').in('program_id', ids)).data?.map(s => s.id) ?? []

    const [cpRes, logsRes] = await Promise.all([
      supabase.from('client_programs').select('client_id').in('program_id', ids),
      sessionIds.length
        ? supabase.from('session_logs')
            .select('*, profiles!client_id(name), session:program_sessions(name, week, day)')
            .in('program_session_id', sessionIds)
            .order('logged_at', { ascending: false })
            .limit(5)
        : { data: [] }
    ])

    setStats({
      programs: progRes.count ?? 0,
      exercises: exRes.count ?? 0,
      clients: new Set((cpRes.data ?? []).map(c => c.client_id)).size,
    })
    setRecentLogs(logsRes.data ?? [])
  }

  const statCards = [
    { label: 'Programmes', value: stats.programs, to: '/coach/programs', color: 'text-blue-600' },
    { label: 'Exercices', value: stats.exercises, to: '/coach/exercises', color: 'text-green-600' },
    { label: 'Clients', value: stats.clients, to: '/coach/clients', color: 'text-purple-600' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, to, color }) => (
          <Link key={label} to={to}
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Activité récente</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune activité récente.</p>
        ) : (
          <div className="divide-y">
            {recentLogs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{log.profiles?.name}</p>
                  <p className="text-xs text-gray-400">{log.session?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{format(new Date(log.logged_at), 'dd/MM HH:mm')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${log.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {log.completed ? 'Complétée' : 'Partielle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/coach/Dashboard.jsx
git commit -m "feat: add coach dashboard with stats and recent activity"
```

---

## Phase 5 — Client Experience

### Task 12: Client program list + program detail

**Files:**
- Write: `src/pages/client/MyPrograms.jsx`, `src/pages/client/ProgramDetail.jsx`

- [ ] **Step 1: Write `src/pages/client/MyPrograms.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function MyPrograms() {
  const { profile } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('client_programs')
      .select('*, program:programs(*)')
      .eq('client_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPrograms(data ?? []); setLoading(false) })
  }, [profile])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes programmes</h1>
      {loading ? <p className="text-gray-400">Chargement...</p>
        : programs.length === 0
          ? <p className="text-gray-400">Aucun programme assigné pour l'instant.</p>
          : (
            <div className="space-y-3">
              {programs.map(cp => (
                <Link key={cp.id} to={`/client/programs/${cp.program_id}`}
                  className="block bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{cp.program?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cp.program?.description}</p>
                  {cp.start_date && (
                    <p className="text-xs text-blue-600 mt-2">
                      Démarré le {new Date(cp.start_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/client/ProgramDetail.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function ProgramDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [program, setProgram] = useState(null)
  const [sessions, setSessions] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())

  useEffect(() => {
    loadProgram()
    loadCompleted()
  }, [id, profile])

  async function loadProgram() {
    const { data } = await supabase.from('programs').select('*').eq('id', id).single()
    setProgram(data)
    const { data: sess } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(name))')
      .eq('program_id', id)
      .order('week').order('day')
    setSessions(sess ?? [])
  }

  async function loadCompleted() {
    if (!profile) return
    const { data } = await supabase
      .from('session_logs')
      .select('program_session_id')
      .eq('client_id', profile.id)
      .eq('completed', true)
    setCompletedIds(new Set((data ?? []).map(l => l.program_session_id)))
  }

  if (!program) return <p className="text-gray-400">Chargement...</p>

  const weeks = [...new Set(sessions.map(s => s.week))].sort((a, b) => a - b)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{program.name}</h1>
      {program.description && <p className="text-gray-500 mb-6">{program.description}</p>}

      {weeks.map(week => (
        <div key={week} className="mb-6">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Semaine {week}
          </h2>
          <div className="space-y-2">
            {sessions.filter(s => s.week === week).sort((a, b) => a.day - b.day).map(session => {
              const done = completedIds.has(session.id)
              const exCount = session.session_exercises?.length ?? 0
              return (
                <div key={session.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between ${done ? 'opacity-60' : ''}`}>
                  <div>
                    <h3 className="font-semibold">{session.name}</h3>
                    <p className="text-sm text-gray-400">{exCount} exercice{exCount !== 1 ? 's' : ''}</p>
                  </div>
                  {done ? (
                    <span className="text-green-600 font-medium text-sm">✓ Complétée</span>
                  ) : (
                    <Link to={`/client/session/${session.id}`}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                      Commencer
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/client/MyPrograms.jsx src/pages/client/ProgramDetail.jsx
git commit -m "feat: add client program list and program detail with completion status"
```

---

### Task 13: Active session (client logging)

**Files:**
- Write: `src/pages/client/ActiveSession.jsx`

- [ ] **Step 1: Write `src/pages/client/ActiveSession.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import VideoPlayer from '../../components/VideoPlayer'

export default function ActiveSession() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [logs, setLogs] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSession()
  }, [id])

  async function loadSession() {
    const { data } = await supabase
      .from('program_sessions')
      .select('*, session_exercises(*, exercise:exercises(*))')
      .eq('id', id)
      .single()
    if (!data) return
    setSession(data)
    const sorted = (data.session_exercises ?? []).sort((a, b) => a.order - b.order)
    setExercises(sorted)
    const init = {}
    sorted.forEach(ex => {
      init[ex.id] = { sets_done: ex.sets, reps_done: ex.reps, weight: '', effort: 5, notes: '' }
    })
    setLogs(init)
  }

  function updateLog(exId, field, value) {
    setLogs(prev => ({ ...prev, [exId]: { ...prev[exId], [field]: value } }))
  }

  async function handleFinish() {
    setSaving(true)
    const exercisesData = exercises.map(ex => ({
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise?.name,
      sets_done: logs[ex.id]?.sets_done,
      reps_done: logs[ex.id]?.reps_done,
      weight: logs[ex.id]?.weight,
      effort: logs[ex.id]?.effort,
      notes: logs[ex.id]?.notes,
    }))
    await supabase.from('session_logs').insert({
      client_id: profile.id,
      program_session_id: id,
      exercises_data: exercisesData,
      completed: true,
    })
    navigate(-1)
  }

  if (!session) return <div className="p-4 text-gray-400">Chargement...</div>

  const current = exercises[currentIdx]
  const progress = ((currentIdx + 1) / exercises.length) * 100

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">{session.name}</h1>
        <span className="text-sm text-gray-400">{currentIdx + 1} / {exercises.length}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {current && (
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-4">
          <h2 className="text-xl font-semibold">{current.exercise?.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {current.sets} séries × {current.reps} reps
            {current.rest_seconds ? ` · Repos ${current.rest_seconds}s` : ''}
          </p>
          {current.notes && <p className="text-sm text-blue-600 mt-1">💡 {current.notes}</p>}

          {current.exercise?.video_url && (
            <div className="mt-4">
              <VideoPlayer url={current.exercise.video_url} />
            </div>
          )}

          {current.exercise?.instructions && (
            <p className="text-sm text-gray-600 mt-4 whitespace-pre-wrap leading-relaxed">
              {current.exercise.instructions}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: 'Séries réalisées', field: 'sets_done', type: 'number', min: 0, defaultVal: current.sets },
              { label: 'Reps / Distance', field: 'reps_done', type: 'text', defaultVal: current.reps },
              { label: 'Poids (kg)', field: 'weight', type: 'number', min: 0, step: 0.5, placeholder: '—' },
              { label: 'Effort (1–10)', field: 'effort', type: 'number', min: 1, max: 10, defaultVal: 5 },
            ].map(({ label, field, type, min, max, step, placeholder, defaultVal }) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={type} min={min} max={max} step={step}
                  value={logs[current.id]?.[field] ?? defaultVal ?? ''}
                  placeholder={placeholder}
                  onChange={e => updateLog(current.id, field, type === 'number' ? e.target.value : e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea rows={2}
              value={logs[current.id]?.notes ?? ''}
              onChange={e => updateLog(current.id, 'notes', e.target.value)}
              placeholder="Comment s'est passé cet exercice ?"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(i => i - 1)}
            className="flex-1 border rounded-xl py-3 hover:bg-gray-50 font-medium">
            ← Précédent
          </button>
        )}
        {currentIdx < exercises.length - 1 ? (
          <button onClick={() => setCurrentIdx(i => i + 1)}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 font-medium">
            Suivant →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving}
            className="flex-1 bg-green-600 text-white rounded-xl py-3 hover:bg-green-700 disabled:opacity-50 font-semibold">
            {saving ? 'Sauvegarde...' : '✓ Terminer la séance'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: End-to-end test**

Log in as a client. Open a program. Start a session. Fill in sets/reps/weight/effort for each exercise. Navigate with Suivant/Précédent. Complete the session. Verify it shows as "Complétée" in ProgramDetail.

- [ ] **Step 3: Commit**

```bash
git add src/pages/client/ActiveSession.jsx
git commit -m "feat: add active session page with exercise-by-exercise logging"
```

---

## Phase 6 — Deployment

### Task 14: GitHub Actions deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 2: Push to GitHub and verify deployment**

```bash
git add .github/
git commit -m "ci: add GitHub Actions deployment to GitHub Pages"
git push origin main
```

Go to GitHub > Actions. Verify the workflow runs green. Visit `https://YOUR_USERNAME.github.io/CoachingApp/`.

- [ ] **Step 3: Update `APP_URL` in Edge Function secrets**

In Supabase dashboard > Edge Functions > send-client-invitation > Secrets, update:
- `APP_URL` = `https://YOUR_GITHUB_USERNAME.github.io/CoachingApp`

---

## Self-Review Checklist

- [x] **Spec coverage**: All spec features covered — exercise library, program builder, client invitation, client experience, progress tracking, GitHub Pages deploy
- [x] **No placeholders**: All steps contain complete, runnable code
- [x] **Type consistency**: `profile.id` used consistently; `session.id ?? session._tempId` pattern used throughout ProgramBuilder and SortableExercise
- [x] **RLS**: All tables have RLS enabled with correct policies for both roles
- [x] **Auth trigger**: `handle_new_user` trigger auto-creates profile with correct role from user metadata
- [x] **Video types**: `detectVideoType` return values (`youtube`, `vimeo`, `upload`) match `video_type` column check constraint in SQL

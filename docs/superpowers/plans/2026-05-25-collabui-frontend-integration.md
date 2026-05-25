# CollabUI Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing CollabNotes frontend with the collabUI frontend while preserving all backend collaboration features (TipTap, Yjs, Socket.io, JWT auth).

**Architecture:** collabUI provides the UI shell (TypeScript + Tailwind v4 + motion) which is wired to the existing Node.js/Express/MongoDB backend. Auth, document CRUD, and real-time editing use the existing backend endpoints and Socket.io events.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 6, motion, TipTap, Yjs, Socket.io-client, Axios

---

### Task 1: Project Setup & Dependencies

**Files:**
- Modify: `client/package.json`
- Modify: `client/vite.config.ts`
- Modify: `client/tsconfig.json`
- Create: `client/src/components/Editor/` (directory)

- [ ] **Step 1: Update package.json with merged dependencies**

Replace `client/package.json` with:

```json
{
  "name": "collabnotes-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tiptap/extension-collaboration": "^2.11.5",
    "@tiptap/extension-collaboration-cursor": "^2.11.5",
    "@tiptap/extension-placeholder": "^2.11.5",
    "@tiptap/pm": "^2.11.5",
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "axios": "^1.6.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.21.0",
    "socket.io-client": "^4.7.2",
    "y-websocket": "^2.0.3",
    "yjs": "^13.6.10"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

- [ ] **Step 2: Verify vite.config.ts has Tailwind plugin**

Read `client/vite.config.ts` and confirm it has both `@vitejs/plugin-react` and `@tailwindcss/vite`:

```
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
    },
  };
});
```

- [ ] **Step 3: Create Editor component directory**

Run: `New-Item -ItemType Directory -Path "client/src/components/Editor" -Force`

- [ ] **Step 4: Install dependencies**

Run: `cd client && npm install`

---

### Task 2: Copy collabUI Shell Files

**Files:**
- Copy from `C:\Users\Home\AppData\Local\Temp\collabui_temp\` to `client/`

- [ ] **Step 1: Copy index.html**

Copy `collabui_temp/index.html` → `client/index.html` (overwrite)

- [ ] **Step 2: Copy tsconfig.json**

Copy `collabui_temp/tsconfig.json` → `client/tsconfig.json` (overwrite)

- [ ] **Step 3: Copy src/index.css**

Copy `collabui_temp/src/index.css` → `client/src/index.css` (overwrite)

- [ ] **Step 4: Copy src/main.tsx**

Copy `collabui_temp/src/main.tsx` → `client/src/main.tsx` (overwrite)

- [ ] **Step 5: Copy src/types.ts**

Copy `collabui_temp/src/types.ts` → `client/src/types.ts` (overwrite)

- [ ] **Step 6: Copy component directories**

Run:
```powershell
Copy-Item -Path "C:\Users\Home\AppData\Local\Temp\collabui_temp\src\components\InteractiveBg.tsx" -Destination "client\src\components\InteractiveBg.tsx" -Force
Copy-Item -Path "C:\Users\Home\AppData\Local\Temp\collabui_temp\src\components\InteractiveLaptop.tsx" -Destination "client\src\components\InteractiveLaptop.tsx" -Force
Copy-Item -Path "C:\Users\Home\AppData\Local\Temp\collabui_temp\src\components\Navbar.tsx" -Destination "client\src\components\Navbar.tsx" -Force
Copy-Item -Path "C:\Users\Home\AppData\Local\Temp\collabui_temp\src\components\Pages" -Destination "client\src\components" -Recurse -Force
```

- [ ] **Step 7: Merge old client/src/lib into the new structure**

Run:
```powershell
New-Item -ItemType Directory -Path "client\src\lib" -Force
New-Item -ItemType Directory -Path "client\src\context" -Force
```

---

### Task 3: Update Types

**Files:**
- Modify: `client/src/types.ts`

- [ ] **Step 1: Extend types.ts with backend Document model**

Replace `client/src/types.ts` with types that match both the backend schema and collabUI needs:

```ts
export type ActivePage = 'landing' | 'about' | 'workflow' | 'auth' | 'dashboard' | 'editor' | 'settings';

export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Collaborator {
  userId: { _id: string; username: string; email: string };
  permission: 'view' | 'edit';
}

export interface Document {
  _id: string;
  title: string;
  content?: any;
  owner: { _id: string; username: string };
  collaborators: Collaborator[];
  versions: { _id: string; content: any; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  accessType?: 'owner' | 'collaborator';
}

export interface UserSession {
  userId: string;
  userName: string;
  userColor: string;
  email?: string;
}

export interface PresenceUser {
  id: string;
  username: string;
  color: string;
}

export type ThemeType = 'cosmic-slate' | 'amber-sunset' | 'ocean-breeze' | 'minimalist-gray';
```

---

### Task 4: API Client

**Files:**
- Create: `client/src/lib/api.ts`

- [ ] **Step 1: Write api.ts**

```ts
import axios from 'axios'

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? 'http://localhost:5000' : 'http://localhost:5000';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export { API_URL }
export default api
```

---

### Task 5: AuthContext

**Files:**
- Create: `client/src/context/AuthContext.tsx`

- [ ] **Step 1: Write AuthContext.tsx**

```tsx
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import api from '../lib/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return { success: true }
      }
      return { success: false, error: String(response.data.error || 'Login failed') }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: String(msg) }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return { success: true }
      }
      return { success: false, error: String(response.data.error || 'Registration failed') }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed'
      return { success: false, error: String(msg) }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

### Task 6: Rewire AuthPage

**Files:**
- Modify: `client/src/components/Pages/AuthPage.tsx`

- [ ] **Step 1: Replace AuthPage internals with real JWT auth**

Replace the entire content of `AuthPage.tsx` with:

```tsx
import React, { useState } from "react";
import { User, Mail, KeySquare, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let result;
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setError("Please fill in all fields");
          setSubmitting(false);
          return;
        }
        result = await login(email, password);
      } else {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("Please fill in all fields");
          setSubmitting(false);
          return;
        }
        result = await register(username, email, password);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-md relative z-10">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-display font-black text-[#37352F] tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-[#7A7A78] font-sans">
            {mode === 'login'
              ? 'Sign in to access your documents'
              : 'Register to start collaborating'}
          </p>
        </div>

        <div className="flex bg-[#F7F6F3] rounded-full p-1 border border-[#E9E9E8] mb-6 font-semibold text-xs text-[#7A7A78]">
          {[
            { id: 'login', label: 'Sign In' },
            { id: 'register', label: 'Register' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setError(""); setMode(tab.id as any); }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 cursor-pointer ${
                mode === tab.id
                  ? 'bg-brand-primary text-white font-bold shadow-sm'
                  : 'text-[#7A7A78] hover:text-[#37352F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 md:p-8 text-left shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={30}
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Password</label>
              <div className="relative">
                <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-700 italic font-medium p-2.5 rounded bg-red-50 border border-red-100 font-sans">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border border-brand-primary/5 font-sans"
            >
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 7: Rewire DashboardPage

**Files:**
- Modify: `client/src/components/Pages/DashboardPage.tsx`

- [ ] **Step 1: Replace DashboardPage internals with real document API**

Replace the entire contents of `DashboardPage.tsx`. The page keeps collabUI's glass card layout and category sidebar, but:
- Fetches from `GET /api/documents` instead of `/api/notes`
- Creates via `POST /api/documents`
- Deletes via `DELETE /api/documents/:id`
- Navigates to editor via `onSelectNote` → passes `_id` instead of `id`
- Uses `User` type from backend instead of `UserSession`
- Shows document title, owner, collaborator count

Replace with:

```tsx
import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, FileText, Calendar, ChevronRight, Activity, HelpCircle, AlertCircle } from "lucide-react";
import { Document, User } from "../../types";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface DashboardPageProps {
  onSelectNote: (id: string) => void;
  user: User;
}

export default function DashboardPage({ onSelectNote, user }: DashboardPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const categories = ["All", "Engineering", "Marketing", "General"];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired');
      } else {
        toast.error('Failed to load documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/documents', { title: newTitle.trim() || 'Untitled' });
      if (response.data.success) {
        toast.success('Document created');
        setShowCreateModal(false);
        setNewTitle('');
        onSelectNote(response.data.data._id);
      }
    } catch (error: any) {
      toast.error('Failed to create document');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      const response = await api.delete(`/documents/${id}`);
      if (response.data.success) {
        toast.success('Document deleted');
        setDocuments(prev => prev.filter(d => d._id !== id));
      }
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pt-10 text-left">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-6 shadow-sm bg-white">
            <h2 className="font-display font-black text-xl text-[#37352F] tracking-tight">
              Welcome, <span className="text-brand-primary">{user.username}</span>
            </h2>
            <p className="text-xs text-[#7A7A78] font-sans mt-2">
              Your collaborative workspace for real-time document editing.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Connected</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-brand-hover shadow-md active:scale-95 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>

          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 space-y-3 bg-white shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider uppercase">Categories</span>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-accent-bg text-brand-primary border border-brand-accent-border'
                      : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat ? 'bg-brand-primary' : 'bg-transparent border border-gray-400'}`} />
                    <span>{cat}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 space-y-4 bg-white shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider uppercase">Workspace</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Documents</span>
                <span className="font-bold text-xl text-[#37352F]">{documents.length}</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Status</span>
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-2xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary placeholder-[#7A7A78]/60 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="glass-card rounded-[24px] border-[#E9E9E8] p-12 text-center bg-white">
              <span className="text-sm text-[#7A7A78]">Loading documents...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="glass-card rounded-[24px] border-[#E9E9E8] p-12 text-center flex flex-col items-center gap-4 bg-white">
              <AlertCircle className="w-8 h-8 text-[#7A7A78]" />
              <div>
                <h3 className="font-bold text-lg text-[#37352F]">No documents found</h3>
                <p className="text-xs text-[#7A7A78] mt-1">Create a new document to get started.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => onSelectNote(doc._id)}
                  className="glass-card rounded-[24px] border-[#E9E9E8] p-5 flex flex-col justify-between h-[180px] hover:bg-[#F7F6F3]/50 hover:border-brand-primary/45 hover:scale-[1.01] transition-all cursor-pointer group bg-white shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-brand-accent-bg border border-brand-accent-border text-[9px] font-mono text-brand-primary font-semibold">
                        {doc.accessType === 'owner' ? 'Owner' : 'Editor'}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A7A78] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(doc.updatedAt)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#37352F] group-hover:text-brand-primary transition-colors line-clamp-1">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-[#7A7A78] line-clamp-3 leading-relaxed">
                      {doc.collaborators?.length > 0
                        ? `${doc.collaborators.length} collaborator${doc.collaborators.length > 1 ? 's' : ''}`
                        : 'Not shared'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Updated {formatDate(doc.updatedAt)}
                    </span>

                    {doc.accessType === 'owner' && (
                      <button
                        onClick={(e) => handleDelete(e, doc._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full text-left space-y-4 bg-white shadow-xl">
            <h2 className="font-bold text-xl text-[#37352F] tracking-tight">New Document</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Title</label>
                <input
                  type="text"
                  placeholder="Untitled"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#7A7A78] border border-gray-200 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-all cursor-pointer font-sans"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Task 8: Socket Manager (Yjs + Socket.io)

**Files:**
- Create: `client/src/components/Editor/SocketManager.ts`

- [ ] **Step 1: Write SocketManager.ts**

```ts
import { io, Socket } from 'socket.io-client'
import * as Y from 'yjs'
import { API_URL } from '../../lib/api'

interface SocketManagerCallbacks {
  onPresence: (users: { id: string; username: string; color: string }[]) => void;
  onSyncUpdate: (update: Uint8Array) => void;
  onDocumentState: (content: any) => void;
  onUserJoined: (username: string) => void;
  onUserLeft: (userId: string) => void;
  onSave: () => void;
}

export function createSocketManager(
  documentId: string,
  ydoc: Y.Doc,
  callbacks: SocketManagerCallbacks
) {
  const socket: Socket = io(API_URL, {
    auth: { token: localStorage.getItem('token') },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  let syncTimeout: ReturnType<typeof setTimeout> | null = null
  let isSettingContent = false

  socket.on('connect', () => {
    socket.emit('join-document', { documentId })
  })

  socket.on('document-state', ({ content }) => {
    if (content) {
      callbacks.onDocumentState(content)
    }
  })

  socket.on('presence', ({ users }) => {
    callbacks.onPresence(users || [])
  })

  socket.on('user-joined', ({ username }) => {
    callbacks.onUserJoined(username)
  })

  socket.on('user-left', ({ userId }) => {
    callbacks.onUserLeft(userId)
  })

  socket.on('sync-update', ({ update, content }) => {
    try {
      if (update) {
        Y.applyUpdate(ydoc, new Uint8Array(update))
      }
    } catch (e) {
      console.error('[Socket] Failed to apply update:', e)
    }
  })

  socket.on('document-saved', () => {
    callbacks.onSave()
  })

  const emitUpdate = () => {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      const update = Y.encodeStateAsUpdate(ydoc)
      socket.emit('sync-update', {
        documentId,
        update: Array.from(update),
      })
    }, 100)
  }

  const save = () => {
    socket.emit('save-document', { documentId })
  }

  const destroy = () => {
    if (syncTimeout) clearTimeout(syncTimeout)
    socket.emit('leave-document', { documentId })
    socket.disconnect()
  }

  return { socket, emitUpdate, save, destroy }
}
```

---

### Task 9: CollaborativeEditor with TipTap

**Files:**
- Modify: `client/src/components/Pages/CollaborativeEditor.tsx`

- [ ] **Step 1: Replace with full TipTap/Yjs/Socket.io editor**

Replace the entire `CollaborativeEditor.tsx`. This component:
- Keeps collabUI's glass UI shell (navbar-style header, version/share modals)
- Replaces the textarea with TipTap rich text editor
- Uses Yjs for CRDT sync via Socket.io
- Shows presence indicators, version history, share dialog
- Auto-saves with debounce

Replace with the full editor implementation that merges:
- collabUI's glass card layout and toolbar styling
- Existing Editor.jsx's TipTap setup, Y.Doc, Socket.io connection
- Version history, share, activity panels

Full implementation:

```tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Share2, History, Bold, Code, Heading1, List, CheckSquare, Users, ArrowRight } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import * as Y from 'yjs';
import toast from 'react-hot-toast';
import { Document, User } from "../../types";
import api from "../../lib/api";
import { createSocketManager } from "../Editor/SocketManager";

interface CollaborativeEditorProps {
  noteId: string;
  user: User;
  onBackToDashboard: () => void;
}

export default function CollaborativeEditor({ noteId, user, onBackToDashboard }: CollaborativeEditorProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<{ id: string; username: string; color: string }[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('edit');

  const ydocRef = useRef<Y.Doc | null>(null);
  const socketRef = useRef<any>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDocument();
    return () => {
      if (socketRef.current) socketRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [noteId]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${noteId}`);
      if (response.data.success) {
        const doc = response.data.data;
        setDocument(doc);
        setTitle(doc.title);
        initEditor(doc);
      }
    } catch (error: any) {
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const initEditor = (doc: Document) => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const sm = createSocketManager(noteId, ydoc, {
      onPresence: (users) => setPresenceUsers(users.filter(u => u.id !== user._id)),
      onSyncUpdate: () => {},
      onDocumentState: (content) => {
        if (content && editor && !editor.isDestroyed) {
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            if (parsed?.type) editor.commands.setContent(parsed);
          } catch {}
        }
      },
      onUserJoined: (username) => toast.success(`${username} joined`),
      onUserLeft: () => {},
      onSave: () => setSaving(false),
    });
    socketRef.current = sm;
  };

  const canEdit = useMemo(() => {
    if (!document) return false;
    if (document.accessType === 'owner') return true;
    return document.collaborators?.some(c => c.permission === 'edit');
  }, [document]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
    ],
    onUpdate: ({ editor: ed }) => {
      if (socketRef.current) socketRef.current.emitUpdate();

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(ed.getJSON());
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
      editable: () => canEdit,
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (document && editor && !editor.isDestroyed) {
      if (document.content) {
        try {
          const content = typeof document.content === 'string' ? JSON.parse(document.content) : document.content;
          if (content?.type) editor.commands.setContent(content);
        } catch {}
      }
    }
  }, [document, editor]);

  const saveDocument = async (content: any) => {
    setSaving(true);
    try {
      await api.put(`/documents/${noteId}`, { content: JSON.stringify(content), saveVersion: true });
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateTitle = async (newTitle: string) => {
    setTitle(newTitle);
    try {
      await api.put(`/documents/${noteId}`, { title: newTitle });
    } catch {
      toast.error('Failed to update title');
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/documents/${noteId}/versions`);
      if (response.data.success) {
        setVersions(response.data.data);
        setShowVersionHistory(true);
      }
    } catch {
      toast.error('Failed to load versions');
    }
  };

  const restoreVersion = async (versionId: string) => {
    try {
      const response = await api.post(`/documents/${noteId}/restore/${versionId}`);
      if (response.data.success && editor && !editor.isDestroyed) {
        const content = typeof response.data.data.content === 'string'
          ? JSON.parse(response.data.data.content)
          : response.data.data.content;
        if (content?.type) editor.commands.setContent(content);
        toast.success('Version restored');
        setShowVersionHistory(false);
      }
    } catch {
      toast.error('Failed to restore version');
    }
  };

  const shareDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail) return;
    try {
      const response = await api.post(`/documents/${noteId}/share`, { email: shareEmail, permission: sharePermission });
      if (response.data.success) {
        toast.success('Document shared');
        setShareEmail('');
        setShowShareModal(false);
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (loading) {
    return (
      <div className="relative pt-24 pb-20 min-h-screen flex items-center justify-center">
        <span className="text-sm text-[#7A7A78]">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      <div className="w-[94%] max-w-7xl mx-auto flex flex-col space-y-4 relative z-10 pt-4">
        {/* Header */}
        <div className="glass-card rounded-2xl border-[#E9E9E8] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={onBackToDashboard} className="p-2 rounded-xl text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => updateTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-black/10 focus:border-brand-primary focus:outline-none font-sans font-bold text-lg text-[#37352F] py-0.5 px-2 w-full sm:w-[240px] transition-all"
              readOnly={!canEdit}
            />
            {!canEdit && <span className="text-[10px] font-mono text-amber-600 font-semibold">View-only</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1.5 mr-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white border border-white">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              {presenceUsers.map((u) => (
                <div key={u.id} className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white border border-white" style={{ backgroundColor: u.color }}>
                  {u.username?.charAt(0).toUpperCase()}
                </div>
              ))}
              {presenceUsers.length > 0 && (
                <span className="pl-2 text-[10px] font-mono text-emerald-600 font-semibold">+{presenceUsers.length} active</span>
              )}
            </div>
            <button onClick={fetchVersions} className="px-4 py-2 rounded-xl bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border border-[#E9E9E8] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer">
              <History className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>
            {canEdit && document?.accessType === 'owner' && (
              <button onClick={() => setShowShareModal(true)} className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-[#7A7A78]">{saving ? 'Saving...' : 'Saved'}</span>
          </div>
        </div>

        {/* Toolbar */}
        {canEdit && (
          <div className="glass-card rounded-2xl border-[#E9E9E8] p-2 flex items-center gap-1 bg-white shadow-sm">
            {[
              { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold'), label: 'Bold' },
              { icon: Code, action: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive('code'), label: 'Code' },
            ].map(({ icon: Icon, action, active, label }) => (
              <button key={label} onClick={action} className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${active ? 'bg-brand-accent-bg text-brand-primary' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            {[
              { label: 'H1', level: 1 as const },
              { label: 'H2', level: 2 as const },
              { label: 'H3', level: 3 as const },
            ].map(({ label, level }) => (
              <button key={label} onClick={() => editor?.chain().focus().toggleHeading({ level }).run()} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${editor?.isActive('heading', { level }) ? 'bg-brand-accent-bg text-brand-primary' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'}`}>
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            {[
              { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList'), label: 'Bullet List' },
              { icon: CheckSquare, action: () => editor?.chain().focus().toggleTaskList?.().run(), active: editor?.isActive('taskList'), label: 'Task List' },
            ].map(({ icon: Icon, action, active, label }) => (
              <button key={label} onClick={action} className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${active ? 'bg-brand-accent-bg text-brand-primary' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        {/* Editor Content */}
        <div className="glass-card rounded-2xl border-[#E9E9E8] p-8 bg-white shadow-sm min-h-[400px]">
          <div className="prose prose-sm max-w-none text-[#37352F]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full space-y-4 bg-white shadow-xl">
            <h2 className="font-bold text-xl text-[#37352F]">Share Document</h2>
            <form onSubmit={shareDocument} className="space-y-4">
              <input type="email" required placeholder="collaborator@example.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm" />
              <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm">
                <option value="edit">Editor</option>
                <option value="view">Viewer</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#7A7A78] border border-gray-200 text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold">Share</button>
              </div>
            </form>
            {document?.collaborators && document.collaborators.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <span className="text-[10px] font-mono text-[#7A7A78] uppercase font-bold">Collaborators</span>
                {document.collaborators.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#F7F6F3] rounded-lg">
                    <span className="text-[#37352F]">{c.userId?.email || 'Unknown'}</span>
                    <span className="text-brand-primary font-mono text-[9px]">{c.permission}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {showVersionHistory && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] bg-white border-l border-[#E9E9E8] p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-[#37352F]">Version History</h2>
            <button onClick={() => setShowVersionHistory(false)} className="text-xs text-[#7A7A78] font-mono cursor-pointer">close</button>
          </div>
          <div className="flex-1 overflow-auto mt-4 space-y-4">
            {versions.length === 0 ? (
              <span className="text-xs text-[#7A7A78]">No versions yet</span>
            ) : (
              versions.map((v: any) => (
                <div key={v._id} className="p-4 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                  <span className="text-xs font-mono font-bold text-brand-primary">{formatDate(v.createdAt)}</span>
                  {canEdit && (
                    <button onClick={() => restoreVersion(v._id)} className="text-[10px] font-mono text-brand-primary flex items-center gap-1 cursor-pointer">
                      <span>Restore</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Task 10: Update App.tsx

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Rewire App.tsx with AuthContext and page routing**

Replace `client/src/App.tsx` to:
- Wrap everything in `AuthProvider`
- Remove mock auth (use real `useAuth()`)
- Use `User` from backend instead of `UserSession`
- Navigate based on auth state

```tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from 'react-hot-toast';
import { ActivePage, ThemeType } from "./types";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./components/Pages/LandingPage";
import AboutPage from "./components/Pages/AboutPage";
import WorkflowPage from "./components/Pages/WorkflowPage";
import AuthPage from "./components/Pages/AuthPage";
import DashboardPage from "./components/Pages/DashboardPage";
import CollaborativeEditor from "./components/Pages/CollaborativeEditor";
import SettingsPage from "./components/Pages/SettingsPage";
import InteractiveBg from "./components/InteractiveBg";

function AppContent() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [theme, setTheme] = useState<ThemeType>('cosmic-slate');
  const { user, loading } = useAuth();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!loading && user && activePage === 'landing') {
      setActivePage('dashboard');
    }
  }, [user, loading]);

  const getThemeBackgroundStyles = () => {
    switch (theme) {
      case 'amber-sunset': return 'bg-[#080402] text-[#FFF8F2] selection:bg-amber-500/20';
      case 'ocean-breeze': return 'bg-[#01070A] text-[#F0FDFA] selection:bg-cyan-500/20';
      case 'minimalist-gray': return 'bg-[#0A0A0A] text-[#F3F4F6] selection:bg-gray-500/20';
      default: return 'bg-[#05050C] text-[#F8FAFC] selection:bg-indigo-500/20';
    }
  };

  const handleAuthSuccess = () => {
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setActivePage('landing');
  };

  return (
    <div className={`min-h-screen transition-all duration-750 ease-in-out font-sans ${getThemeBackgroundStyles()} relative overflow-x-hidden`}>
      <InteractiveBg theme={theme} />
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user ? { userId: user._id, userName: user.username, userColor: '#6366f1', email: user.email } : null}
        logout={handleLogout}
        theme={theme}
      />
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage + (selectedNoteId || '')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {activePage === 'landing' && (
              <LandingPage
                onStartFree={() => setActivePage(user ? 'dashboard' : 'auth')}
                onExploreWorkflow={() => setActivePage('workflow')}
                onExploreAbout={() => setActivePage('about')}
              />
            )}
            {activePage === 'about' && <AboutPage />}
            {activePage === 'workflow' && <WorkflowPage />}
            {activePage === 'auth' && <AuthPage onSuccess={handleAuthSuccess} />}
            {activePage === 'dashboard' && user && (
              <DashboardPage
                onSelectNote={(id) => { setSelectedNoteId(id); setActivePage('editor'); }}
                user={user}
              />
            )}
            {activePage === 'editor' && user && selectedNoteId && (
              <CollaborativeEditor
                noteId={selectedNoteId}
                user={user}
                onBackToDashboard={() => setActivePage('dashboard')}
              />
            )}
            {activePage === 'settings' && (
              <SettingsPage
                theme={theme}
                setTheme={setTheme}
                user={user ? { userId: user._id, userName: user.username, userColor: '#6366f1', email: user.email } : null}
                onUpdateUser={(s) => {}}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-8 bg-black/5 text-center text-[10px] font-mono text-gray-400 border-t border-[#E9E9E8] relative z-10">
        <p>© 2026 CollabNotes Inc. Real-Time Document Synchronization Pipeline.</p>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

---

### Task 11: Cleanup Old Frontend Files

**Files:**
- Delete: old client source files that are no longer needed

- [ ] **Step 1: Remove old pages, context, and styles**

Run:
```powershell
Remove-Item -Path "client\src\pages\Login.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\pages\Register.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\pages\ForgotPassword.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\pages\ResetPassword.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\pages\Dashboard.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\pages\Editor.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\context\AuthContext.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\context\ThemeContext.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\lib\api.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\styles\index.css" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "client\src\App.jsx" -Force -ErrorAction SilentlyContinue
```

---

### Task 12: Verify Build

- [ ] **Step 1: Run TypeScript check**

Run: `cd client && npx tsc --noEmit`
Expected: No type errors (or minimal warnings)

- [ ] **Step 2: Run build**

Run: `cd client && npm run build`
Expected: Build succeeds, outputs to `client/dist/`

- [ ] **Step 3: Verify dev server starts**

Run: `cd client && npm run dev`
Expected: Vite dev server starts on port 5173

- [ ] **Step 4: Quick smoke test**

- Open http://localhost:5173 in a browser
- Verify landing page renders with 3D background
- Click "Sign In" → auth form appears
- Register/login should connect to backend (if running)
- Dashboard should show documents
- Click a document → editor loads with TipTap toolbar

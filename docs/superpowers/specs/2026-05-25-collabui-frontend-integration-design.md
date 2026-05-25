# CollabUI Frontend Integration Design

## Goal
Replace the existing CollabNotes frontend (React 18, JSX, plain CSS) with the polished collabUI frontend (React 19, TypeScript, Tailwind v4, glassmorphism) while preserving all backend functionality and collaboration features (TipTap, Yjs, Socket.io, JWT auth).

## Architecture

```
collabUI Shell (TypeScript + Tailwind v4 + motion)
├── Marketing pages (Landing, About, Workflow) — unchanged
├── Navbar — unchanged
├── InteractiveBg — unchanged
├── Settings — unchanged, theme picks expanded to 4 themes
├── AuthPage — rewired to real JWT backend
├── DashboardPage — rewired to real /api/documents
└── CollaborativeEditor — internals replaced with TipTap+Yjs+Socket.io from existing code
```

## File Inventory

### Kept from collabUI (13 files)
| File | Notes |
|---|---|
| `package.json` | Merged deps from both projects |
| `vite.config.ts` | Tailwind plugin added |
| `tsconfig.json` | Kept as-is |
| `index.html` | Kept as-is |
| `src/main.tsx` | Kept as-is |
| `src/index.css` | Tailwind v4 + 4 themes (cosmic-slate, amber-sunset, ocean-breeze, minimalist-gray) |
| `src/types.ts` | Adapted — merge Document model from backend |
| `src/App.tsx` | Adapted — wired to real AuthContext, JWT flow |
| `src/components/Navbar.tsx` | Unchanged |
| `src/components/InteractiveBg.tsx` | Unchanged |
| `src/components/InteractiveLaptop.tsx` | Unchanged |
| `src/components/Pages/LandingPage.tsx` | Unchanged |
| `src/components/Pages/AboutPage.tsx` | Unchanged |
| `src/components/Pages/WorkflowPage.tsx` | Unchanged |
| `src/components/Pages/SettingsPage.tsx` | Unchanged |

### Rewired to real backend (3 files)
| File | Changes |
|---|---|
| `src/components/Pages/AuthPage.tsx` | Replace mock auth with real `POST /api/auth/login` & `/register`. Accept `{ username, email, password }`. Return JWT. Add error handling. |
| `src/components/Pages/DashboardPage.tsx` | Replace `/api/notes` with `GET /api/documents` (Bearer token). Replace `Note` type with backend `Document`. Remove mock data fallback. |
| `src/components/Pages/CollaborativeEditor.tsx` | Replace raw textarea+WebSocket with TipTap+Yjs+Socket.io from existing `Editor.jsx`. Keep collabUI's glass UI shell, navbar-style toolbar, version/share modals, presence indicators. |

### Ported from existing frontend (4 files)
| File | Source | Notes |
|---|---|---|
| `src/context/AuthContext.tsx` | `client/src/context/AuthContext.jsx` | Port to TS, keep login/register/logout + JWT localStorage |
| `src/lib/api.ts` | `client/src/lib/api.js` | Port to TS, Axios with JWT interceptor, base URL from env |
| `src/components/Editor/TipTapEditor.tsx` | `client/src/pages/Editor.jsx` (lines 245-291) | TipTap setup with StarterKit, Placeholder, Collaboration extensions |
| `src/components/Editor/SocketManager.ts` | `client/src/pages/Editor.jsx` (lines 112-218) | Socket.io connection, room join/leave, Yjs sync, presence |

### Removed (old frontend)
- `client/src/pages/Login.jsx` — replaced by AuthPage
- `client/src/pages/Register.jsx` — replaced by AuthPage
- `client/src/pages/ForgotPassword.jsx` — not in collabUI scope
- `client/src/pages/ResetPassword.jsx` — not in collabUI scope
- `client/src/pages/Dashboard.jsx` — replaced
- `client/src/pages/Editor.jsx` — logic extracted into new files
- `client/src/styles/index.css` — replaced by Tailwind
- `client/src/context/AuthContext.jsx` — ported to TS
- `client/src/context/ThemeContext.jsx` — replaced by collabUI's theme system
- `client/src/lib/api.js` — ported to TS

## Data Flow

### Authentication
```
AuthPage → api.post('/auth/login', { email, password })
         → { success, data: { token, user } }
         → localStorage.setItem('token', token)
         → localStorage.setItem('user', JSON.stringify(user))
         → AuthContext updates → App navigates to dashboard
```

### Document Listing
```
DashboardPage mount → AuthContext (check token)
                    → api.get('/documents')
                    → { success, data: Document[] }
                    → render document cards (title, updatedAt, collaborators)
Create → api.post('/documents', { title })
Delete → api.delete('/documents/:id')
```

### Real-Time Editing
```
CollaborativeEditor mount → api.get('/documents/:id')
                          → Socket.io connect (auth: { token })
                          → emit 'join-document', { documentId }
                          → Y.Doc init + TipTap editor
                          → on editor update:
                              - emit 'sync-update' (throttled 100ms)
                              - auto-save (debounced 1000ms) via api.put
                          → on incoming 'sync-update': Y.applyUpdate
                          → on incoming 'presence': update user list
                          → on 'document-state': set editor content
```

## Component Relationships

```
App.tsx
├── AuthProvider (context)
│   ├── InteractiveBg (always rendered)
│   ├── Navbar (always rendered, shows user state)
│   └── AnimatePresence page router
│       ├── LandingPage (public)
│       ├── AboutPage (public)
│       ├── WorkflowPage (public)
│       ├── AuthPage (public — login/register)
│       ├── DashboardPage (protected — requires user)
│       ├── CollaborativeEditor (protected — requires user + noteId)
│       │   ├── TipTapEditor (MenuBar + EditorContent)
│       │   └── SocketManager (useEffect-based)
│       └── SettingsPage (public)
```

## Dependencies

### Package.json (merged)
From existing: `@tiptap/*`, `yjs`, `y-websocket`, `socket.io-client`, `axios`, `react-hot-toast`, `react-router-dom`, `lucide-react`
From collabUI: `tailwindcss@^4`, `@tailwindcss/vite`, `motion`
Keep: `vite`, `@vitejs/plugin-react`, `typescript`

### Vite config
Add `@tailwindcss/vite` plugin. Keep existing React plugin.

## Error Handling
- AuthPage: show inline error for invalid credentials
- DashboardPage: toast on fetch failure, redirect to login on 401
- CollaborativeEditor: toast on save/version/share failures, socket reconnect with exponential backoff
- API client interceptor: clear token on 401, redirect to login

## Edge Cases
- **No token on mount** → redirect to landing/auth page
- **Socket disconnect** → auto-reconnect (10 attempts, 1s delay)
- **Concurrent edits** → handled by Yjs CRDT
- **Version limit** → backend enforces 50 snapshots
- **View-only access** → editor sets `editable: false`, shows banner

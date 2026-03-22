# B.L.A.S.T. Collaborative Notes App - Specification

## 1. Project Overview
- **Name**: CollabNotes
- **Type**: Full-stack real-time collaborative notes application
- **Core**: Notion-like rich text editor with multi-user real-time collaboration

## 2. Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT (jsonwebtoken)
- bcryptjs
- yjs + y-websocket

### Frontend
- React 18 + Vite
- React Router v6
- Axios
- Socket.io-client
- TipTap editor
- Yjs + y-websocket
- CSS Modules

## 3. Features

### Authentication
- User registration with username, email, password
- Login with email/password returning JWT
- JWT middleware protecting all routes
- Password hashing with bcrypt (10 rounds)

### Document Management
- Create, read, update, delete documents
- Document title (default: "Untitled")
- List all user's documents on dashboard
- Search documents by title
- Delete document (owner only)

### Real-Time Collaboration
- Yjs CRDT for conflict-free editing
- Socket.io rooms per document
- Live cursors with colored labels
- Presence indicators (online users)
- Auto-reconnection on disconnect

### Version History
- Save version snapshots (limit: 50)
- View version history
- Restore to previous version

### Sharing
- Share with other users
- Permission levels: view, edit
- Remove collaborators (owner only)

## 4. API Design

### Auth Endpoints
```
POST /api/auth/register
  Body: { username, email, password }
  Response: { success, data: { token, user } }

POST /api/auth/login
  Body: { email, password }
  Response: { success, data: { token, user } }
```

### Document Endpoints
```
GET /api/documents
  Headers: Authorization: Bearer <token>
  Response: { success, data: documents[] }

POST /api/documents
  Headers: Authorization: Bearer <token>
  Body: { title? }
  Response: { success, data: document }

GET /api/documents/:id
  Headers: Authorization: Bearer <token>
  Response: { success, data: document }

PUT /api/documents/:id
  Headers: Authorization: Bearer <token>
  Body: { title?, content? }
  Response: { success, data: document }

DELETE /api/documents/:id
  Headers: Authorization: Bearer <token>
  Response: { success, message }

POST /api/documents/:id/share
  Headers: Authorization: Bearer <token>
  Body: { email, permission }
  Response: { success, message }

DELETE /api/documents/:id/share/:userId
  Headers: Authorization: Bearer <token>
  Response: { success, message }

GET /api/documents/:id/versions
  Headers: Authorization: Bearer <token>
  Response: { success, data: versions[] }

POST /api/documents/:id/restore/:versionId
  Headers: Authorization: Bearer <token>
  Response: { success, data: document }
```

## 5. Socket Events

### Client → Server
- `join-document` - { documentId }
- `leave-document` - { documentId }
- `sync-update` - { documentId, update }
- `cursor-update` - { documentId, cursor }

### Server → Client
- `user-joined` - { userId, username }
- `user-left` - { userId }
- `sync-update` - { update }
- `cursor-update` - { userId, username, cursor, color }
- `presence` - { users[] }

## 6. UI Design

### Pages
1. **Login** - Email/password form, link to register
2. **Register** - Username/email/password form, link to login
3. **Dashboard** - Document list with search, create button
4. **Editor** - Full-screen editor with sidebar

### Components
- Navbar with user info and logout
- Sidebar with document list and search
- TipTap toolbar (bold, italic, headings, lists, code)
- Cursor overlays with username labels
- Toast notifications
- Theme toggle (dark/light)

### Colors
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Background Dark: #0f172a
- Background Light: #f8fafc
- Glassmorphism: backdrop-blur, semi-transparent

## 7. File Structure
```
/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── index.js
│   └── .env
├── package.json
└── SPEC.md
```

# Task Plan: B.L.A.S.T. Collaborative Notes App

## Phases

### Phase 1: Project Setup & Architecture
- [x] Initialize project structure (client/, server/)
- [ ] Create SPEC.md with full requirements
- [ ] Set up MongoDB connection
- [ ] Configure environment variables

### Phase 2: Backend - Core APIs
- [ ] User model & registration/login endpoints
- [ ] Document model with versioning
- [ ] JWT authentication middleware
- [ ] REST API for document CRUD
- [ ] Share/permission endpoints

### Phase 3: Backend - Real-Time
- [ ] Socket.io server setup
- [ ] Yjs WebSocket provider
- [ ] Room-based document editing
- [ ] Presence indicators
- [ ] Auto-save with debouncing

### Phase 4: Frontend - Core UI
- [ ] Vite + React setup
- [ ] React Router navigation
- [ ] Login/Register pages
- [ ] Dashboard with document list
- [ ] Sidebar with search

### Phase 5: Frontend - Editor
- [ ] TipTap editor integration
- [ ] Yjs collaboration setup
- [ ] Live cursors with labels
- [ ] Toolbar implementation
- [ ] Dark/light theme

### Phase 6: Integration & Polish
- [ ] Connect frontend to backend
- [ ] Toast notifications
- [ ] Version history UI
- [ ] Responsive design
- [ ] Error handling

### Phase 7: Testing & Deployment
- [ ] Test all features
- [ ] Production build
- [ ] Documentation

## Goals
1. Real-time collaboration with CRDT conflict resolution
2. JWT-secured authentication
3. Modern glassmorphism UI
4. Production-ready error handling

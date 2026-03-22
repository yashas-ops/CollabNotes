# Findings

## Technology Stack
- Node.js 22.17.1 / npm 10.9.2
- React 18 + Vite 5
- TipTap for rich text editing
- Yjs + y-websocket for CRDT collaboration
- Socket.io for WebSocket communication
- MongoDB with Mongoose
- JWT for authentication

## Key Libraries
### Backend
- express, mongoose, socket.io, jsonwebtoken, bcryptjs, cors, dotenv
- yjs, y-websocket (for Yjs document sync)

### Frontend
- react, react-dom, react-router-dom, axios, socket.io-client
- @tiptap/react, @tiptap/starter-kit, @tiptap/extension-collaboration
- @tiptap/extension-collaboration-cursor
- yjs, y-websocket

## Architecture Decisions
1. Room-based Socket.io: Each document is a room
2. Yjs for CRDT: Handles conflict resolution automatically
3. Debounced auto-save: 1 second delay before saving to MongoDB
4. Version snapshots: Save every 10 minutes or on significant changes

## Constraints
- MongoDB must be running locally or via Atlas
- Environment variables required for JWT secret and MongoDB URI
- CORS configured for frontend origin

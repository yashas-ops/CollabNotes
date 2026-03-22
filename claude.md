# Project Constitution

## Data Schemas

### User
```json
{
  "_id": "ObjectId",
  "username": "string (unique, 3-30 chars)",
  "email": "string (unique, valid email)",
  "password": "string (hashed, bcrypt)",
  "createdAt": "Date"
}
```

### Document
```json
{
  "_id": "ObjectId",
  "title": "string (default: 'Untitled')",
  "content": "object (Yjs document state)",
  "owner": "ObjectId (ref: User)",
  "collaborators": [
    {
      "userId": "ObjectId",
      "permission": "string (view|edit)"
    }
  ],
  "versions": [
    {
      "content": "object",
      "createdAt": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Behavioral Rules
1. Authentication required for all document operations
2. Only owner can delete document or manage collaborators
3. Collaborators can edit if permission is "edit"
4. Version history limited to 50 snapshots per document
5. Auto-save debounced to 1000ms
6. Socket rooms named as "document:{documentId}"

## Architectural Invariants
1. JWT token expires in 7 days
2. Passwords hashed with bcrypt (10 rounds)
3. All API responses follow {success, data, error} format
4. Yjs document state synced via y-websocket
5. MongoDB indexes on user.email and document.owner

## API Endpoints

### Auth
- POST /api/auth/register - {username, email, password} → {token, user}
- POST /api/auth/login - {email, password} → {token, user}

### Documents
- GET /api/documents - List user's documents
- POST /api/documents - Create new document
- GET /api/documents/:id - Get document
- PUT /api/documents/:id - Update document
- DELETE /api/documents/:id - Delete document
- POST /api/documents/:id/share - Add collaborator
- DELETE /api/documents/:id/share/:userId - Remove collaborator
- GET /api/documents/:id/versions - Get version history
- POST /api/documents/:id/restore/:versionId - Restore version

## Socket Events
- join-document - Join document room
- leave-document - Leave document room
- sync-update - Yjs document update
- cursor-update - Cursor position change
- presence-update - User presence in document

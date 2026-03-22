# CollabNotes

Real-time collaborative notes application with rich text editing, multi-user collaboration, and version history.

## Features

- Real-time collaboration with CRDT (Yjs)
- TipTap rich text editor with formatting toolbar
- Live cursors and presence indicators
- JWT authentication
- Document versioning and restore
- Share documents with view/edit permissions
- Dark/light theme
- Glassmorphism UI design

## Tech Stack

- **Frontend**: React 18, Vite, TipTap, Yjs, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **Database**: MongoDB with Mongoose

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Configuration

1. Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabnotes
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

2. Update `client/vite.config.js` if your server runs on a different port.

### Running

```bash
# Run both server and client
npm run dev

# Or run separately:
npm run dev:server  # Starts backend on port 5000
npm run dev:client  # Starts frontend on port 5173
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Documents
- `GET /api/documents` - List user's documents
- `POST /api/documents` - Create document
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document
- `DELETE /api/documents/:id/share/:userId` - Remove collaborator
- `GET /api/documents/:id/versions` - Get version history
- `POST /api/documents/:id/restore/:versionId` - Restore version

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth middleware
│   ├── socket/            # Socket.io handlers
│   └── index.js           # Server entry
├── package.json
└── README.md
```

## License

MIT

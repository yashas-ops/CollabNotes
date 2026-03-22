import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';

const userColors = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', 
  '#34d399', '#22d3ee', '#60a5fa', '#a78bfa', 
  '#f472b6', '#e879f9'
];

const documents = new Map();
const documentUsers = new Map();
const typingUsers = new Map();

// Permission cache: documentId -> Map<userId, { permission: 'owner'|'edit'|'view' }>
const permissionCache = new Map();

// Throttle map for sync updates
const syncThrottle = new Map();

function getRandomColor() {
  return userColors[Math.floor(Math.random() * userColors.length)];
}

function scheduleAutoSave(documentId) {
  if (!documents.has(documentId)) return;
  
  const docData = documents.get(documentId);
  
  if (docData.saveTimeout) {
    clearTimeout(docData.saveTimeout);
  }
  
  docData.saveTimeout = setTimeout(async () => {
    try {
      const state = documents.get(documentId);
      if (!state || !state.content) return;
      
      const document = await Document.findById(documentId);
      if (document) {
        document.content = state.content;
        await document.save();
      }
    } catch (error) {
      console.error('[Socket] Auto-save error:', error);
    }
  }, 3000); // 3s debounce for auto-save
}

function leaveDocument(socket, documentId) {
  socket.leave(documentId);
  
  if (documentUsers.has(documentId)) {
    documentUsers.get(documentId).delete(socket.userId);
    
    const users = Array.from(documentUsers.get(documentId).values());
    io.to(documentId).emit('presence', { users });
    
    if (documentUsers.get(documentId).size === 0) {
      documentUsers.delete(documentId);
      
      if (documents.has(documentId)) {
        const docData = documents.get(documentId);
        if (docData.saveTimeout) {
          clearTimeout(docData.saveTimeout);
        }
        documents.delete(documentId);
      }
      
      // Clean up permission cache when no users remain
      if (permissionCache.has(documentId)) {
        permissionCache.delete(documentId);
      }
    }
  }
  
  // Clean up individual user's permission cache entry
  if (permissionCache.has(documentId)) {
    permissionCache.get(documentId).delete(socket.userId);
  }
  
  if (typingUsers.has(documentId)) {
    typingUsers.get(documentId).delete(socket.userId);
    const typingList = Array.from(typingUsers.get(documentId).values());
    io.to(documentId).emit('typing-update', { users: typingList });
  }
  
  socket.to(documentId).emit('user-left', {
    userId: socket.userId
  });
  
  Activity.logActivity(
    documentId,
    socket.userId,
    socket.user.username,
    'left',
    'left the document'
  ).catch(err => console.error('Activity log error:', err));
}

let io;

export function initializeSocket(socketIO) {
  io = socketIO;
  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id username email').lean();
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      socket.userId = user._id.toString();
      socket.userColor = getRandomColor();
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.username}`);

    socket.on('join-document', async ({ documentId }) => {
      try {
        // First leave any existing document room to prevent duplicates
        for (const [docId, users] of documentUsers.entries()) {
          if (users.has(socket.userId) && docId !== documentId) {
            leaveDocument(socket, docId);
          }
        }
        
        // Fetch latest document state from DB
        const document = await Document.findById(documentId)
          .select('title content owner collaborators')
          .lean();
        
        if (!document) {
          socket.emit('error', { message: 'Document not found' });
          return;
        }
        
        // Check access
        const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
        const isOwner = ownerId === socket.userId;
        let userPermission = null;
        
        if (isOwner) {
          userPermission = 'owner';
        } else {
          const collab = document.collaborators?.find(c => {
            const cId = c.userId._id ? c.userId._id.toString() : c.userId.toString();
            return cId === socket.userId;
          });
          if (collab) {
            userPermission = collab.permission; // 'view' or 'edit'
          }
        }
        
        if (!userPermission) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }
        
        socket.join(documentId);
        
        // Cache this user's permission for this document (avoids DB queries on sync-update)
        if (!permissionCache.has(documentId)) {
          permissionCache.set(documentId, new Map());
        }
        permissionCache.get(documentId).set(socket.userId, userPermission);
        
        // Update or create document state in memory
        if (!documents.has(documentId)) {
          documents.set(documentId, {
            ydoc: null,
            awareness: null,
            lastSave: Date.now(),
            saveTimeout: null,
            content: document.content
          });
        } else {
          documents.get(documentId).content = document.content;
          documents.get(documentId).lastSave = Date.now();
        }
        
        if (!documentUsers.has(documentId)) {
          documentUsers.set(documentId, new Map());
        }
        
        if (!typingUsers.has(documentId)) {
          typingUsers.set(documentId, new Map());
        }
        
        documentUsers.get(documentId).set(socket.userId, {
          id: socket.userId,
          username: socket.user.username,
          color: socket.userColor
        });
        
        const users = Array.from(documentUsers.get(documentId).values());
        io.to(documentId).emit('presence', { users });
        
        // Send document state to joiner
        socket.emit('document-state', {
          content: document.content,
          title: document.title
        });
        
        // Notify others
        socket.to(documentId).emit('user-joined', {
          userId: socket.userId,
          username: socket.user.username,
          color: socket.userColor
        });
        
        Activity.logActivity(
          documentId,
          socket.userId,
          socket.user.username,
          'joined',
          'joined the document'
        ).catch(err => console.error('Activity log error:', err));
      } catch (error) {
        console.error('[Socket] Join document error:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    socket.on('leave-document', ({ documentId }) => {
      leaveDocument(socket, documentId);
    });

    socket.on('sync-update', ({ documentId, update, content }) => {
      try {
        // Throttle updates - minimum 50ms between updates per user per document
        const throttleKey = `${documentId}:${socket.userId}`;
        const now = Date.now();
        const lastUpdate = syncThrottle.get(throttleKey) || 0;
        
        if (now - lastUpdate < 50) {
          return;
        }
        syncThrottle.set(throttleKey, now);
        
        // Periodically clean old throttle entries
        if (syncThrottle.size > 500) {
          for (const [key, time] of syncThrottle.entries()) {
            if (now - time > 5000) syncThrottle.delete(key);
          }
        }
        
        // Check permission from in-memory cache (NO database query!)
        const docPermissions = permissionCache.get(documentId);
        if (!docPermissions) return;
        
        const userPerm = docPermissions.get(socket.userId);
        if (!userPerm || userPerm === 'view') {
          socket.emit('error', { message: 'You do not have permission to edit' });
          return;
        }
        
        if (content && documents.has(documentId)) {
          documents.get(documentId).content = content;
          scheduleAutoSave(documentId);
        }
        
        // Broadcast to ALL clients EXCEPT sender
        socket.to(documentId).emit('sync-update', {
          update,
          content,
          userId: socket.userId
        });
      } catch (error) {
        console.error('[Socket] Sync update error:', error);
      }
    });

    socket.on('cursor-update', ({ documentId, cursor }) => {
      socket.to(documentId).emit('cursor-update', {
        userId: socket.userId,
        username: socket.user.username,
        cursor,
        color: socket.userColor
      });
    });

    socket.on('typing', ({ documentId }) => {
      if (!typingUsers.has(documentId)) {
        typingUsers.set(documentId, new Map());
      }
      
      typingUsers.get(documentId).set(socket.userId, {
        id: socket.userId,
        username: socket.user.username,
        color: socket.userColor
      });
      
      const typingList = Array.from(typingUsers.get(documentId).values());
      socket.to(documentId).emit('typing-update', { users: typingList });
    });

    socket.on('stop-typing', ({ documentId }) => {
      if (typingUsers.has(documentId)) {
        typingUsers.get(documentId).delete(socket.userId);
        const typingList = Array.from(typingUsers.get(documentId).values());
        io.to(documentId).emit('typing-update', { users: typingList });
      }
    });

    socket.on('save-document', async ({ documentId, content }) => {
      try {
        const document = await Document.findById(documentId);
        if (!document || !document.canEdit(socket.userId)) {
          socket.emit('error', { message: 'You do not have permission to save' });
          return;
        }
        
        if (documents.has(documentId) && documents.get(documentId).saveTimeout) {
          clearTimeout(documents.get(documentId).saveTimeout);
        }
        
        document.content = content;
        await document.save();
        
        if (documents.has(documentId)) {
          documents.get(documentId).content = content;
          documents.get(documentId).lastSave = Date.now();
          documents.get(documentId).pendingContent = null;
        }
        
        // Notify ALL clients including sender
        io.to(documentId).emit('document-saved', {
          userId: socket.userId,
          timestamp: Date.now()
        });
        
        Activity.logActivity(
          documentId,
          socket.userId,
          socket.user.username,
          'edited',
          'saved the document'
        ).catch(err => console.error('Activity log error:', err));
      } catch (error) {
        console.error('[Socket] Save document error:', error);
        socket.emit('error', { message: 'Failed to save document' });
      }
    });

    socket.on('disconnect', () => {
      for (const [documentId, users] of documentUsers.entries()) {
        if (users.has(socket.userId)) {
          leaveDocument(socket, documentId);
        }
      }
    });
  });

  // Version snapshot interval (every 10 minutes)
  setInterval(async () => {
    for (const [documentId] of documents) {
      try {
        const document = await Document.findById(documentId);
        if (document && document.versions.length < 50) {
          if (Date.now() - documents.get(documentId).lastSave > 600000) {
            document.addVersion(document.content);
            await document.save();
            documents.get(documentId).lastSave = Date.now();
          }
        }
      } catch (error) {
        console.error('Version snapshot error:', error);
      }
    }
  }, 600000);
}

// Export function to notify collaborator when added (called from HTTP route)
export function notifyCollaboratorJoined(documentId, userId, username) {
  if (io && documentUsers.has(documentId)) {
    io.to(documentId).emit('user-joined', {
      userId,
      username,
      color: getRandomColor()
    });
    
    const users = Array.from(documentUsers.get(documentId).values());
    io.to(documentId).emit('presence', { users });
  }
}

export { io };

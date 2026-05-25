import { io, Socket } from 'socket.io-client'
import * as Y from 'yjs'
import { API_URL } from './api'

type EventHandler = (...args: any[]) => void

interface PresenceUser {
  id: string
  username: string
  color: string
}

export class SocketManager {
  private socket: Socket | null = null
  private documentId: string | null = null
  private listeners: Map<string, Set<EventHandler>> = new Map()
  private ydoc: Y.Doc | null = null

  connect(token: string) {
    if (this.socket?.connected) return

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })

    this.socket.on('connect', () => {
      this.emit('status', 'connected')
      if (this.documentId) {
        this.socket?.emit('join-document', { documentId: this.documentId })
      }
    })

    this.socket.on('disconnect', () => {
      this.emit('status', 'disconnected')
    })

    this.socket.on('reconnect', () => {
      if (this.documentId) {
        this.socket?.emit('join-document', { documentId: this.documentId })
      }
    })

    this.socket.on('connect_error', (err) => {
      this.emit('error', err.message || 'Connection failed')
    })

    this.socket.on('document-state', (data: { content?: any; title?: string }) => {
      this.emit('document-state', data)
    })

    this.socket.on('sync-update', (data: { update?: number[]; content?: any; userId?: string }) => {
      if (data.update && this.ydoc) {
        const updateArray = new Uint8Array(data.update)
        Y.applyUpdate(this.ydoc, updateArray)
      }
      this.emit('sync-update', data)
    })

    this.socket.on('presence', (data: { users: PresenceUser[] }) => {
      this.emit('presence', data)
    })

    this.socket.on('user-joined', (data: { userId: string; username: string; color: string }) => {
      this.emit('user-joined', data)
    })

    this.socket.on('user-left', (data: { userId: string }) => {
      this.emit('user-left', data)
    })

    this.socket.on('typing-update', (data: { users: PresenceUser[] }) => {
      this.emit('typing-update', data)
    })

    this.socket.on('cursor-update', (data: { userId: string; username: string; cursor: any; color: string }) => {
      this.emit('cursor-update', data)
    })

    this.socket.on('document-saved', (data: { userId: string; timestamp: number }) => {
      this.emit('document-saved', data)
    })

    this.socket.on('error', (data: { message: string }) => {
      this.emit('error', data.message || 'Socket error')
    })
  }

  disconnect() {
    if (this.documentId) {
      this.socket?.emit('leave-document', { documentId: this.documentId })
    }
    this.socket?.disconnect()
    this.socket = null
    this.documentId = null
    this.ydoc = null
    this.listeners.clear()
  }

  joinDocument(documentId: string, ydoc: Y.Doc) {
    this.documentId = documentId
    this.ydoc = ydoc
    if (this.socket?.connected) {
      this.socket.emit('join-document', { documentId })
    }
  }

  leaveDocument() {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('leave-document', { documentId: this.documentId })
    }
    this.documentId = null
    this.ydoc = null
  }

  emitSyncUpdate(update: Uint8Array, content?: any) {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('sync-update', {
        documentId: this.documentId,
        update: Array.from(update),
        content: content || undefined
      })
    }
  }

  emitCursorUpdate(cursor: any) {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('cursor-update', {
        documentId: this.documentId,
        cursor
      })
    }
  }

  emitTyping() {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('typing', { documentId: this.documentId })
    }
  }

  emitStopTyping() {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('stop-typing', { documentId: this.documentId })
    }
  }

  emitSaveDocument(content: any) {
    if (this.documentId && this.socket?.connected) {
      this.socket.emit('save-document', {
        documentId: this.documentId,
        content
      })
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    return () => this.listeners.get(event)?.delete(handler)
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(handler => handler(...args))
  }

  isConnected() {
    return this.socket?.connected ?? false
  }
}

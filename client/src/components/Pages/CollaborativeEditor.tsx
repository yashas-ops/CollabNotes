import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import toast from 'react-hot-toast'
import * as Y from 'yjs'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import {
  ArrowLeft, Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Undo2, Redo2,
  Share2, History, Download, Users, X, Eye, Edit2, Plus, Check
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api, { API_URL } from '../../lib/api'
import { SocketManager } from '../../lib/SocketManager'
import type { Document, PresenceUser } from '../../types'

interface CollaborativeEditorProps {
  documentId: string
  onBackToDashboard: () => void
}

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: any[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function CollaborativeEditor({ documentId, onBackToDashboard }: CollaborativeEditorProps) {
  const { user, loading: authLoading } = useAuth()

  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [typingUsers, setTypingUsers] = useState<PresenceUser[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('edit')
  const [removingCollabId, setRemovingCollabId] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPresencePanel, setShowPresencePanel] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [previewVersionContent, setPreviewVersionContent] = useState<any>(null)
  const [loadingVersion, setLoadingVersion] = useState(false)

  const socketManagerRef = useRef<SocketManager | null>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSettingContentRef = useRef(false)
  const unsubsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      onBackToDashboard()
      return
    }
    if (!authLoading && user && documentId) {
      fetchDocument()
    }
  }, [authLoading, user, documentId])

  useEffect(() => {
    return () => {
      unsubsRef.current.forEach(fn => fn())
      unsubsRef.current = []
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect()
        socketManagerRef.current = null
      }
      if (ydocRef.current) {
        ydocRef.current.destroy()
        ydocRef.current = null
      }
    }
  }, [documentId])

  useEffect(() => {
    if (document && !socketManagerRef.current) {
      initializeCollaboration()
    }
  }, [document])

  const canEdit = useMemo(() => {
    if (!document || !user) return false
    const isOwner = document.accessType === 'owner'
    const isEditor = document.collaborators?.some(
      c => c.userId?._id === user._id && c.permission === 'edit'
    )
    return isOwner || isEditor
  }, [document, user])

  const fetchDocument = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Session expired. Please login again.')
      onBackToDashboard()
      setLoading(false)
      return
    }
    try {
      const response = await api.get(`/documents/${documentId}`)
      if (response.data.success) {
        setDocument(response.data.data)
        setTitle(response.data.data.title)
      }
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to load document'))
      if (error.response?.status === 401 || error.response?.status === 403) {
        onBackToDashboard()
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeCollaboration = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const socketManager = new SocketManager()
    socketManagerRef.current = socketManager

    socketManager.connect(token)
    socketManager.joinDocument(documentId, ydoc)

    unsubsRef.current.push(
      socketManager.on('status', (status: string) => {
        setSocketConnected(status === 'connected')
      })
    )

    unsubsRef.current.push(
      socketManager.on('document-state', ({ content, title: docTitle }: { content?: any; title?: string }) => {
        if (content && editor && !isSettingContentRef.current) {
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content
            if (parsed && parsed.type) {
              isSettingContentRef.current = true
              editor.commands.setContent(parsed)
              setTimeout(() => { isSettingContentRef.current = false }, 100)
            }
          } catch (_e) {}
        }
        if (docTitle) setTitle(docTitle)
      })
    )

    unsubsRef.current.push(
      socketManager.on('presence', ({ users }: { users: PresenceUser[] }) => {
        setPresenceUsers(users.filter(u => u.id !== user?._id))
      })
    )

    unsubsRef.current.push(
      socketManager.on('user-joined', ({ username }: { username: string }) => {
        toast.success(`${username} joined the document`)
      })
    )

    unsubsRef.current.push(
      socketManager.on('user-left', ({ userId }: { userId: string }) => {
        setPresenceUsers(prev => prev.filter(u => u.id !== userId))
      })
    )

    unsubsRef.current.push(
      socketManager.on('typing-update', ({ users }: { users: PresenceUser[] }) => {
        setTypingUsers(users.filter(u => u.id !== user?._id))
      })
    )

    unsubsRef.current.push(
      socketManager.on('sync-update', ({ content }: { content?: any }) => {
        if (content && editor && !isSettingContentRef.current) {
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content
            if (parsed && parsed.type) {
              isSettingContentRef.current = true
              editor.commands.setContent(parsed)
              setTimeout(() => { isSettingContentRef.current = false }, 100)
            }
          } catch (_e) {}
        }
      })
    )

    unsubsRef.current.push(
      socketManager.on('document-saved', ({ userId: savedBy, timestamp }: { userId: string; timestamp: number }) => {
        if (savedBy !== user?._id) {
          setLastSaved(new Date(timestamp))
        }
      })
    )

    unsubsRef.current.push(
      socketManager.on('error', (message: string) => {
        toast.error(message)
      })
    )

    ydoc.on('update', (update: Uint8Array) => {
      socketManager.emitSyncUpdate(update)
    })
  }

  const emitTyping = useCallback(() => {
    socketManagerRef.current?.emitTyping()
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketManagerRef.current?.emitStopTyping()
    }, 1000)
  }, [])

  const saveDocument = async (content: any) => {
    if (!canEdit) return
    setSaving(true)
    try {
      await api.put(`/documents/${documentId}`, {
        content: JSON.stringify(content),
        saveVersion: true
      })
      setLastSaved(new Date())
      socketManagerRef.current?.emitSaveDocument(content)
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      ...(ydocRef.current ? [
        Collaboration.configure({ document: ydocRef.current })
      ] : [])
    ],
    onUpdate: ({ editor: ed }) => {
      emitTyping()
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        if (ydocRef.current && socketManagerRef.current) {
          const update = Y.encodeStateAsUpdate(ydocRef.current)
          socketManagerRef.current.emitSyncUpdate(update)
        }
      }, 100)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(ed.getJSON())
      }, 1000)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[400px] ${!canEdit ? 'select-none' : ''}`
      },
      editable: () => canEdit
    }
  }, [ydocRef.current, canEdit])

  useEffect(() => {
    if (document && editor && !editor.isDestroyed) {
      if (document.content) {
        try {
          const content = typeof document.content === 'string'
            ? JSON.parse(document.content)
            : document.content
          if (content && content.type) {
            isSettingContentRef.current = true
            editor.commands.setContent(content)
            setTimeout(() => { isSettingContentRef.current = false }, 100)
          }
        } catch (_e) {}
      }
    }
  }, [document, editor])

  const updateTitle = async (newTitle: string) => {
    setTitle(newTitle)
    try {
      await api.put(`/documents/${documentId}`, { title: newTitle })
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to update title'))
    }
  }

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/documents/${documentId}/versions`)
      if (response.data.success) {
        setVersions(response.data.data)
        setShowVersionHistory(true)
        setSelectedVersion(null)
        setPreviewVersionContent(null)
      }
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to load versions'))
    }
  }

  const restoreVersion = async (versionId: string) => {
    setLoadingVersion(true)
    try {
      const response = await api.post(`/documents/${documentId}/restore/${versionId}`)
      if (response.data.success) {
        toast.success('Version restored')
        if (response.data.data.content && editor) {
          try {
            const parsed = typeof response.data.data.content === 'string'
              ? JSON.parse(response.data.data.content)
              : response.data.data.content
            if (parsed.type) {
              isSettingContentRef.current = true
              editor.commands.setContent(parsed)
              setTimeout(() => { isSettingContentRef.current = false }, 100)
            }
          } catch (_e) {}
        }
        setShowVersionHistory(false)
        setSelectedVersion(null)
      }
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to restore version'))
    } finally {
      setLoadingVersion(false)
    }
  }

  const viewVersionPreview = (version: any) => {
    setSelectedVersion(version)
    try {
      const parsed = typeof version.content === 'string'
        ? JSON.parse(version.content)
        : version.content
      setPreviewVersionContent(parsed)
    } catch (_e) {
      setPreviewVersionContent(null)
    }
  }

  const shareDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareEmail) return
    try {
      const response = await api.post(`/documents/${documentId}/share`, {
        email: shareEmail,
        permission: sharePermission
      })
      if (response.data.success) {
        toast.success('Document shared successfully')
        setShareEmail('')
        if (response.data.data) {
          setDocument(response.data.data)
        } else {
          fetchDocument()
        }
      }
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to share'))
    }
  }

  const removeCollaborator = async (collabUserId: string) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return
    setRemovingCollabId(collabUserId)
    try {
      const response = await api.delete(`/documents/${documentId}/share/${collabUserId}`)
      if (response.data.success) {
        toast.success('Collaborator removed')
        setDocument(prev => prev ? {
          ...prev,
          collaborators: prev.collaborators.filter(c => c.userId._id !== collabUserId)
        } : prev)
      }
    } catch (error: any) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to remove collaborator'))
    } finally {
      setRemovingCollabId(null)
    }
  }

  const exportDocument = async (format: string) => {
    setShowExportMenu(false)
    toast.loading(`Exporting as ${format.toUpperCase()}...`, { id: 'export' })
    try {
      const token = localStorage.getItem('token')
      const exportUrl = `${API_URL}/api/documents/${documentId}/export/${format}`
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      let filename = `${title || 'document'}`
      if (format === 'pdf') filename += '.pdf'
      else if (format === 'docx') filename += '.docx'
      else filename += '.md'
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = filename
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`Document exported as ${format.toUpperCase()}`)
    } catch (_error) {
      toast.error('Failed to export document')
    } finally {
      toast.remove('export')
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(date)
  }

  if (loading) {
    return (
      <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
        <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
        <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />
        <div className="flex items-center justify-center flex-1">
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-8 text-center bg-white shadow-sm">
            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm text-[#7A7A78] font-sans">Loading document...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[94%] max-w-7xl mx-auto flex flex-col space-y-4 relative z-10 pt-4">
        {/* Header */}
        <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all outline-none cursor-pointer flex-shrink-0"
                title="Back to dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={(e) => canEdit && updateTitle(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-[#E9E9E8] focus:border-brand-primary focus:outline-none font-sans font-bold text-base sm:text-lg text-[#37352F] py-0.5 px-2 rounded min-w-0 flex-1 transition-all"
                placeholder="Untitled"
                readOnly={!canEdit}
              />
              {document?.accessType && (
                <span className={`px-2.5 py-1 rounded-md border text-[9px] font-mono font-semibold uppercase flex-shrink-0 ${
                  document.accessType === 'owner'
                    ? 'bg-brand-accent-bg border-brand-accent-border text-brand-primary'
                    : 'bg-[#F7F6F3] border-[#E9E9E8] text-[#7A7A78]'
                }`}>
                  {document.accessType === 'owner'
                    ? 'Owner'
                    : `Collaborator (${document.collaborators?.find(c => c.userId?._id === user?._id)?.permission || 'view'})`
                  }
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Saving indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono mr-1">
                {saving ? (
                  <>
                    <div className="w-2 h-2 border border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#7A7A78] font-semibold">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                ) : null}
              </div>

              {/* Socket status */}
              <div className={`flex items-center gap-1 text-[10px] font-mono mr-2 ${
                socketConnected ? 'text-emerald-600' : 'text-[#7A7A78]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="font-bold">{socketConnected ? 'Live' : 'Connecting...'}</span>
              </div>

              {/* Presence */}
              <div className="relative">
                <button
                  onClick={() => setShowPresencePanel(!showPresencePanel)}
                  className="flex items-center -space-x-1.5 px-2 py-1 rounded-xl hover:bg-[#F7F6F3] transition-all cursor-pointer"
                  title="Online users"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white text-white shadow-sm z-10 relative"
                    style={{ backgroundColor: '#6366f1' }}
                    title={`${user?.username} (You)`}
                  >
                    {getInitials(user?.username || 'U')}
                  </div>
                  {presenceUsers.slice(0, 3).map((u, i) => (
                    <div
                      key={u.id}
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white text-white shadow-sm relative"
                      style={{ backgroundColor: u.color, zIndex: 10 - i - 1 }}
                      title={u.username}
                    >
                      {getInitials(u.username)}
                    </div>
                  ))}
                  {presenceUsers.length > 3 && (
                    <span className="pl-1.5 text-[10px] font-mono text-[#7A7A78] font-bold">+{presenceUsers.length - 3}</span>
                  )}
                </button>

                {showPresencePanel && (
                  <div className="absolute top-full right-0 mt-2 w-64 glass-card rounded-[16px] border-[#E9E9E8] p-4 bg-white shadow-lg z-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-[#37352F]">People</h4>
                      <button onClick={() => setShowPresencePanel(false)} className="text-[#7A7A78] hover:text-[#37352F] cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F6F3]">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: '#6366f1' }}>
                          {getInitials(user?.username || 'U')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-[#37352F]">{user?.username} <span className="font-normal text-[#7A7A78]">(You)</span></span>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Active now
                          </div>
                        </div>
                      </div>
                      {presenceUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F7F6F3]">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: u.color }}>
                            {getInitials(u.username)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-[#37352F]">{u.username}</span>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              Active now
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="text-[10px] font-mono text-brand-primary italic font-semibold flex items-center gap-1 mr-1">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              {/* Version history */}
              <button
                onClick={fetchVersions}
                className="p-2 rounded-xl bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border border-[#E9E9E8] transition-all cursor-pointer"
                title="Version history"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-xl bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border border-[#E9E9E8] transition-all cursor-pointer"
                  title="Export document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 glass-card rounded-[16px] border-[#E9E9E8] p-2 bg-white shadow-lg z-50">
                    <button
                      onClick={() => exportDocument('pdf')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => exportDocument('docx')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
                    >
                      Export as DOCX
                    </button>
                    <button
                      onClick={() => exportDocument('md')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
                    >
                      Export as Markdown
                    </button>
                  </div>
                )}
              </div>

              {/* Share */}
              {document?.accessType === 'owner' && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-brand-hover shadow-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Read-only banner */}
        {!canEdit && (
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#7A7A78] font-medium">
              <Eye className="w-4 h-4 text-brand-primary" />
              <span>You have view-only access to this document</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {canEdit && editor && (
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-2 bg-white shadow-sm flex items-center gap-1 flex-wrap">
            <div className="flex items-center gap-0.5 pr-2 border-r border-[#E9E9E8]">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('bold') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('italic') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-[#E9E9E8]">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-[#E9E9E8]">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('bulletList') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('orderedList') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-[#E9E9E8]">
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('codeBlock') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  editor.isActive('blockquote') ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                }`}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded-xl text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded-xl text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="glass-card rounded-[24px] border-[#E9E9E8] p-6 bg-white shadow-sm min-h-[500px]">
          {editor ? (
            <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span className="text-sm text-[#7A7A78] font-sans">Initializing editor...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 text-left" onClick={() => setShowShareModal(false)}>
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full space-y-4 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl text-[#37352F] tracking-tight flex items-center gap-2">
                <Share2 className="w-5 h-5 text-brand-primary" />
                <span>Share Document</span>
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={shareDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Invite by email</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Permission</label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm text-[#37352F] focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="edit">Editor (Can edit)</option>
                  <option value="view">Viewer (Can only view)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-all cursor-pointer"
              >
                Share
              </button>
            </form>

            {/* Collaborators list */}
            {document?.collaborators && document.collaborators.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] uppercase font-bold block">
                  Collaborators ({document.collaborators.length})
                </span>
                <div className="space-y-2 max-h-[180px] overflow-auto">
                  {document.collaborators.map((collab) => (
                    <div key={collab.userId._id} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white bg-brand-primary flex-shrink-0">
                        {getInitials(collab.userId.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#37352F] truncate">{collab.userId.username}</div>
                        <div className="text-[10px] text-[#7A7A78] truncate">{collab.userId.email}</div>
                      </div>
                      {user?._id === document.owner._id ? (
                        <select
                          value={collab.permission}
                          onChange={(e) => {
                            const newRole = e.target.value as 'view' | 'edit'
                            setDocument(prev => prev ? {
                              ...prev,
                              collaborators: prev.collaborators.map(c =>
                                c.userId._id === collab.userId._id
                                  ? { ...c, permission: newRole }
                                  : c
                              )
                            } : prev)
                          }}
                          className="text-[10px] bg-white border border-[#E9E9E8] rounded-lg px-1.5 py-1 text-[#37352F] focus:outline-none cursor-pointer"
                        >
                          <option value="edit">Edit</option>
                          <option value="view">View</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          collab.permission === 'edit'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#F7F6F3] text-[#7A7A78]'
                        }`}>
                          {collab.permission}
                        </span>
                      )}
                      {user?._id === document.owner._id && (
                        <button
                          onClick={() => removeCollaborator(collab.userId._id)}
                          disabled={removingCollabId === collab.userId._id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                          title="Remove collaborator"
                        >
                          {removingCollabId === collab.userId._id ? (
                            <div className="w-3.5 h-3.5 border border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => { setShowVersionHistory(false); setSelectedVersion(null) }} />
          <div className="relative w-full sm:w-[420px] bg-white border-l border-[#E9E9E8] flex flex-col shadow-xl animate-fade-in">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#E9E9E8]">
              <h2 className="font-bold text-lg text-[#37352F] tracking-tight flex items-center gap-1.5">
                <History className="w-5 h-5 text-brand-primary" />
                <span>Version History</span>
              </h2>
              <button
                onClick={() => { setShowVersionHistory(false); setSelectedVersion(null) }}
                className="p-1.5 rounded-lg text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Version list */}
              <div className="w-1/2 border-r border-[#E9E9E8] p-4 overflow-y-auto">
                <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider block mb-3">VERSIONS</span>
                {versions.length === 0 ? (
                  <p className="text-xs text-[#7A7A78] font-medium italic">No versions available</p>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div
                        key={version._id}
                        onClick={() => viewVersionPreview(version)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedVersion?._id === version._id
                            ? 'bg-brand-accent-bg border-brand-primary/30'
                            : 'bg-[#F7F6F3] border-[#E9E9E8] hover:bg-[#F7F6F3]/80'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#37352F]">{formatDate(version.createdAt)}</div>
                        <div className="text-[10px] text-[#7A7A78] font-mono mt-0.5">{formatRelativeTime(version.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Version preview */}
              <div className="w-1/2 p-4 overflow-y-auto">
                <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider block mb-3">PREVIEW</span>
                {selectedVersion ? (
                  <div className="space-y-4">
                    <div className="text-[11px] text-[#7A7A78] font-mono font-semibold">
                      Saved {formatRelativeTime(selectedVersion.createdAt)}
                    </div>
                    {previewVersionContent && previewVersionContent.content ? (
                      <div className="text-xs text-[#37352F] leading-relaxed">
                        {(previewVersionContent.content as any[]).slice(0, 5).map((node: any, i: number) => (
                          <p key={i} className="mb-1">
                            {node.type === 'heading'
                              ? '🔹 ' + (node.content?.[0]?.text || '')
                              : node.content?.[0]?.text || ''}
                          </p>
                        ))}
                        {previewVersionContent.content.length > 5 && (
                          <p className="text-[10px] text-[#7A7A78] mt-2 italic">... and more content</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[#7A7A78] italic">No content preview available</div>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => restoreVersion(selectedVersion._id)}
                        disabled={loadingVersion}
                        className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loadingVersion ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          'Restore this version'
                        )}
                      </button>
                    )}
                    {!canEdit && (
                      <p className="text-[10px] text-[#7A7A78] italic font-medium">Viewers cannot restore versions</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#7A7A78] font-medium italic">Select a version to preview</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

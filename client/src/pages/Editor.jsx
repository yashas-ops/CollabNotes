import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import * as Y from 'yjs'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api, { API_URL } from '../lib/api'

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  
  const [document, setDocument] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [presenceUsers, setPresenceUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState('edit')
  const [removingCollabId, setRemovingCollabId] = useState(null)
  const [changingRoleId, setChangingRoleId] = useState(null)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [activities, setActivities] = useState([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPresencePanel, setShowPresencePanel] = useState(false)
  
  const socketRef = useRef(null)
  const ydocRef = useRef(null)
  const providerRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const syncTimeoutRef = useRef(null)
  const isInitializedRef = useRef(false)
  const pendingContentRef = useRef(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDocument()
    } else if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, id])

  useEffect(() => {
    return () => {
      console.log('[Editor] Cleanup: Unmounting Editor component');
      
      // Cleanup socket connection
      if (socketRef.current) {
        socketRef.current.emit('leave-document', { documentId: id });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      // Cleanup all timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      
      // Destroy Yjs document
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      
      console.log('[Editor] Cleanup: All resources cleaned up');
    }
  }, [id])

  useEffect(() => {
    if (document && !ydocRef.current && !isInitializedRef.current) {
      isInitializedRef.current = true
      initializeCollaboration()
    }
  }, [document])

  const initializeCollaboration = () => {
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const socket = io(API_URL, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })
    
    socketRef.current = socket
    let isSettingContent = false

    socket.on('connect', () => {
      console.log('[Socket] Connected, joining document:', id)
      socket.emit('join-document', { documentId: id })
    })

    socket.on('reconnect', () => {
      console.log('[Socket] Reconnected, rejoining document and refetching state')
      // Rejoin the document to get latest state
      socket.emit('join-document', { documentId: id });
    })

    socket.on('document-state', ({ content, title: docTitle }) => {
      console.log('[Socket] Received document state')
      if (content && editor && !isSettingContent) {
        try {
          const parsed = typeof content === 'string' ? JSON.parse(content) : content
          if (parsed && parsed.type) {
            const currentContent = editor.getJSON()
            if (JSON.stringify(currentContent) !== JSON.stringify(parsed)) {
              isSettingContent = true
              editor.commands.setContent(parsed)
              setTimeout(() => { isSettingContent = false }, 100)
              console.log('[Socket] Document content applied')
            }
          }
        } catch (e) {
          console.log('[Socket] Using empty document')
        }
      }
      if (docTitle) {
        setTitle(docTitle)
      }
    })

    socket.on('presence', ({ users }) => {
      setPresenceUsers(users.filter(u => u.id !== user?._id))
    })

    socket.on('user-joined', ({ username }) => {
      toast.success(`${username} joined the document`)
    })

    socket.on('user-left', ({ userId }) => {
      setPresenceUsers(prev => prev.filter(u => u.id !== userId))
    })

    socket.on('typing-update', ({ users }) => {
      setTypingUsers(users.filter(u => u.id !== user?._id))
    })

    socket.on('sync-update', ({ update, content }) => {
      try {
        if (update) {
          const updateArray = new Uint8Array(update)
          Y.applyUpdate(ydoc, updateArray)
          console.log('[Socket] Applied Yjs update')
        }
        if (content && editor && !isSettingContent) {
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content
            if (parsed && parsed.type) {
              const currentContent = editor.getJSON()
              if (JSON.stringify(currentContent) !== JSON.stringify(parsed)) {
                isSettingContent = true
                editor.commands.setContent(parsed)
                setTimeout(() => { isSettingContent = false }, 100)
                console.log('[Socket] Applied content sync')
              }
            }
          } catch (e) {}
        }
      } catch (e) {
        console.error('[Socket] Failed to apply update:', e)
      }
    })

    socket.on('document-saved', ({ userId, timestamp }) => {
      console.log('[Socket] Document saved by another user:', userId)
      if (userId !== user?._id) {
        setLastSaved(new Date(timestamp))
      }
    })

    socket.on('error', ({ message }) => {
      toast.error(String(message || 'Socket error'))
    })

    return () => {
      socket.emit('leave-document', { documentId: id })
      socket.disconnect()
    }
  }

  const emitTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { documentId: id })
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stop-typing', { documentId: id })
      }
    }, 1000)
  }, [id])

  const canEdit = useMemo(() => {
    if (!document || !user) return false;
    const isOwner = document.accessType === 'owner';
    const isEditor = document.collaborators?.some(
      c => c.userId?._id === user._id && c.permission === 'edit'
    );
    return isOwner || isEditor;
  }, [document, user]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false
      }),
      Placeholder.configure({
        placeholder: 'Start typing...'
      }),
      ...(ydocRef.current ? [
        Collaboration.configure({
          document: ydocRef.current
        })
      ] : [])
    ],
    onUpdate: ({ editor }) => {
      emitTyping()
      
      if (socketRef.current && ydocRef.current) {
        // Throttle sync updates - send at most every 100ms
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        syncTimeoutRef.current = setTimeout(() => {
          const update = Y.encodeStateAsUpdate(ydocRef.current)
          socketRef.current.emit('sync-update', {
            documentId: id,
            update: Array.from(update)
          })
        }, 100);
      }
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(editor.getJSON())
      }, 1000)
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none ${!canEdit ? 'read-only' : ''}`
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
            editor.commands.setContent(content)
          }
        } catch (e) {
          console.log('[Editor] Could not parse document content')
        }
      }
    }
  }, [document, editor])

  const fetchDocument = async () => {
    const token = localStorage.getItem('token')
    console.log('[Editor] fetchDocument - token:', token ? 'present' : 'missing')
    console.log('[Editor] user from auth:', user?.email, 'userId:', user?._id)
    
    if (!token) {
      console.error('[Editor] No token found in localStorage')
      toast.error('Session expired. Please login again.')
      navigate('/login')
      setLoading(false)
      return
    }
    
    try {
      console.log('[Editor] Making GET request to /api/documents/' + id)
      const response = await api.get(`/documents/${id}`)
      console.log('[Editor] Response status:', response.status)
      console.log('[Editor] Document loaded:', response.data.data?.title)
      if (response.data.success) {
        setDocument(response.data.data)
        setTitle(response.data.data.title)
      }
    } catch (error) {
      console.error('[Editor] Fetch error:', error.response?.status, error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to load document'))
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async (content) => {
    if (!canEdit) return;
    setSaving(true)
    try {
      await api.put(`/documents/${id}`, { 
        content: JSON.stringify(content),
        saveVersion: true
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('[Editor] Save error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  const updateTitle = async (newTitle) => {
    setTitle(newTitle)
    try {
      await api.put(`/documents/${id}`, { title: newTitle })
    } catch (error) {
      console.error('[Editor] Title update error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to update title'))
    }
  }

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/documents/${id}/versions`)
      if (response.data.success) {
        setVersions(response.data.data)
        setShowVersionHistory(true)
      }
    } catch (error) {
      console.error('[Editor] Versions error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to load versions'))
    }
  }

  const restoreVersion = async (versionId) => {
    try {
      const response = await api.post(`/documents/${id}/restore/${versionId}`)
      if (response.data.success) {
        toast.success('Version restored')
        if (response.data.data.content && editor) {
          try {
            const parsed = typeof response.data.data.content === 'string' 
              ? JSON.parse(response.data.data.content) 
              : response.data.data.content
            if (parsed.type) {
              editor.commands.setContent(parsed)
            }
          } catch (e) {}
        }
        setShowVersionHistory(false)
        setSelectedVersion(null)
      }
    } catch (error) {
      console.error('[Editor] Restore error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to restore version'))
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/documents/${id}/activity`)
      if (response.data.success) {
        setActivities(response.data.data)
        setShowActivityPanel(true)
      }
    } catch (error) {
      console.error('[Editor] Activity error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to load activity'))
    }
  }

  const shareDocument = async (e) => {
    e.preventDefault()
    if (!shareEmail) return
    
    try {
      const response = await api.post(`/documents/${id}/share`, {
        email: shareEmail,
        permission: sharePermission
      })
      if (response.data.success) {
        toast.success(response.data.message)
        setShareEmail('')
        if (response.data.data) {
          setDocument(response.data.data)
        } else {
          fetchDocument()
        }
      }
    } catch (error) {
      console.error('[Editor] Share error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to share'))
    }
  }

  const removeCollaborator = async (collabUserId) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return
    
    setRemovingCollabId(collabUserId)
    try {
      const response = await api.delete(`/documents/${id}/share/${collabUserId}`)
      if (response.data.success) {
        toast.success('Collaborator removed')
        setDocument(prev => ({
          ...prev,
          collaborators: prev.collaborators.filter(
            c => c.userId._id !== collabUserId
          )
        }))
      }
    } catch (error) {
      console.error('[Editor] Remove collaborator error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to remove collaborator'))
    } finally {
      setRemovingCollabId(null)
    }
  }

  const changeCollaboratorRole = async (collabUserId, newRole) => {
    setChangingRoleId(collabUserId)
    try {
      const response = await api.patch(`/documents/${id}/collaborators/${collabUserId}/role`, {
        role: newRole
      })
      if (response.data.success) {
        toast.success(`Role changed to ${newRole}`)
        setDocument(prev => ({
          ...prev,
          collaborators: prev.collaborators.map(c => 
            c.userId._id === collabUserId 
              ? { ...c, permission: newRole }
              : c
          )
        }))
      }
    } catch (error) {
      console.error('[Editor] Change role error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to change role'))
    } finally {
      setChangingRoleId(null)
    }
  }

  const exportDocument = async (format) => {
    setShowExportMenu(false)
    toast.loading(`Exporting as ${format.toUpperCase()}...`, { id: 'export' })
    
    try {
      const token = localStorage.getItem('token')
      
      const exportUrl = `${API_URL}/api/documents/${id}/export/${format}`
      console.log('[Editor] Export URL:', exportUrl)
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
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
    } catch (error) {
      console.error('[Editor] Export error:', error)
      toast.error('Failed to export document')
    } finally {
      toast.remove('export')
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(date)
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'edited': return '✏️'
      case 'shared': return '🔗'
      case 'restored': return '↩️'
      case 'joined': return '👋'
      case 'commented': return '💬'
      default: return '📝'
    }
  }

  const getActionText = (activity) => {
    switch (activity.action) {
      case 'edited': return 'edited the document'
      case 'shared': return activity.details || 'shared the document'
      case 'restored': return 'restored to a previous version'
      case 'joined': return 'joined the document'
      case 'commented': return 'added a comment'
      default: return activity.details || 'made changes'
    }
  }

  const allUsersInDocument = useMemo(() => {
    const users = []
    if (document?.owner) {
      users.push({
        id: document.owner._id,
        username: document.owner.username,
        color: '#6366f1',
        role: 'Owner'
      })
    }
    document?.collaborators?.forEach(c => {
      if (c.userId?._id) {
        users.push({
          id: c.userId._id,
          username: c.userId.username,
          color: '#8b5cf6',
          role: c.permission === 'edit' ? 'Editor' : 'Viewer'
        })
      }
    })
    return users
  }, [document])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="editor-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => canEdit && updateTitle(e.target.value)}
            placeholder="Untitled"
            readOnly={!canEdit}
          />
          {document?.accessType && (
            <span className={`editor-access-badge ${document.accessType}`}>
              {document.accessType === 'owner' 
                ? 'Owner' 
                : `Collaborator (${document.collaborators?.find(c => c.userId?._id === user?._id)?.permission || 'view'})`
              }
            </span>
          )}
        </div>
        <div className="editor-header-right">
          <div className="saving-indicator">
            {saving ? (
              <>
                <div className="spinner"></div>
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <span className="save-status saved">Saved</span>
            ) : null}
          </div>
          
          <div className="presence-wrapper">
            <button 
              className="btn btn-ghost btn-icon presence-btn" 
              onClick={() => setShowPresencePanel(!showPresencePanel)}
              title="Online users"
            >
              <div className="presence-avatars-header">
                {presenceUsers.slice(0, 2).map((u, i) => (
                  <div key={i} className="presence-avatar-small" style={{ backgroundColor: u.color }}>
                    {getInitials(u.username)}
                  </div>
                ))}
                {presenceUsers.length > 0 && (
                  <span className="presence-count">{presenceUsers.length + 1} online</span>
                )}
              </div>
            </button>
            
            {showPresencePanel && (
              <div className="presence-panel">
                <div className="presence-panel-header">
                  <h4>People</h4>
                </div>
                <div className="presence-list">
                  <div className="presence-user current">
                    <div className="presence-avatar-small" style={{ backgroundColor: '#6366f1' }}>
                      {getInitials(user?.username)}
                    </div>
                    <div className="presence-user-info">
                      <span className="presence-username">{user?.username} (You)</span>
                      <span className="presence-status online">Active now</span>
                    </div>
                  </div>
                  {presenceUsers.map((u, i) => (
                    <div key={i} className="presence-user">
                      <div className="presence-avatar-small" style={{ backgroundColor: u.color }}>
                        {getInitials(u.username)}
                      </div>
                      <div className="presence-user-info">
                        <span className="presence-username">{u.username}</span>
                        <span className="presence-status online">Active now</span>
                      </div>
                    </div>
                  ))}
                  {allUsersInDocument.filter(u => !presenceUsers.find(pu => pu.id === u.id) && u.id !== user?._id).map((u, i) => (
                    <div key={`offline-${i}`} className="presence-user offline">
                      <div className="presence-avatar-small" style={{ backgroundColor: u.color }}>
                        {getInitials(u.username)}
                      </div>
                      <div className="presence-user-info">
                        <span className="presence-username">{u.username}</span>
                        <span className="presence-status">{u.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span>{typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <button className="btn btn-ghost btn-icon" onClick={fetchVersions} title="Version history">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          
          <button className="btn btn-ghost btn-icon" onClick={fetchActivities} title="Activity log">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </button>
          
          <div className="export-wrapper">
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export document"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            
            {showExportMenu && (
              <div className="export-menu">
                <button className="export-option" onClick={() => exportDocument('pdf')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Export as PDF
                </button>
                <button className="export-option" onClick={() => exportDocument('docx')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Export as DOCX
                </button>
                <button className="export-option" onClick={() => exportDocument('md')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Export as Markdown
                </button>
              </div>
            )}
          </div>
          
          {document?.accessType === 'owner' && (
            <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          )}
        </div>
      </header>
      
      {canEdit && (
      <div className="toolbar">
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${editor?.isActive('bold') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button 
            className={`toolbar-btn ${editor?.isActive('italic') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            H1
          </button>
          <button 
            className={`toolbar-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </button>
          <button 
            className={`toolbar-btn ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1" fill="currentColor"/>
              <circle cx="3" cy="12" r="1" fill="currentColor"/>
              <circle cx="3" cy="18" r="1" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className={`toolbar-btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="10" y1="6" x2="21" y2="6"/>
              <line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/>
              <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
              <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
              <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
            </svg>
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${editor?.isActive('codeBlock') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </button>
          <button 
            className={`toolbar-btn ${editor?.isActive('blockquote') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/>
            </svg>
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className="toolbar-btn"
            onClick={() => editor?.chain().focus().undo().run()}
            title="Undo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => editor?.chain().focus().redo().run()}
            title="Redo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>
      )}
      
      {!canEdit && (
        <div className="read-only-banner">
          You have view-only access to this document
        </div>
      )}
      
      <div className="editor-wrapper">
        <div className="editor-content">
          <div className="editor-paper">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      
      {showShareModal && (
        <div className="share-modal" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Share Document</h2>
              <button className="share-modal-close" onClick={() => setShowShareModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form className="share-form" onSubmit={shareDocument}>
              <input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
              <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)}>
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
              <button type="submit" className="btn btn-primary">Share</button>
            </form>
            
            {document?.collaborators?.length > 0 && (
              <div className="collaborators-list">
                <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Collaborators
                </h4>
                {document.collaborators.map((collab, i) => (
                  <div key={i} className="collaborator-item">
                    <div className="collaborator-avatar-large">
                      {getInitials(collab.userId?.username)}
                    </div>
                    <div className="collaborator-info">
                      <div className="collaborator-name">{collab.userId?.username}</div>
                      <div className="collaborator-email">{collab.userId?.email}</div>
                    </div>
                    {user?._id === document.owner._id ? (
                      <select
                        className="role-select"
                        value={collab.permission}
                        onChange={(e) => changeCollaboratorRole(collab.userId._id, e.target.value)}
                        disabled={changingRoleId === collab.userId._id}
                      >
                        <option value="view">Viewer</option>
                        <option value="edit">Editor</option>
                      </select>
                    ) : (
                      <span className="collaborator-permission">{collab.permission}</span>
                    )}
                    {user?._id === document.owner._id && (
                      <button
                        className="btn btn-ghost btn-icon remove-collab-btn"
                        onClick={() => removeCollaborator(collab.userId._id)}
                        disabled={removingCollabId === collab.userId._id}
                        title="Remove collaborator"
                      >
                        {removingCollabId === collab.userId._id ? (
                          <div className="spinner" style={{ width: 16, height: 16 }}></div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {showVersionHistory && (
        <>
          <div className="modal-overlay" onClick={() => { setShowVersionHistory(false); setSelectedVersion(null); }} />
          <div className="version-history open">
            <div className="version-history-header">
              <h3>Version History</h3>
              <button className="share-modal-close" onClick={() => { setShowVersionHistory(false); setSelectedVersion(null); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="version-content">
              <div className="version-list">
                <h4>Versions</h4>
                {versions.length === 0 ? (
                  <p className="empty-message">No versions available</p>
                ) : (
                  versions.map((version) => (
                    <div 
                      key={version._id} 
                      className={`version-item ${selectedVersion?._id === version._id ? 'selected' : ''}`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="version-date">{formatDate(version.createdAt)}</div>
                      <div className="version-time">{formatRelativeTime(version.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
              {selectedVersion && (
                <div className="version-preview">
                  <h4>Preview</h4>
                  <div className="version-preview-content">
                    <p className="version-preview-meta">
                      Saved {formatRelativeTime(selectedVersion.createdAt)}
                    </p>
                    {canEdit && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => restoreVersion(selectedVersion._id)}
                      >
                        Restore this version
                      </button>
                    )}
                    {!canEdit && (
                      <p className="view-only-notice">Viewers cannot restore versions</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {showActivityPanel && (
        <>
          <div className="modal-overlay" onClick={() => setShowActivityPanel(false)} />
          <div className="activity-panel open">
            <div className="activity-panel-header">
              <h3>Activity</h3>
              <button className="share-modal-close" onClick={() => setShowActivityPanel(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="activity-list">
              {activities.length === 0 ? (
                <p className="empty-message">No activity yet</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-icon">{getActionIcon(activity.action)}</div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.username}</strong> {getActionText(activity)}
                      </div>
                      <div className="activity-time">{formatRelativeTime(activity.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

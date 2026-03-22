import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../lib/api'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading: authLoading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      fetchDocuments()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token')
    console.log('[Dashboard] fetchDocuments - token:', token ? 'present' : 'missing')
    
    if (!token) {
      console.log('[Dashboard] No token found, cannot fetch documents')
      setLoading(false)
      return
    }
    
    try {
      const response = await api.get('/documents')
      console.log('[Dashboard] Documents fetched:', response.data.data?.length)
      if (response.data.success) {
        setDocuments(response.data.data)
      }
    } catch (error) {
      console.error('[Dashboard] Fetch error:', error.response?.status, error.response?.data)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        logout()
        navigate('/login')
      } else {
        toast.error(String(error.response?.data?.error || error.message || 'Failed to fetch documents'))
      }
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async () => {
    try {
      const response = await api.post('/documents', { title: 'Untitled' })
      if (response.data.success) {
        toast.success('Document created')
        navigate(`/document/${response.data.data._id}`)
      }
    } catch (error) {
      console.error('[Dashboard] Create error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to create document'))
    }
  }

  const deleteDocument = async (e, documentId) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      const response = await api.delete(`/documents/${documentId}`)
      if (response.data.success) {
        toast.success('Document deleted')
        setDocuments(prev => prev.filter(d => d._id !== documentId))
      }
    } catch (error) {
      console.error('[Dashboard] Delete error:', error.response?.data)
      toast.error(String(error.response?.data?.error || error.message || 'Failed to delete document'))
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const formatCreatedDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCollaboratorInfo = (collaborators) => {
    if (!collaborators || collaborators.length === 0) return 'No collaborators';
    if (collaborators.length <= 3) {
      return collaborators.map(c => c.userId?.email || 'Unknown').join(', ');
    }
    const firstThree = collaborators.slice(0, 3).map(c => c.userId?.email || 'Unknown').join(', ');
    return `${firstThree} +${collaborators.length - 3} more`;
  }

  const getUserRole = (doc, user) => {
    if (doc.accessType === 'owner') return 'Owner';
    const collab = doc.collaborators?.find(c => c.userId?._id === user?._id);
    return collab?.permission === 'edit' ? 'Editor' : 'Viewer';
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="dashboard-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="sidebarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#sidebarGrad)"/>
              <path d="M25 30 L45 50 L25 70 M55 70 L75 50 L55 30" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>CollabNotes</span>
          </div>
        </div>
        
        <div className="sidebar-search">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Recent</div>
          </div>
        </div>
        
        <div className="document-list">
          {documents.slice(0, 5).map(doc => (
            <Link
              key={doc._id}
              to={`/document/${doc._id}`}
              className="document-item"
            >
              <svg className="document-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <div className="document-info">
                <div className="document-title">{doc.title}</div>
                <div className="document-date">{formatDate(doc.updatedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{getInitials(user?.username || 'U')}</div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="sidebar-actions">
            <button onClick={toggleTheme} className="btn btn-ghost btn-icon theme-toggle-btn" title="Toggle theme">
              {theme === 'dark' ? (
                <Sun size={20} className="theme-icon" />
              ) : (
                <Moon size={20} className="theme-icon" />
              )}
            </button>
            <button onClick={logout} className="btn btn-ghost btn-icon" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button className="btn btn-ghost btn-icon menu-toggle" onClick={() => setSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="header-right">
            <button onClick={toggleTheme} className="btn btn-ghost btn-icon theme-toggle-btn">
              {theme === 'dark' ? (
                <Sun size={20} className="theme-icon" />
              ) : (
                <Moon size={20} className="theme-icon" />
              )}
            </button>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="welcome-header">
            <h1>Welcome back, {user?.username}</h1>
            <p>Here are your documents</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <button onClick={createDocument} className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Document
            </button>
          </div>
          
          {loading ? (
            <div className="loading-screen">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <h3>No documents yet</h3>
              <p>Create your first document to get started</p>
              <button onClick={createDocument} className="btn btn-primary">
                Create Document
              </button>
            </div>
          ) : (
            <div className="documents-grid">
              {filteredDocuments.map(doc => (
                <div key={doc._id} className="document-card group" onClick={() => navigate(`/document/${doc._id}`)}>
                  <div className="document-card-header">
                    <div className="document-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    {doc.accessType === 'owner' && (
                      <button 
                        className="btn btn-ghost btn-icon document-card-menu" 
                        onClick={(e) => deleteDocument(e, doc._id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <h3 className="document-card-title">{doc.title}</h3>
                  {doc.accessType && (
                    <span className={`access-type-badge ${doc.accessType}`}>
                      {doc.accessType === 'owner' ? 'Owner' : 'Collaborator'}
                    </span>
                  )}
                  <p className="document-card-preview">
                    {doc.content ? 'Click to view and edit content...' : 'Empty document - click to start editing'}
                  </p>
                  <div className="document-card-footer">
                    <span className="document-card-date">Updated {formatDate(doc.updatedAt)}</span>
                    {doc.collaborators?.length > 0 && (
                      <div className="document-card-collaborators">
                        <div className="collaborator-avatars">
                          {doc.collaborators.slice(0, 3).map((collab, i) => (
                            <div key={i} className="collaborator-avatar">
                              {getInitials(collab.userId?.username || 'U')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="document-card-overlay">
                    <div className="overlay-content">
                      <div className="overlay-item">
                        <span className="overlay-label">Role:</span>
                        <span className="overlay-value">{getUserRole(doc, user)}</span>
                      </div>
                      <div className="overlay-item">
                        <span className="overlay-label">Created on:</span>
                        <span className="overlay-value">{formatCreatedDate(doc.createdAt)}</span>
                      </div>
                      <div className="overlay-item">
                        <span className="overlay-label">Shared with:</span>
                        <span className="overlay-value">{getCollaboratorInfo(doc.collaborators)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

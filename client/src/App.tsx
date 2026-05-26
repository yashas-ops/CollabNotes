import { useState, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import InteractiveBg from './components/InteractiveBg'
import LandingPage from './components/Pages/LandingPage'
import AboutPage from './components/Pages/AboutPage'
import WorkflowPage from './components/Pages/WorkflowPage'
import AuthPage from './components/Pages/AuthPage'
import DashboardPage from './components/Pages/DashboardPage'
import CollaborativeEditor from './components/Pages/CollaborativeEditor'
import SettingsPage from './components/Pages/SettingsPage'
import { ActivePage, ThemeType, UserSession } from './types'

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [activePage, setActivePage] = useState<ActivePage>('landing')
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('theme') as ThemeType) || 'minimalist-gray'
  })
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const prevUserRef = useRef(user)
  const isFirstRender = useRef(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (!isFirstRender.current) {
      localStorage.setItem('theme', theme)
    }
    isFirstRender.current = false
  }, [theme])

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (activePage === 'landing' || activePage === 'auth') {
          setActivePage('dashboard')
        }
      } else if (prevUserRef.current) {
        setActivePage('auth')
      }
    }
    prevUserRef.current = user
  }, [user, loading])

  const handlePageChange = (page: ActivePage) => {
    if (page === 'dashboard' && !user) {
      setActivePage('auth')
      return
    }
    if (page === 'editor' && !user) {
      setActivePage('auth')
      return
    }
    setActivePage(page)
  }

  const handleSelectNote = (docId: string) => {
    setSelectedDocumentId(docId)
    setActivePage('editor')
  }

  const handleBackToDashboard = () => {
    setSelectedDocumentId(null)
    setActivePage('dashboard')
  }

  const handleAuthSuccess = () => {
    setActivePage('dashboard')
  }

  const sessionUser: UserSession | null = user
    ? { userId: user._id, userName: user.username, userColor: '#6366f1', email: user.email }
    : null

  const handleUpdateUser = (updated: UserSession) => {}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--backdrop-bg)', color: 'var(--text-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-sans">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen antialiased transition-all duration-750 ease-in-out" style={{ backgroundColor: 'var(--backdrop-bg)', color: 'var(--text-primary)' }}>
      <InteractiveBg theme={theme} />

      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        user={user}
        logout={logout}
        theme={theme}
      />

      <div className="relative z-10">
        {activePage === 'landing' && (
          <LandingPage onStartFree={() => handlePageChange('auth')} onExploreWorkflow={() => handlePageChange('workflow')} onExploreAbout={() => handlePageChange('about')} />
        )}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'workflow' && <WorkflowPage />}
        {activePage === 'auth' && (
          <AuthPage onSuccess={handleAuthSuccess} />
        )}
        {activePage === 'dashboard' && user && (
          <DashboardPage onSelectNote={handleSelectNote} user={user} />
        )}
        {activePage === 'editor' && selectedDocumentId && (
          <CollaborativeEditor
            documentId={selectedDocumentId}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {activePage === 'settings' && (
          <SettingsPage
            theme={theme}
            setTheme={setTheme}
            user={sessionUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </div>

      <footer className="relative z-10 text-center py-8 text-xs font-mono opacity-50">
        <span style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} CollabNotes &mdash; Hyper-Sync Collaborative Editor
        </span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            background: '#fff',
            color: '#37352F',
            border: '1px solid #E9E9E8',
            borderRadius: '12px',
            padding: '12px 16px'
          }
        }}
      />
      <AppContent />
    </AuthProvider>
  )
}

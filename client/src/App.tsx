import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './components/Pages/LandingPage'
import AboutPage from './components/Pages/AboutPage'
import WorkflowPage from './components/Pages/WorkflowPage'
import AuthPage from './components/Pages/AuthPage'
import DashboardPage from './components/Pages/DashboardPage'
import CollaborativeEditor from './components/Pages/CollaborativeEditor'
import SettingsPage from './components/Pages/SettingsPage'
import { ActivePage, ThemeType } from './types'

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [activePage, setActivePage] = useState<ActivePage>('landing')
  const [theme, setTheme] = useState<ThemeType>('cosmic-slate')
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      if (activePage === 'landing' || activePage === 'auth') {
        setActivePage('dashboard')
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#7A7A78] font-sans">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#37352F] antialiased">
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        user={user}
        logout={logout}
        theme={theme}
      />

      {activePage === 'landing' && (
        <LandingPage onGetStarted={() => handlePageChange('auth')} />
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
        <SettingsPage theme={theme} setTheme={setTheme} />
      )}
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

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return { success: true }
      }
      
      return { success: false, error: String(response.data.error || 'Login failed') }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: String(msg) }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return { success: true }
      }
      
      return { success: false, error: String(response.data.error || 'Registration failed') }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed'
      return { success: false, error: String(msg) }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        setSent(true)
        toast.success('Check your email for reset instructions')
      }
    } catch (error) {
      toast.error(String(error.response?.data?.error || error.message || 'Failed to send reset email'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#logoGrad)"/>
              <path d="M25 30 L45 50 L25 70 M55 70 L75 50 L55 30" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1>CollabNotes</h1>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" style={{ marginBottom: '16px' }}>
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            <h2 style={{ marginBottom: '12px' }}>Check your email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              If an account exists with <strong>{email}</strong>, you will receive password reset instructions.
            </p>
          </div>
          
          <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#logoGrad)"/>
            <path d="M25 30 L45 50 L25 70 M55 70 L75 50 L55 30" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>CollabNotes</h1>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Forgot Password?</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your email and we'll send you reset instructions
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

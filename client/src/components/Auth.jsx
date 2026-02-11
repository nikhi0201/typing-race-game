import React, { useState } from 'react'
import { socket } from '../socket'

export default function Auth({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login') // login | signup
  const [emailMode, setEmailMode] = useState(true) // true = email, false = phone
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone) => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    return re.test(phone.replace(/\s/g, ''))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const credential = emailMode ? formData.email : formData.phone
      const credentialType = emailMode ? 'email' : 'phone'

      if (!credential || !formData.password) {
        setError(`Please enter your ${emailMode ? 'email' : 'phone number'} and password`)
        setLoading(false)
        return
      }

      if (emailMode && !validateEmail(credential)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!emailMode && !validatePhone(credential)) {
        setError('Please enter a valid phone number')
        setLoading(false)
        return
      }

      let responded = false
      
      socket.emit('login', {
        [credentialType]: credential,
        password: formData.password,
      }, (response) => {
        responded = true
        setLoading(false)
        if (response && response.success) {
          onAuthSuccess(response.user)
        } else {
          setError(response?.message || 'Login failed - check your email/phone and password')
        }
      })

      // Set timeout for server response
      const timeoutId = setTimeout(() => {
        if (!responded) {
          responded = true
          setLoading(false)
          setError('Server not responding - backend may not be running on port 4000')
        }
      }, 8000)

      // Cleanup timeout if response comes before timeout
      return () => clearTimeout(timeoutId)
    } catch (err) {
      console.error('Login error:', err)
      setError('Login error. Please try again.')
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const credential = emailMode ? formData.email : formData.phone

      if (!credential || !formData.password || !formData.displayName) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (emailMode && !validateEmail(credential)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!emailMode && !validatePhone(credential)) {
        setError('Please enter a valid phone number')
        setLoading(false)
        return
      }

      let responded = false

      socket.emit('signup', {
        [emailMode ? 'email' : 'phone']: credential,
        password: formData.password,
        displayName: formData.displayName,
      }, (response) => {
        responded = true
        setLoading(false)
        if (response && response.success) {
          onAuthSuccess(response.user)
        } else {
          setError(response?.message || 'Signup failed - email or phone may be registered')
        }
      })

      // Set timeout for server response
      const timeoutId = setTimeout(() => {
        if (!responded) {
          responded = true
          setLoading(false)
          setError('Server not responding - backend may not be running on port 4000')
        }
      }, 8000)

      // Cleanup timeout if response comes before timeout
      return () => clearTimeout(timeoutId)
    } catch (err) {
      setError('Signup error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Background Effects */}
      <div className="background-effects">
        <div className="floating-item keyboard keyboard-1">⌨️</div>
        <div className="floating-item keyboard keyboard-2">⌨️</div>
        <div className="floating-item tech tech-1">💻</div>
        <div className="floating-item tech tech-2">⚡</div>
        <div className="floating-item tech tech-3">🔧</div>
        <div className="floating-item tech tech-4">📱</div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>⚡ Typing Speed Race</h1>
          <p className="auth-tagline">{authMode === 'login' ? 'Welcome Back!' : 'Join the Race!'}</p>
        </div>

        <div className="auth-tabs">
          <button
            onClick={() => setAuthMode('login')}
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
          >
            Create Account
          </button>
        </div>

        <div className="credential-toggle">
          <button
            onClick={() => setEmailMode(true)}
            className={`toggle-btn ${emailMode ? 'active' : ''}`}
          >
            📧 Email
          </button>
          <button
            onClick={() => setEmailMode(false)}
            className={`toggle-btn ${!emailMode ? 'active' : ''}`}
          >
            📱 Phone
          </button>
        </div>

        <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="auth-form">
          {authMode === 'signup' && (
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="displayName"
                placeholder="Enter your name"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}

          {emailMode ? (
            <div className="form-group">
              <label>📧 Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>📱 Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>🔐 Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              className="form-input"
            />
          </div>

          {authMode === 'signup' && (
            <div className="form-group">
              <label>🔐 Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? '⏳ Processing...' : authMode === 'login' ? '🚀 Sign In' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="small-text">
            {authMode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setError('')
                setFormData({
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  displayName: '',
                })
              }}
              className="link-button"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

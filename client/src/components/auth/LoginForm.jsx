import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { formatCognitoError } from '../../auth/cognitoPassword'

const MODES = {
  signIn: 'signIn',
  signUp: 'signUp',
  confirm: 'confirm',
}

export default function LoginForm() {
  const navigate = useNavigate()
  const { signInWithPassword, signUp, confirmSignUp, resendConfirmationCode } = useAuth()
  const [mode, setMode] = useState(MODES.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  function resetFeedback() {
    setError(null)
    setMessage(null)
  }

  function switchMode(nextMode) {
    resetFeedback()
    setMode(nextMode)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    resetFeedback()
    setSubmitting(true)

    try {
      await signInWithPassword(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      if (raw.includes('UserNotConfirmedException')) {
        setMode(MODES.confirm)
        setError(formatCognitoError(raw))
      } else {
        setError(formatCognitoError(raw))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    resetFeedback()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await signUp(email, password)
      setMode(MODES.confirm)
      setMessage('We sent a confirmation code to your email.')
    } catch (err) {
      setError(formatCognitoError(err instanceof Error ? err.message : String(err)))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    resetFeedback()
    setSubmitting(true)

    try {
      await confirmSignUp(email, code)
      await signInWithPassword(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatCognitoError(err instanceof Error ? err.message : String(err)))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendCode() {
    resetFeedback()
    setSubmitting(true)

    try {
      await resendConfirmationCode(email)
      setMessage('A new confirmation code was sent.')
    } catch (err) {
      setError(formatCognitoError(err instanceof Error ? err.message : String(err)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-card">
      <header className="login-card-header">
        <h1 className="auth-title">
          {mode === MODES.signUp
            ? 'Create account'
            : mode === MODES.confirm
              ? 'Confirm email'
              : 'Sign in'}
        </h1>
        <p className="auth-muted login-card-subtitle">
          {mode === MODES.signUp
            ? 'Join with your email and a secure password.'
            : mode === MODES.confirm
              ? 'Enter the code from your inbox to finish setup.'
              : 'Welcome back. Enter your credentials to continue.'}
        </p>
      </header>

      {mode === MODES.signIn ? (
        <form className="login-form" onSubmit={handleSignIn}>
          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="profile-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" className="counter auth-btn login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="login-switch">
            New here?{' '}
            <button type="button" className="auth-link-btn" onClick={() => switchMode(MODES.signUp)}>
              Create an account
            </button>
          </p>
        </form>
      ) : null}

      {mode === MODES.signUp ? (
        <form className="login-form" onSubmit={handleSignUp}>
          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="profile-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label className="profile-field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" className="counter auth-btn login-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="login-switch">
            Already have an account?{' '}
            <button type="button" className="auth-link-btn" onClick={() => switchMode(MODES.signIn)}>
              Sign in
            </button>
          </p>
        </form>
      ) : null}

      {mode === MODES.confirm ? (
        <form className="login-form" onSubmit={handleConfirm}>
          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="profile-field">
            <span>Confirmation code</span>
            <input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </label>
          {message ? <p className="login-message">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" className="counter auth-btn login-submit" disabled={submitting}>
            {submitting ? 'Confirming…' : 'Confirm and sign in'}
          </button>
          <p className="login-switch">
            <button
              type="button"
              className="auth-link-btn"
              disabled={submitting || !email}
              onClick={handleResendCode}
            >
              Resend code
            </button>
            {' · '}
            <button type="button" className="auth-link-btn" onClick={() => switchMode(MODES.signIn)}>
              Back to sign in
            </button>
          </p>
        </form>
      ) : null}

      <p className="auth-footer">
        <Link to="/">Back to home</Link>
      </p>
    </div>
  )
}

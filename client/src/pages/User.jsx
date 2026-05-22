import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function User() {
  const { user, loading, configured, signOut } = useAuth()

  if (!configured) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <main className="auth-shell">
        <p className="auth-muted">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const email = user.profile?.email ?? user.profile?.sub ?? 'Signed in'

  return (
    <main className="auth-shell">
      <h1 className="auth-title">Account</h1>
      <p className="auth-email">{email}</p>
      <div className="auth-actions">
        <button type="button" className="counter auth-btn" onClick={() => signOut?.()}>
          Sign out
        </button>
      </div>
      <p className="auth-footer">
        <Link to="/">Home</Link>
      </p>
    </main>
  )
}

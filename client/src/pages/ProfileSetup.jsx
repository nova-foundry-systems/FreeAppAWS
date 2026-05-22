import { Link, Navigate, useNavigate } from 'react-router-dom'
import ProfileSetupForm from '../components/profile/ProfileSetupForm'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { profile, profileLoading, notFound, error, authLoading, configured, user } =
    useProfile()

  if (!configured) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || profileLoading) {
    return (
      <main className="auth-shell">
        <p className="auth-muted">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile && !notFound) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main className="auth-shell">
      <h1 className="auth-title">Set up your profile</h1>
      <p className="auth-muted">Enter your name to continue.</p>
      {error && !profile ? <p className="auth-error">{error}</p> : null}
      <ProfileSetupForm
        user={user}
        onComplete={() => navigate('/profile', { replace: true })}
      />
      <p className="auth-footer">
        <button type="button" className="auth-link-btn" onClick={() => signOut?.()}>
          Sign out
        </button>
        {' · '}
        <Link to="/">Home</Link>
      </p>
    </main>
  )
}

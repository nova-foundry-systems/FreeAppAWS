import { Link, Navigate } from 'react-router-dom'
import ProfileDetails from '../components/profile/ProfileDetails'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function Profile() {
  const { signOut } = useAuth()
  const { profile, profileLoading, notFound, error, authLoading, configured, user } =
    useProfile()

  if (!configured) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || profileLoading) {
    return (
      <main className="auth-shell">
        <p className="auth-muted">Loading profile…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (notFound) {
    return <Navigate to="/profile/setup" replace />
  }

  if (error) {
    return (
      <main className="auth-shell">
        <h1 className="auth-title">Profile</h1>
        <p className="auth-error">{error}</p>
        <p className="auth-footer">
          <Link to="/">Home</Link>
        </p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="auth-shell">
        <p className="auth-muted">Loading profile…</p>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <ProfileDetails
        firstName={profile.firstName}
        lastName={profile.lastName}
        onSignOut={() => signOut?.()}
      />
    </main>
  )
}

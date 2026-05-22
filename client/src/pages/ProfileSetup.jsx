import { Link, useNavigate } from 'react-router-dom'
import ProfileSetupForm from '../components/profile/ProfileSetupForm'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { signOut, user, profileError, refreshProfile } = useAuth()

  async function handleComplete() {
    await refreshProfile()
    navigate('/', { replace: true })
  }

  async function handleSignOut() {
    navigate('/', { replace: true })
    await signOut?.()
  }

  return (
    <main className="auth-shell">
      <h1 className="auth-title">Set up your profile</h1>
      <p className="auth-muted">Enter your name to continue.</p>
      {profileError ? <p className="auth-error">{profileError}</p> : null}
      <ProfileSetupForm user={user} onComplete={handleComplete} />
      <p className="auth-footer">
        <button type="button" className="auth-link-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </p>
    </main>
  )
}

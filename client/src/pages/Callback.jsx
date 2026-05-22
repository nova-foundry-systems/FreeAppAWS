import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { completeSignInRedirect, isCognitoConfigured } from '../auth/cognito'
import '../App.css'

export default function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const configured = isCognitoConfigured()

  useEffect(() => {
    if (!configured) {
      return
    }

    completeSignInRedirect()
      .then(() => navigate('/profile', { replace: true }))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [configured, navigate])

  if (!configured) {
    return (
      <main className="auth-shell">
        <h1 className="auth-title">Sign-in problem</h1>
        <p className="auth-error">
          Cognito is not configured. Set <code>VITE_COGNITO_*</code> (including{' '}
          <code>VITE_COGNITO_DOMAIN</code>) in <code>client/.env</code>.
        </p>
        <p className="auth-footer">
          <Link to="/login">Back</Link>
        </p>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      {error ? (
        <>
          <h1 className="auth-title">Sign-in problem</h1>
          <p className="auth-error">{error}</p>
          <p className="auth-footer">
            <Link to="/login">Try again</Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="auth-title">Signing you in</h1>
          <p className="auth-muted">Completing login…</p>
        </>
      )}
    </main>
  )
}

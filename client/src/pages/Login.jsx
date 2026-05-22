import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function Login() {
  const { user, loading, configured, signIn } = useAuth()

  if (loading) {
    return (
      <main className="auth-shell">
        <p className="auth-muted">Loading…</p>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main className="auth-shell">
      <h1 className="auth-title">Sign in</h1>
        {!configured ? (
        <p className="auth-error">
          Set <code>VITE_COGNITO_REGION</code>, <code>VITE_COGNITO_USER_POOL_ID</code>
          , <code>VITE_COGNITO_CLIENT_ID</code>, and{' '}
          <code>VITE_COGNITO_DOMAIN</code> (pool domain host, e.g.{' '}
          <code>fa-…auth.us-west-2.amazoncognito.com</code> from stack output{' '}
          <code>UserPoolDomainHost</code> or Hosted UI URL) in <code>client/.env</code>
          , then restart the dev server.
        </p>
      ) : (
        <>
          <p className="auth-muted">
            You will be redirected to Amazon Cognito to sign in or create an account.
          </p>
          <button type="button" className="counter auth-btn" onClick={() => signIn?.()}>
            Continue with Cognito
          </button>
        </>
      )}
      <p className="auth-footer">
        <Link to="/">Back to home</Link>
      </p>
    </main>
  )
}

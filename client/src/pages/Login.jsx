import { Link, Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

export default function Login() {
  const { user, configured } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="auth-shell">
      {!configured ? (
        <>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-error">
            Set <code>VITE_COGNITO_REGION</code>, <code>VITE_COGNITO_USER_POOL_ID</code>
            , <code>VITE_COGNITO_CLIENT_ID</code>, and{' '}
            <code>VITE_COGNITO_DOMAIN</code> (pool domain host, e.g.{' '}
            <code>fa-…auth.us-west-2.amazoncognito.com</code> from stack output{' '}
            <code>UserPoolDomainHost</code> or Hosted UI URL) in <code>client/.env</code>
            , then restart the dev server.
          </p>
          <p className="auth-footer">
            <Link to="/">Back to home</Link>
          </p>
        </>
      ) : (
        <LoginForm />
      )}
    </main>
  )
}

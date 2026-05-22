import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../App.css'

function Landing() {
  const { user, appLoading } = useAuth()

  return (
    <>
      <header className="site-header">
        <nav className="site-nav">
          {!appLoading && user ? (
            <Link to="/profile" className="site-nav-link">
              Profile
            </Link>
          ) : !appLoading ? (
            <Link to="/login" className="site-nav-link">
              Sign in
            </Link>
          ) : null}
        </nav>
      </header>

      <main className="landing">
        <h1>FreeAppAWS</h1>
        <p className="landing-lead">
          A reference full-stack app on AWS: React SPA, Cognito authentication, and
          an Express API on Lambda with DynamoDB, all defined and deployed with CDK.
        </p>

        <section className="landing-about">
          <h2>What this repo demonstrates</h2>
          <ul>
            <li>
              <strong>Client</strong> — Vite + React on S3 and CloudFront with hosted
              UI OAuth and email/password sign-in
            </li>
            <li>
              <strong>API</strong> — JWT-protected user profiles via API Gateway and
              Lambda
            </li>
            <li>
              <strong>Infrastructure</strong> — CDK stacks for the client, Cognito
              user pool, database, and API
            </li>
          </ul>
          <p>
            Sign in to create or view your profile. Local development uses{' '}
            <code>client/.env</code> with values from CDK stack outputs; see the
            repository README for setup steps.
          </p>
        </section>
      </main>
    </>
  )
}

export default Landing

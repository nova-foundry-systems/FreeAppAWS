import { Link } from 'react-router-dom'

export default function ProfileDetails({ firstName, lastName, onSignOut }) {
  return (
    <>
      <h1 className="auth-title">Profile</h1>
      <p className="auth-email">
        {firstName} {lastName}
      </p>
      <div className="auth-actions">
        <button type="button" className="counter auth-btn" onClick={onSignOut}>
          Sign out
        </button>
      </div>
      <p className="auth-footer">
        <Link to="/">Home</Link>
      </p>
    </>
  )
}

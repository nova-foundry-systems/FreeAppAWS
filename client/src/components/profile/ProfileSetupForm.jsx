import { useState } from 'react'
import { ApiError, apiFetch } from '../../api/client'

export default function ProfileSetupForm({ user, onComplete }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await apiFetch('/users/me', {
        user,
        method: 'POST',
        body: { firstName, lastName },
      })
      await onComplete?.()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err)
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="profile-setup-form" onSubmit={handleSubmit}>
      <label className="profile-field">
        <span>First name</span>
        <input
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          autoComplete="given-name"
        />
      </label>
      <label className="profile-field">
        <span>Last name</span>
        <input
          type="text"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          autoComplete="family-name"
        />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="submit" className="auth-btn" disabled={submitting}>
        {submitting ? 'Saving…' : 'Complete setup'}
      </button>
    </form>
  )
}

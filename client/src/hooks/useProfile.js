import { useEffect, useState } from 'react'
import { ApiError, apiFetch, isApiConfigured } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function useProfile() {
  const { user, loading: authLoading, configured } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading || !user) {
      return undefined
    }

    if (!isApiConfigured()) {
      setError('API is not configured. Set VITE_API_BASE_URL in client/.env')
      setProfileLoading(false)
      return undefined
    }

    let cancelled = false
    setProfileLoading(true)
    setNotFound(false)
    setError(null)

    apiFetch('/users/me', { user })
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setNotFound(false)
        }
      })
      .catch((err) => {
        if (cancelled) {
          return
        }
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null)
          setNotFound(true)
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  return {
    profile,
    profileLoading,
    notFound,
    error,
    authLoading,
    configured,
    user,
  }
}

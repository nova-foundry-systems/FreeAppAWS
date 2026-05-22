import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApiError, apiFetch, isApiConfigured } from '../api/client'
import {
  confirmSignUpWithCode,
  resendSignUpCode,
  signInWithPassword,
  signUpWithPassword,
} from './cognitoPassword'
import { getUserManager, isCognitoConfigured, signOutRedirect } from './cognito'
import { persistSessionAsOidcUser } from './persistOidcUser'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const configured = isCognitoConfigured()
  const userManager = useMemo(() => (configured ? getUserManager() : null), [configured])
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(Boolean(configured))
  const [profile, setProfile] = useState(null)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const loadProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setProfile(null)
      setProfileNotFound(false)
      setProfileError(null)
      setProfileLoading(false)
      return
    }

    if (!isApiConfigured()) {
      setProfile(null)
      setProfileNotFound(false)
      setProfileError('API is not configured. Set VITE_API_BASE_URL in client/.env')
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)
    setProfileError(null)

    try {
      const data = await apiFetch('/users/me', { user: sessionUser })
      setProfile(data)
      setProfileNotFound(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null)
        setProfileNotFound(true)
        return
      }
      setProfile(null)
      setProfileNotFound(false)
      setProfileError(err instanceof Error ? err.message : String(err))
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (user) {
      return loadProfile(user)
    }
    return Promise.resolve()
  }, [user, loadProfile])

  useEffect(() => {
    if (!userManager) {
      return undefined
    }

    let cancelled = false

    userManager.getUser().then((u) => {
      if (!cancelled) {
        setUser(u)
        setSessionLoading(false)
      }
    })

    const onLoaded = (u) => setUser(u)
    const onUnloaded = () => setUser(null)
    userManager.events.addUserLoaded(onLoaded)
    userManager.events.addUserUnloaded(onUnloaded)

    return () => {
      cancelled = true
      userManager.events.removeUserLoaded(onLoaded)
      userManager.events.removeUserUnloaded(onUnloaded)
    }
  }, [userManager])

  useEffect(() => {
    if (sessionLoading) {
      return undefined
    }

    if (!user) {
      setProfile(null)
      setProfileNotFound(false)
      setProfileError(null)
      setProfileLoading(false)
      return undefined
    }

    let cancelled = false
    loadProfile(user).then(() => {
      if (cancelled) {
        return
      }
    })

    return () => {
      cancelled = true
    }
  }, [sessionLoading, user, loadProfile])

  const appLoading = sessionLoading || Boolean(user && profileLoading)

  const signInWithPasswordHandler = useCallback(
    async (email, password) => {
      const { session } = await signInWithPassword(email, password)
      const oidcUser = await persistSessionAsOidcUser(session)
      // storeUser does not raise UserLoaded (unlike signinRedirectCallback)
      setUser(oidcUser)
    },
    [],
  )

  const signUpHandler = useCallback(async (email, password) => {
    await signUpWithPassword(email, password)
  }, [])

  const confirmSignUpHandler = useCallback(async (email, code) => {
    await confirmSignUpWithCode(email, code)
  }, [])

  const resendConfirmationCodeHandler = useCallback(async (email) => {
    await resendSignUpCode(email)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading: sessionLoading,
      sessionLoading,
      appLoading,
      profile,
      profileNotFound,
      profileLoading,
      profileError,
      refreshProfile,
      configured,
      userManager,
      signIn: () => userManager?.signinRedirect(),
      signInWithPassword: signInWithPasswordHandler,
      signUp: signUpHandler,
      confirmSignUp: confirmSignUpHandler,
      resendConfirmationCode: resendConfirmationCodeHandler,
      signOut: () => signOutRedirect(),
    }),
    [
      user,
      sessionLoading,
      appLoading,
      profile,
      profileNotFound,
      profileLoading,
      profileError,
      refreshProfile,
      configured,
      userManager,
      signInWithPasswordHandler,
      signUpHandler,
      confirmSignUpHandler,
      resendConfirmationCodeHandler,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth is the public auth API
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

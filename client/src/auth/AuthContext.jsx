import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getUserManager, isCognitoConfigured } from './cognito'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const configured = isCognitoConfigured()
  const userManager = useMemo(() => (configured ? getUserManager() : null), [configured])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(configured))

  useEffect(() => {
    if (!userManager) {
      return undefined
    }

    let cancelled = false

    userManager.getUser().then((u) => {
      if (!cancelled) {
        setUser(u)
        setLoading(false)
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

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      userManager,
      signIn: () => userManager?.signinRedirect(),
      signOut: () => userManager?.signoutRedirect(),
    }),
    [user, loading, configured, userManager],
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

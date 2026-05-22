import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

/**
 * @param {string | undefined} raw
 * @returns {string | null}
 */
function normalizeCognitoDomainHost(raw) {
  if (!raw || typeof raw !== 'string') return null
  let s = raw.trim()
  if (!s) return null
  s = s.replace(/^https?:\/\//i, '')
  s = s.split('/')[0]
  return s || null
}

/**
 * Cognito only serves OAuth at the user-pool **domain** (`*.auth.{region}.amazoncognito.com`).
 * Hitting `cognito-idp.../authorize` returns:
 * `{"code":"BadRequest","message":"The server did not understand the operation that was requested."}`.
 *
 * @returns {Record<string, string> | undefined}
 */
function getOauthMetadataSeed() {
  const host = normalizeCognitoDomainHost(import.meta.env.VITE_COGNITO_DOMAIN)
  if (!host) return undefined
  return {
    authorization_endpoint: `https://${host}/oauth2/authorize`,
    token_endpoint: `https://${host}/oauth2/token`,
    end_session_endpoint: `https://${host}/logout`,
  }
}

/** @returns {Record<string, unknown> | null} */
export function getOidcSettings() {
  const region = import.meta.env.VITE_COGNITO_REGION
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  const metadataSeed = getOauthMetadataSeed()
  if (!region || !userPoolId || !clientId || !metadataSeed) return null
  const origin = window.location.origin
  return {
    authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    client_id: clientId,
    redirect_uri: `${origin}/callback`,
    post_logout_redirect_uri: origin,
    response_type: 'code',
    scope: 'openid email profile',
    metadataSeed,
  }
}

export function isCognitoConfigured() {
  return getOidcSettings() !== null
}

let userManager

export function getUserManager() {
  if (userManager) return userManager
  const settings = getOidcSettings()
  if (!settings) return null
  userManager = new UserManager({
    ...settings,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  })
  return userManager
}

let signinRedirectCallbackPromise

/**
 * Consumes the OAuth redirect once (safe under React StrictMode double effects).
 * @returns {Promise<import('oidc-client-ts').User | void>}
 */
export function completeSignInRedirect() {
  const um = getUserManager()
  if (!um) return Promise.reject(new Error('Cognito is not configured.'))
  if (!signinRedirectCallbackPromise) {
    signinRedirectCallbackPromise = um.signinRedirectCallback().finally(() => {
      signinRedirectCallbackPromise = null
    })
  }
  return signinRedirectCallbackPromise
}

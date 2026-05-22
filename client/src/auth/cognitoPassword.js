import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js'

/** @returns {CognitoUserPool | null} */
function getUserPool() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  if (!userPoolId || !clientId) return null
  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  })
}

/** @returns {CognitoUser} */
function createCognitoUser(email) {
  const pool = getUserPool()
  if (!pool) {
    throw new Error('Cognito is not configured.')
  }
  return new CognitoUser({ Username: email.trim(), Pool: pool })
}

/**
 * @param {string} message
 * @returns {string}
 */
export function formatCognitoError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  if (message.includes('UserNotConfirmedException')) {
    return 'Confirm your email with the code we sent you, then sign in.'
  }
  if (message.includes('NotAuthorizedException')) {
    return 'Incorrect email or password.'
  }
  if (message.includes('UsernameExistsException')) {
    return 'An account with this email already exists. Sign in instead.'
  }
  if (message.includes('InvalidPasswordException')) {
    return 'Password does not meet requirements (min 8 characters, upper, lower, number, symbol).'
  }
  if (message.includes('CodeMismatchException')) {
    return 'That confirmation code is incorrect.'
  }
  if (message.includes('ExpiredCodeException')) {
    return 'That confirmation code expired. Request a new one.'
  }
  return message
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ session: import('amazon-cognito-identity-js').CognitoUserSession }>}
 */
export function signInWithPassword(email, password) {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email)
    const authDetails = new AuthenticationDetails({
      Username: email.trim(),
      Password: password,
    })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ session }),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error('A new password is required. Use forgot password or contact support.'))
      },
    })
  })
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('amazon-cognito-identity-js').ISignUpResult>}
 */
export function signUpWithPassword(email, password) {
  return new Promise((resolve, reject) => {
    const pool = getUserPool()
    if (!pool) {
      reject(new Error('Cognito is not configured.'))
      return
    }

    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email.trim() }),
    ]

    pool.signUp(email.trim(), password, attributes, null, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

/**
 * @param {string} email
 * @param {string} code
 * @returns {Promise<void>}
 */
export function confirmSignUpWithCode(email, code) {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email)
    user.confirmRegistration(code.trim(), true, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * @param {string} email
 * @returns {Promise<void>}
 */
export function resendSignUpCode(email) {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email)
    user.resendConfirmationCode((err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

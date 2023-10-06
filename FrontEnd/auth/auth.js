import { deleteWork } from '../api/fetch.js'

/**
 * @param {string} bearerToken - authentification token stored in the user cookie
 * @returns {Promise<boolean>} if the user is authenticated or not
 */
export async function isAuthenticated(bearerToken) {
  return await deleteWork(-1, bearerToken) // /!\ safe check while id -1 doesn't exist in database
}

/**
 * This function removes the token from the user cookie and refresh the web page.
 */
export function logout() {
  document.cookie = 'token=; max-age=0'
  location.reload()
}

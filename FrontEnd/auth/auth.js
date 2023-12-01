/**
 * This function removes the token from the user cookie and refresh the web page.
 */
export function logout() {
  document.cookie = 'token=; max-age=0'
  location.reload()
}

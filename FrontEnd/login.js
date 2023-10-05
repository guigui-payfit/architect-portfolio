import { LoginError } from './errors/login-error.js'
import { postLoginInformation } from './api/fetch.js'
import { findHtmlElementById } from './utils/dom-read-utils.js'

// Add event listener on the login form
const loginFormHtmlElement = findHtmlElementById('login-form')
loginFormHtmlElement.addEventListener('submit', async (event) => {
  event.preventDefault()
  /**
   * @type {HTMLInputElement}
   */
  const emailInput = findHtmlElementById('email')
  const email = emailInput.value
  /**
   * @type {HTMLInputElement}
   */
  const passwordInput = findHtmlElementById('password')
  const password = passwordInput.value
  try {
    const { token } = await postLoginInformation(email, password)
    document.cookie = `token=${token}; max-age=${60 * 60 * 24 * 7}`
    document.location.assign('index.html')
  } catch (error) {
    if (error instanceof LoginError) {
      displayErrorMessage('Erreur dans l’identifiant ou le mot de passe')
    } else {
      displayErrorMessage('Une erreur est survenue.')
    }
  }
})

/**
 * @param {string} errorMessage - error message to display to the user
 */
function displayErrorMessage(errorMessage) {
  const existingTextErrorHtmlElement = document.querySelector('.error')
  if (existingTextErrorHtmlElement !== null) {
    existingTextErrorHtmlElement.remove()
  }

  const textErrorHtmlElement = document.createElement('p')
  textErrorHtmlElement.innerText = errorMessage
  textErrorHtmlElement.classList.add('error')
  loginFormHtmlElement.insertBefore(
    textErrorHtmlElement,
    loginFormHtmlElement.lastElementChild
  )
}

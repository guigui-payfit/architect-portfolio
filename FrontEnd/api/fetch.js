import { LoginError } from '../errors/login-error.js'
import { Work } from '../models/work.js'

export const API_BASE_URL = 'http://localhost:5678/api'

/**
 * @param {number} workId - id of the work to be removed from database
 * @param {string} bearerToken - bearer token found in the user cookie
 * @returns {Promise<boolean>} if the delete operation has been successful or not
 */
export async function deleteWork(workId, bearerToken) {
  const httpResponse = await fetch(`${API_BASE_URL}/works/${workId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    method: 'DELETE',
  })
  return httpResponse.ok
}

/**
 * @returns {Promise<Category[]>} categories from the API
 */
export async function getAllCategories() {
  const httpResponse = await fetch(`${API_BASE_URL}/categories`)
  const categories = await httpResponse.json()
  return categories
}

/**
 * @returns {Promise<Work[]>} works from the API
 */
export async function getAllWorks() {
  const httpResponse = await fetch(`${API_BASE_URL}/works`)
  const works = await httpResponse.json()
  return works
}

/**
 * @param {string} email - user email
 * @param {string} password - user password
 * @returns {Promise<{token: string, userId: number}>} id of the user in database and a token
 */
export async function postLoginInformation(email, password) {
  const httpResponse = await fetch(`${API_BASE_URL}/users/login`, {
    body: JSON.stringify({
      email,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (httpResponse.status === 401 || httpResponse.status === 404) {
    throw new LoginError('Wrong login information')
  }
  if (!httpResponse.ok) {
    throw new Error('An error occured.')
  }
  return await httpResponse.json()
}

/**
 * @param {File} file - uploaded image by the user
 * @param {string} title - title of the project (work)
 * @param {string} category - work category
 * @param {string} bearerToken - bearer token found in the user cookie
 * @returns {Promise<Work>} the new work created
 */
export async function postWork(file, title, category, bearerToken) {
  const formData = new FormData()
  formData.append('category', category)
  formData.append('image', file)
  formData.append('title', title)

  const httpResponse = await fetch(`${API_BASE_URL}/works`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    method: 'POST',
  })
  return await httpResponse.json()
}

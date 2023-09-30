import { Work } from './models/work.js'

const API_BASE_URL = 'http://localhost:5678/api'

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

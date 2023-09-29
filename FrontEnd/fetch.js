import { Work } from './models/work.js'

const API_BASE_URL = 'http://localhost:5678/api'

/**
 * @returns {Promise<Work[]>}
 */
export async function getAllWorks() {
  const httpResponse = await fetch(`${API_BASE_URL}/works`)
  const works = await httpResponse.json()
  return works
}

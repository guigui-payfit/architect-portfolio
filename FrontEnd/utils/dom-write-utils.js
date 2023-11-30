import { Work } from '../models/work.js'
import { state } from '../state.js'
import { findAllHtmlElementsByCssClass } from './dom-read-utils.js'

/**
 * This function disables website administrator-only features.
 * Only administrators can be authenticated.
 */
export function disableAdminFeatures() {
  const loggedInOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-in-only')
  loggedInOnlyHtmlElements.forEach((htmlElement) => hide(htmlElement))
  const loggedOutOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-out-only')
  loggedOutOnlyHtmlElements.forEach((htmlElement) => show(htmlElement))
}

/**
 * @param {Work} work - new work to be displayed
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display the new work
 */
export function displayNewWork(work, parentHtmlElement) {
  parentHtmlElement.innerHTML += `<figure data-work-id=${work.id}>
					<img src=${work.imageUrl} alt=${work.title}>
					<figcaption>${work.title}</figcaption>
				</figure>`
}

/**
 * @param {number | undefined} categoryId - category id in database
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display works
 */
export function displayWorksByCategoryId(categoryId, parentHtmlElement) {
  parentHtmlElement.innerHTML = ''
  const worksToDisplay =
    categoryId === undefined
      ? state.works
      : state.works.filter((work) => work.categoryId === categoryId)
  for (const work of worksToDisplay) {
    displayNewWork(work, parentHtmlElement)
  }
}

/**
 * This function enables website administrator-only features.
 * Only administrators can be authenticated.
 */
export function enableAdminFeatures() {
  const loggedInOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-in-only')
  loggedInOnlyHtmlElements.forEach((htmlElement) => show(htmlElement))
  const loggedOutOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-out-only')
  loggedOutOnlyHtmlElements.forEach((htmlElement) => hide(htmlElement))
}

/**
 * @param {HTMLElement} htmlElement - HTML element to be hidden from users (screen readers included)
 */
export function hide(htmlElement) {
  htmlElement.classList.add('hidden')
  htmlElement.setAttribute('aria-hidden', 'true')
}

/**
 * @param {HTMLElement} filterHtmlElement - the only filter HTML element to be set as active
 * @param {HTMLElement[]} allFilterHtmlElements - all filter HTML elements
 */
export function setFilterAsActive(filterHtmlElement, allFilterHtmlElements) {
  const previousActiveFilterHtmlElement = allFilterHtmlElements.find(
    (filterHtmlElement) => filterHtmlElement.classList.contains('active')
  )
  if (previousActiveFilterHtmlElement !== undefined) {
    previousActiveFilterHtmlElement.classList.toggle('active')
  }

  filterHtmlElement.classList.toggle('active')
}

/**
 * @param {HTMLElement} htmlElement - HTML element to be shown to users
 */
export function show(htmlElement) {
  htmlElement.classList.remove('hidden')
  htmlElement.setAttribute('aria-hidden', 'false')
}

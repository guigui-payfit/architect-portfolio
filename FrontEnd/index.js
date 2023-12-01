import { logout } from './auth/auth.js'
import { getAllWorks } from './api/fetch.js'
import { Work } from './models/work.js'
import {
  initializeProjectManagementDialog,
  openProjectManagementDialog,
} from './project-management-dialog.js'
import { getCookieValue } from './utils/cookie.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './utils/dom-read-utils.js'
import {
  displayWorksByCategoryId,
  enableAdminFeatures,
  setFilterAsActive,
} from './utils/dom-write-utils.js'
import { state } from './state.js'

// Get all works from the API
await getAllWorks()

// Check if the user is logged in and if so, activate all admin features
const bearerToken = getCookieValue('token')
if (bearerToken !== undefined) {
  enableAdminFeatures()

  const logoutHtmlElement = findHtmlElementById('logout')
  logoutHtmlElement.addEventListener('click', logout)

  const projectManagementDialogLink = findHtmlElementById(
    'project-management-dialog-link'
  )
  projectManagementDialogLink.addEventListener(
    'click',
    openProjectManagementDialog
  )
} else {
  // Deduce from fetched works all not empty categories when the user is not authenticated
  const allCategoryIds = [
    ...new Set(state.works.map((work) => work.categoryId)),
  ]
  /**
   * @type {Category[]}
   */
  const allCategories = allCategoryIds.map((categoryId) => {
    /**
     * @type {Work}
     */
    const work = state.works.find((work) => work.categoryId === categoryId)
    const workCategoryName = work.category.name
    return {
      id: categoryId,
      name: workCategoryName,
    }
  })

  // Add category filters on the DOM
  const categoryFilterContainerHtmlElement =
    findHtmlElementById('category-filters')
  allCategories.forEach((category) => {
    const categoryHtmlElement = document.createElement('li')
    categoryHtmlElement.innerHTML = `<button class="category-filter" data-category-id="${category.id}">${category.name}</button>`
    categoryFilterContainerHtmlElement.appendChild(categoryHtmlElement)
  })
}

// Add event listeners on category filters
const galleryHtmlElement = findHtmlElementById('gallery')
const allFilterHtmlElements = findAllHtmlElementsByCssClass('category-filter')
allFilterHtmlElements.forEach((filterHtmlElement) =>
  filterHtmlElement.addEventListener('click', () => {
    const categoryId =
      filterHtmlElement.dataset.categoryId !== undefined
        ? parseInt(filterHtmlElement.dataset.categoryId)
        : undefined
    displayWorksByCategoryId(categoryId, galleryHtmlElement)
    setFilterAsActive(filterHtmlElement, allFilterHtmlElements)
  })
)

// Add event listeners on some HTML elements of the project management dialog
initializeProjectManagementDialog()

// Click on the "All" category filter
const allFilterHtmlElement = findHtmlElementById('default-category-filter')
allFilterHtmlElement.click()

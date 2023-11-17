import { deleteWork, getAllCategories, getAllWorks } from '../api/fetch.js'
import { Category } from '../models/category.js'
import { Work } from '../models/work.js'
import { getCookieValue } from './cookie.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './dom-read-utils.js'

/**
 * This function disables website administrator-only features.
 * Only administrators can be authenticated.
 */
export function disableAdminFeatures() {
  const loggedInOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-in-only')
  loggedInOnlyHtmlElements.forEach((htmlElement) =>
    htmlElement.classList.add('hidden')
  )
  const loggedOutOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-out-only')
  loggedOutOnlyHtmlElements.forEach((htmlElement) =>
    htmlElement.classList.remove('hidden')
  )
}

/**
 * @param {Work[]} allWorks - all works fetched from the API
 * @param {number | undefined} categoryId - category id in database
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display works
 */
export function displayWorksByCategoryId(
  allWorks,
  categoryId,
  parentHtmlElement
) {
  parentHtmlElement.innerHTML = ''
  const worksToDisplay =
    categoryId === undefined
      ? allWorks
      : allWorks.filter((work) => work.categoryId === categoryId)
  for (let work of worksToDisplay) {
    parentHtmlElement.innerHTML += `<figure data-id=${work.id}>
					<img src=${work.imageUrl} alt=${work.title}>
					<figcaption>${work.title}</figcaption>
				</figure>`
  }
}

/**
 * This function enables website administrator-only features.
 * Only administrators can be authenticated.
 */
export function enableAdminFeatures() {
  const loggedInOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-in-only')
  loggedInOnlyHtmlElements.forEach((htmlElement) =>
    htmlElement.classList.remove('hidden')
  )
  const loggedOutOnlyHtmlElements =
    findAllHtmlElementsByCssClass('logged-out-only')
  loggedOutOnlyHtmlElements.forEach((htmlElement) =>
    htmlElement.classList.add('hidden')
  )
}

/**
 * This method opens the project management dialog.
 */
export async function openProjectManagementDialog() {
  const projectManagementDialogHtmlElement = findHtmlElementById(
    'project-management-dialog'
  )
  projectManagementDialogHtmlElement.classList.remove('hidden')
  projectManagementDialogHtmlElement.removeAttribute('aria-hidden')
  projectManagementDialogHtmlElement.setAttribute('aria-modal', 'true')

  projectManagementDialogHtmlElement.addEventListener(
    'click',
    closeProjectManagementDialog
  )
  const projectManagementDialogWrapperHtmlElement = findHtmlElementById(
    'project-management-dialog-wrapper'
  )
  projectManagementDialogWrapperHtmlElement.addEventListener(
    'click',
    (event) => {
      event.stopPropagation()
    }
  )
  const projectManagementDialogClosingCrossContainerHtmlElement =
    findAllHtmlElementsByCssClass(
      'dialog-closing-cross',
      projectManagementDialogWrapperHtmlElement
    )[0]
  projectManagementDialogClosingCrossContainerHtmlElement.addEventListener(
    'click',
    closeProjectManagementDialog
  )

  const projectManagementDialogBackArrowContainerHtmlElement =
    findAllHtmlElementsByCssClass(
      'dialog-back-arrow',
      projectManagementDialogWrapperHtmlElement
    )[0]
  projectManagementDialogBackArrowContainerHtmlElement.addEventListener(
    'click',
    () => displayProjectManagementDialogStepContent(1)
  )

  await displayProjectManagementDialogStepContent(1)
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
 * This method closes the project management dialog.
 */
function closeProjectManagementDialog() {
  const projectManagementDialog = findHtmlElementById(
    'project-management-dialog'
  )
  projectManagementDialog.classList.add('hidden')
  projectManagementDialog.setAttribute('aria-hidden', 'true')
  projectManagementDialog.removeAttribute('aria-modal')
}

/**
 * This function displays categories in the "select" component of the project management dialog.
 */
async function displayCategoriesInProjectManagementDialog() {
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  /**
   * @type {Category[]}
   */
  const categories = await getAllCategories()
  for (let category of categories) {
    categorySelectHtmlElement.innerHTML += `<option value=${category.id}">${category.name}</option>`
  }
}

/**
 * @param {1 | 2} step - step for which the content have to be displayed
 * (step 1 : remove photo from gallery ; step 2 : add photo in gallery)
 */
async function displayProjectManagementDialogStepContent(step) {
  const stepToDisplayContainerHtmlElement = findHtmlElementById(
    `project-management-dialog-step-${step}`
  )
  stepToDisplayContainerHtmlElement.classList.remove('hidden')

  const stepNotToDisplay = step === 1 ? 2 : 1
  const stepNotToDisplayContainerHtmlElement = findHtmlElementById(
    `project-management-dialog-step-${stepNotToDisplay}`
  )
  stepNotToDisplayContainerHtmlElement.classList.add('hidden')

  const projectManagementDialogHtmlElement = findHtmlElementById(
    'project-management-dialog'
  )
  projectManagementDialogHtmlElement.setAttribute(
    'aria-labelledby',
    `project-management-dialog-step-${step}`
  )

  const projectManagementDialogBackArrowContainerHtmlElement =
    findAllHtmlElementsByCssClass(
      'dialog-back-arrow-container',
      projectManagementDialogHtmlElement
    )[0]

  if (step === 1) {
    projectManagementDialogBackArrowContainerHtmlElement.classList.add('hidden')

    const allWorks = await getAllWorks()
    const projectManagementDialogGalleryHtmlElement = findHtmlElementById(
      'project-management-dialog-gallery'
    )
    displayWorksInsideProjectManagementDialog(
      allWorks,
      projectManagementDialogGalleryHtmlElement
    )

    const fromStep1ToStep2HtmlButtonElement = findHtmlElementById(
      'from-step-1-to-step-2-button'
    )
    fromStep1ToStep2HtmlButtonElement.addEventListener('click', () =>
      displayProjectManagementDialogStepContent(2)
    )
  } else {
    projectManagementDialogBackArrowContainerHtmlElement.classList.remove(
      'hidden'
    )

    displayCategoriesInProjectManagementDialog()
  }
}

/**
 * @param {Work[]} allWorks - all works fetched from the API
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display works
 */
function displayWorksInsideProjectManagementDialog(
  allWorks,
  parentHtmlElement
) {
  parentHtmlElement.innerHTML = ''
  for (let work of allWorks) {
    const imageWrapperHtmlElement = document.createElement('div')
    imageWrapperHtmlElement.classList.add('image-wrapper')
    imageWrapperHtmlElement.dataset.id = work.id.toString()
    imageWrapperHtmlElement.innerHTML = `<img src=${work.imageUrl} alt=${work.title}>
      <div class="trash-icon-container">
        <i aria-hidden="true" class="fa-solid fa-trash-can" title="Supprimer le projet"></i>
        <span class="sr-only">Supprimer le projet</span>
      </div>`
    parentHtmlElement.appendChild(imageWrapperHtmlElement)

    const trashIconContainerHtmlElement = findAllHtmlElementsByCssClass(
      'trash-icon-container',
      imageWrapperHtmlElement
    )[0]
    trashIconContainerHtmlElement.addEventListener('click', async () => {
      await removeWorkById(work.id)
    })
  }
}

/**
 * @param {number} workId - work id in database
 */
async function removeWorkById(workId) {
  const bearerToken = getCookieValue('token')
  const isWorkDeleted = await deleteWork(workId, bearerToken)
  if (isWorkDeleted) {
    const workHtmlElements = document.querySelectorAll(`[data-id="${workId}"]`)
    workHtmlElements.forEach((workHtmlElement) => workHtmlElement.remove())
  }
}

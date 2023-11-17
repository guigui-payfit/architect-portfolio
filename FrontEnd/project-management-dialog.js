import { deleteWork, getAllCategories, getAllWorks } from './api/fetch.js'
import { Category } from './models/category.js'
import { Work } from './models/work.js'
import { getCookieValue } from './utils/cookie.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './utils/dom-read-utils.js'

/**
 * This methods adds event listeners on some HTML elements of the project management dialog
 */
export function initializeProjectManagementDialog() {
  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  dialogHtmlElement.addEventListener('click', closeProjectManagementDialog)

  const dialogWrapperHtmlElement = findHtmlElementById(
    'project-management-dialog-wrapper'
  )
  dialogWrapperHtmlElement.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  const dialogClosingCrossContainerHtmlElement = findAllHtmlElementsByCssClass(
    'dialog-closing-cross',
    dialogWrapperHtmlElement
  )[0]
  dialogClosingCrossContainerHtmlElement.addEventListener(
    'click',
    closeProjectManagementDialog
  )

  const dialogBackArrowContainerHtmlElement = findAllHtmlElementsByCssClass(
    'dialog-back-arrow',
    dialogWrapperHtmlElement
  )[0]
  dialogBackArrowContainerHtmlElement.addEventListener('click', () =>
    displayDialogStepContent(1)
  )

  const fromStep1ToStep2HtmlButtonElement = findHtmlElementById(
    'from-step-1-to-step-2-button'
  )
  fromStep1ToStep2HtmlButtonElement.addEventListener('click', () =>
    displayDialogStepContent(2)
  )

  const dialogFormHtmlElement = findHtmlElementById(
    'project-management-dialog-form'
  )
  dialogFormHtmlElement.addEventListener('input', handleDialogFormSubmission)
}

/**
 * This method opens the project management dialog.
 */
export async function openProjectManagementDialog() {
  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  dialogHtmlElement.classList.remove('hidden')
  dialogHtmlElement.removeAttribute('aria-hidden')
  dialogHtmlElement.setAttribute('aria-modal', 'true')

  await displayDialogStepContent(1)
}

/**
 * This method closes the project management dialog.
 */
function closeProjectManagementDialog() {
  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  dialogHtmlElement.classList.add('hidden')
  dialogHtmlElement.setAttribute('aria-hidden', 'true')
  dialogHtmlElement.removeAttribute('aria-modal')

  resetDialogForm()
}

/**
 * This function displays categories in the "select" component of the project management dialog.
 */
async function displayCategoriesInDialog() {
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  categorySelectHtmlElement.innerHTML = ''
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
async function displayDialogStepContent(step) {
  const stepToDisplayContainerHtmlElement = findHtmlElementById(
    `project-management-dialog-step-${step}`
  )
  stepToDisplayContainerHtmlElement.classList.remove('hidden')

  const stepNotToDisplay = step === 1 ? 2 : 1
  const stepNotToDisplayContainerHtmlElement = findHtmlElementById(
    `project-management-dialog-step-${stepNotToDisplay}`
  )
  stepNotToDisplayContainerHtmlElement.classList.add('hidden')

  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  dialogHtmlElement.setAttribute(
    'aria-labelledby',
    `project-management-dialog-step-${step}`
  )

  const dialogBackArrowContainerHtmlElement = findAllHtmlElementsByCssClass(
    'dialog-back-arrow-container',
    dialogHtmlElement
  )[0]

  if (step === 1) {
    dialogBackArrowContainerHtmlElement.classList.add('hidden')

    const allWorks = await getAllWorks()
    const dialogGalleryHtmlElement = findHtmlElementById(
      'project-management-dialog-gallery'
    )
    displayWorksInsideDialog(allWorks, dialogGalleryHtmlElement)
  } else {
    dialogBackArrowContainerHtmlElement.classList.remove('hidden')

    displayCategoriesInDialog()
  }
}

/**
 * @param {Work[]} allWorks - all works fetched from the API
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display works
 */
function displayWorksInsideDialog(allWorks, parentHtmlElement) {
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
 * This function enables the form submission in the project management dialog when all required fields have been filled with valid data.
 * On the contrary, it displays an error message when the uploaded file is invalid.
 */
function handleDialogFormSubmission() {
  /**
   * @type {HTMLInputElement}
   */
  const fileInputHtmlElement = findHtmlElementById('file-input')
  const uploadedFile = fileInputHtmlElement.files[0]
  if (uploadedFile === undefined) {
    return
  }

  /**
   * @type {HTMLInputElement}
   */
  const projectTitleInputHtmlElement = findHtmlElementById('project-title')

  /**
   * @type {HTMLSelectElement}
   */
  const categorySelectHtmlElement = findHtmlElementById('project-category')

  /**
   * @type {HTMLButtonElement}
   */
  const formSubmissionButtonHtmlElement = findHtmlElementById(
    'project-management-dialog-form-submission-button'
  )

  const isUploadedFileValid = uploadedFileValid(uploadedFile)

  if (
    isUploadedFileValid &&
    projectTitleInputHtmlElement.value &&
    categorySelectHtmlElement.value
  ) {
    formSubmissionButtonHtmlElement.disabled = false
  } else {
    formSubmissionButtonHtmlElement.disabled = true
  }

  const fileUploadErrorMessageHtmlElement = findHtmlElementById(
    'file-upload-error-message'
  )

  if (isUploadedFileValid || uploadedFile === undefined) {
    fileUploadErrorMessageHtmlElement.classList.add('hidden')
    fileUploadErrorMessageHtmlElement.ariaHidden = true
  } else {
    fileUploadErrorMessageHtmlElement.classList.remove('hidden')
    fileUploadErrorMessageHtmlElement.ariaHidden = false
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

/**
 * This function resets all inputs of the project management dialog form with default values.
 */
function resetDialogForm() {
  /**
   * @type {HTMLInputElement}
   */
  const fileInputHtmlElement = findHtmlElementById('file-input')
  fileInputHtmlElement.value = ''

  /**
   * @type {HTMLInputElement}
   */
  const projectTitleInputHtmlElement = findHtmlElementById('project-title')
  projectTitleInputHtmlElement.value = ''

  /**
   * @type {HTMLSelectElement}
   */
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  categorySelectHtmlElement.value = '1'

  /**
   * @type {HTMLButtonElement}
   */
  const formSubmissionButtonHtmlElement = findHtmlElementById(
    'project-management-dialog-form-submission-button'
  )
  formSubmissionButtonHtmlElement.disabled = true

  const fileUploadErrorMessageHtmlElement = findHtmlElementById(
    'file-upload-error-message'
  )
  fileUploadErrorMessageHtmlElement.classList.add('hidden')
  fileUploadErrorMessageHtmlElement.ariaHidden = true
}

/**
 * @param {File} uploadedFile - file uploaded by the user from its device  in the project management dialog form
 * @returns {boolean} true if the uploaded file is an image with a right format and a size less than 4Mo, else false
 */
function uploadedFileValid(uploadedFile) {
  const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png']
  const MEGA_OCTET_EXPRESSED_IN_OCTETS = 1024 * 1024
  return (
    ACCEPTED_MIME_TYPES.includes(uploadedFile.type) &&
    uploadedFile.size <= 4 * MEGA_OCTET_EXPRESSED_IN_OCTETS
  )
}

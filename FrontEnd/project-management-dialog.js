import { deleteWork, getAllCategories, postWork } from './api/fetch.js'
import { state } from './state.js'
import { getCookieValue } from './utils/cookie.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './utils/dom-read-utils.js'
import { displayNewWork, hide, show } from './utils/dom-write-utils.js'

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
  dialogFormHtmlElement.addEventListener(
    'input',
    handleDialogFormSubmissionState
  )

  const fileInputHtmlElement = findHtmlElementById('file-input')
  const uploadedImageHtmlElement = findHtmlElementById('uploaded-image')
  const fileInputContainerHtmlElement = findHtmlElementById(
    'file-input-container'
  )
  fileInputHtmlElement.addEventListener('change', () =>
    displayUploadedImage(
      fileInputHtmlElement,
      uploadedImageHtmlElement,
      fileInputContainerHtmlElement
    )
  )

  const formSubmissionButtonHtmlElement = findHtmlElementById(
    'project-management-dialog-form-submission-button'
  )
  formSubmissionButtonHtmlElement.addEventListener('click', (event) => {
    submitForm(event)
  })
}

/**
 * This method opens the project management dialog.
 */
export async function openProjectManagementDialog() {
  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  show(dialogHtmlElement)
  dialogHtmlElement.ariaModal = true

  await displayDialogStepContent(1)
}

/**
 * @param {File | undefined} uploadedFile - uploaded file by the user
 * @param {string} projectTitle - new project title filled by the user
 * @param {string} category - new project category selected by the user
 * @returns {boolean} true if all form inputs have valid values, else false
 */
function canFormBeSubmitted(uploadedFile, projectTitle, category) {
  if (uploadedFile === undefined) {
    return false
  }
  const isUploadedFileValid = uploadedFileValid(uploadedFile)

  return isUploadedFileValid && projectTitle && category
}

/**
 * This method closes the project management dialog.
 */
function closeProjectManagementDialog() {
  const dialogHtmlElement = findHtmlElementById('project-management-dialog')
  hide(dialogHtmlElement)
  dialogHtmlElement.ariaModal = false

  resetDialogForm()
}

/**
 * This function displays categories in the "select" component of the project management dialog.
 */
async function displayCategoriesInDialog() {
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  categorySelectHtmlElement.innerHTML = ''

  if (state.categories.length === 0) {
    await getAllCategories()
  }

  for (const category of state.categories) {
    categorySelectHtmlElement.innerHTML += `<option value=${category.id}>${category.name}</option>`
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
  show(stepToDisplayContainerHtmlElement)

  const stepNotToDisplay = step === 1 ? 2 : 1
  const stepNotToDisplayContainerHtmlElement = findHtmlElementById(
    `project-management-dialog-step-${stepNotToDisplay}`
  )
  hide(stepNotToDisplayContainerHtmlElement)

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
    hide(dialogBackArrowContainerHtmlElement)

    const dialogGalleryHtmlElement = findHtmlElementById(
      'project-management-dialog-gallery'
    )
    displayWorksInsideDialog(dialogGalleryHtmlElement)
  } else {
    show(dialogBackArrowContainerHtmlElement)

    displayCategoriesInDialog()
  }
}

/**
 * @param {HTMLInputElement} fileInputHtmlElement - input from which the file upload has been made by the user
 * @param {HTMLImageElement} uploadedImageHtmlElement - HTML element representing the image uploaded by the user
 * @param {HTMLDivElement} fileInputContainerHtmlElement - container HTML element wrapping the file input
 */
function displayUploadedImage(
  fileInputHtmlElement,
  uploadedImageHtmlElement,
  fileInputContainerHtmlElement
) {
  const uploadedFile = fileInputHtmlElement.files[0]

  if (!uploadedFileValid(uploadedFile)) {
    return
  }

  const fileReader = new FileReader()
  fileReader.onload = (event) => {
    uploadedImageHtmlElement.setAttribute('src', event.target.result)
    hide(fileInputContainerHtmlElement)
    show(uploadedImageHtmlElement)
  }
  fileReader.readAsDataURL(uploadedFile)
}

/**
 * @param {HTMLElement} parentHtmlElement - HTML element in which to display works
 */
function displayWorksInsideDialog(parentHtmlElement) {
  parentHtmlElement.innerHTML = ''
  for (const work of state.works) {
    const imageWrapperHtmlElement = document.createElement('div')
    imageWrapperHtmlElement.classList.add('image-wrapper')
    imageWrapperHtmlElement.dataset.workId = work.id.toString()
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
function handleDialogFormSubmissionState() {
  /**
   * @type {HTMLInputElement}
   */
  const fileInputHtmlElement = findHtmlElementById('file-input')
  const uploadedFile = fileInputHtmlElement.files[0]

  /**
   * @type {HTMLInputElement}
   */
  const projectTitleInputHtmlElement = findHtmlElementById('project-title')
  const projectTitle = projectTitleInputHtmlElement.value

  /**
   * @type {HTMLSelectElement}
   */
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  const category = categorySelectHtmlElement.value

  /**
   * @type {HTMLButtonElement}
   */
  const formSubmissionButtonHtmlElement = findHtmlElementById(
    'project-management-dialog-form-submission-button'
  )

  formSubmissionButtonHtmlElement.disabled = !canFormBeSubmitted(
    uploadedFile,
    projectTitle,
    category
  )

  const isUploadedFileValid =
    uploadedFile !== undefined ? uploadedFileValid(uploadedFile) : false

  const fileUploadErrorMessageHtmlElement = findHtmlElementById(
    'file-upload-error-message'
  )

  if (isUploadedFileValid || uploadedFile === undefined) {
    hide(fileUploadErrorMessageHtmlElement)
  } else {
    show(fileUploadErrorMessageHtmlElement)
  }
}

/**
 * @param {number} workId - work id in database
 */
async function removeWorkById(workId) {
  const bearerToken = getCookieValue('token')
  const isWorkDeleted = await deleteWork(workId, bearerToken)
  if (isWorkDeleted) {
    const workHtmlElements = document.querySelectorAll(
      `[data-work-id="${workId}"]`
    )
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

  const uploadedImageHtmlElement = findHtmlElementById('uploaded-image')
  hide(uploadedImageHtmlElement)
  const fileInputContainerHtmlElement = findHtmlElementById(
    'file-input-container'
  )
  show(fileInputContainerHtmlElement)

  const fileUploadErrorMessageHtmlElement = findHtmlElementById(
    'file-upload-error-message'
  )
  hide(fileUploadErrorMessageHtmlElement)

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
}

/**
 * This function posts a work to the server.
 * @param {Event} event - click event from the user
 */
async function submitForm(event) {
  // Prevent the default page refresh when submitting a form
  event.preventDefault()

  /**
   * @type {HTMLInputElement}
   */
  const fileInputHtmlElement = findHtmlElementById('file-input')
  const uploadedFile = fileInputHtmlElement.files[0]

  /**
   * @type {HTMLInputElement}
   */
  const projectTitleInputHtmlElement = findHtmlElementById('project-title')
  const projectTitle = projectTitleInputHtmlElement.value

  /**
   * @type {HTMLSelectElement}
   */
  const categorySelectHtmlElement = findHtmlElementById('project-category')
  const category = categorySelectHtmlElement.value

  if (!canFormBeSubmitted(uploadedFile, projectTitle, category)) {
    return
  }

  const bearerToken = getCookieValue('token')

  const newWork = await postWork(
    uploadedFile,
    projectTitle,
    category,
    bearerToken
  )
  const galleryHtmlElement = findHtmlElementById('gallery')
  displayNewWork(newWork, galleryHtmlElement)

  closeProjectManagementDialog()
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

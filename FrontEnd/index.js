import { getAllWorks } from './fetch.js'
import { Work } from './models/work.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './utils/dom-read-utils.js'
import {
  displayWorksByCategoryId,
  setFilterAsActive,
} from './utils/dom-write-utils.js'

const galleryHtmlElement = findHtmlElementById('gallery')

// Get all works from the API and deduce from them all categories to display
const allWorks = await getAllWorks()
const allCategoryIds = [...new Set(allWorks.map((work) => work.categoryId))]
/**
 * @type {Category[]}
 */
const allCategories = allCategoryIds.map((categoryId) => {
  /**
   * @type {Work}
   */
  const work = allWorks.find((work) => work.categoryId === categoryId)
  const workCategoryName = work.category.name
  return {
    id: categoryId,
    name: workCategoryName,
  }
})

// Add category filters on the DOM created from the categories fetched from the API
const categoryFilterContainerHtmlElement =
  findHtmlElementById('category-filters')
allCategories.forEach((category) => {
  const categoryHtmlElement = document.createElement('li')
  categoryHtmlElement.innerHTML = `<button class="category-filter" data-id="${category.id}">${category.name}</button>`
  categoryFilterContainerHtmlElement.appendChild(categoryHtmlElement)
})

// Add event listeners on category filters
const allFilterHtmlElements = findAllHtmlElementsByCssClass('category-filter')
allFilterHtmlElements.forEach((filterHtmlElement) =>
  filterHtmlElement.addEventListener('click', () => {
    const categoryId =
      filterHtmlElement.dataset['id'] !== undefined
        ? parseInt(filterHtmlElement.dataset['id'])
        : undefined
    displayWorksByCategoryId(allWorks, categoryId, galleryHtmlElement)
    setFilterAsActive(filterHtmlElement, allFilterHtmlElements)
  })
)

// Click on the "All" category filter
const allFilterHtmlElement = findHtmlElementById('default-category-filter')
allFilterHtmlElement.click()

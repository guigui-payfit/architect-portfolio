import { getAllCategories, getAllWorks } from './fetch.js'
import {
  findAllHtmlElementsByCssClass,
  findHtmlElementById,
} from './utils/dom-read-utils.js'
import {
  displayWorksByCategoryId,
  setFilterAsActive,
} from './utils/dom-write-utils.js'

const galleryHtmlElement = findHtmlElementById('gallery')

// Get all categories and works from the API
const allCategories = await getAllCategories()
const allWorks = await getAllWorks()

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

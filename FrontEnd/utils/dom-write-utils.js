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
    parentHtmlElement.innerHTML += `<figure>
					<img src=${work.imageUrl} alt=${work.title}>
					<figcaption>${work.title}</figcaption>
				</figure>`
  }
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

/**
 * @param {string} cssClass - CSS class name
 * @param {Document | HTMLElement} parentHtmlElement - direct or indirect HTML parent element of the searched HTML elements
 * @returns {HTMLElement[]} all the HTML elements found with the given CSS class name in the given HTML parent element
 */
export function findAllHtmlElementsByCssClass(
  cssClass,
  parentHtmlElement = document
) {
  const htmlElements = Array.from(
    parentHtmlElement.querySelectorAll(`.${cssClass}`)
  )
  if (htmlElements.length > 0) {
    return htmlElements
  }
  if (parentHtmlElement === document)
    throw new Error(
      `The CSS class "${cssClass}" may have been removed from the HTML file. Please put this CSS class back in it again.`
    )
  throw new Error(
    `No child HTML element has the CSS class "${cssClass}". Please put this CSS class back on the expected child element(s).`
  )
}

/**
 * @param {string} id - HTML id attribute
 * @returns {HTMLElement} the HTML element found with the given HTML id attribute in the DOM
 */
export function findHtmlElementById(id) {
  const htmlElement = document.getElementById(id)
  if (htmlElement !== null) {
    return htmlElement
  }
  throw new Error(
    `The id "${id}" may have been removed from the HTML file. Please put this id back in it again.`
  )
}

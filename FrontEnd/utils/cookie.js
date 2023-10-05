/**
 * @param {string} key - key of a cookie item
 * @returns {string | undefined} value of a cookie item if the given key matches the key of this cookie item
 */
export function getCookieValue(key) {
  const cookieItem = document.cookie
    .split('; ')
    .find((keyValue) => keyValue.startsWith(`${key}=`))
  if (cookieItem === undefined) {
    return
  }
  const cookieItemValue = cookieItem.split('=')[1]
  return cookieItemValue
}

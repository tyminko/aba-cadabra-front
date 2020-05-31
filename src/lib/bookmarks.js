import findLastIndex from 'lodash.findlastindex'

let pathStack = []

let currentPosition = 0

export function findHistoryKey (key) {
  return findLastIndex(pathStack, pathInfo => pathInfo.key === key)
}

export function currentPos () {
  return currentPosition
}

export function updateCurrentPos (pos) {
  currentPosition = pos
}

export function clearForwardHistory () {
  pathStack = pathStack.slice(0, currentPosition + 1)
}
/**
 * @param {{path:string, key:string}} pathInfo
 * @return {number}
 */
export function add (pathInfo) {
  pathStack.push(pathInfo)
  return pathStack.length - 1
}

/**
 * @param {string} key
 * @param {string} path
 */
export function updateBookmarksHistory (key, path) {
  if (!key) return
  const index = findHistoryKey(key)
  if (index === -1) {
    // Key does not exist, add new entry.
    // As the new history item will be added, current "forward"
    // history should be disposed (from the current position to the end)
    if (currentPosition >= 0) {
      clearForwardHistory()
    }
    currentPosition = add({ key, path })
  } else {
    // Key exists already, we are moving in history,
    // just update the position
    currentPosition = index
  }
}

// Return a bookmark information that can be then used to
// navigate back to that location
export function getBookmark () {
  return pathStack[currentPosition]
}

// Goes back/forward in history by given bookmark
export function gotoBookmark (bookmark) {
  if (bookmark) {
    // Try to find how many steps we need to take
    const currentKey = history.state && history.state.key
    const currentIndex = currentKey
      ? findLastIndex(pathStack, pathInfo => pathInfo.key === currentKey)
      : -1
    const targetIndex = currentIndex !== -1
      ? findLastIndex(pathStack, pathInfo => pathInfo.key === bookmark.key)
      : -1
    if (targetIndex !== -1) {
      const delta = targetIndex - currentIndex
      history.go(delta)
    }
  }
}

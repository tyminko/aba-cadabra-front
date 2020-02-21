export function saveSelection () {
  if (window.getSelection) {
    const sel = window.getSelection()
    if (sel.getRangeAt && sel.rangeCount) {
      const ranges = []
      let i = 0
      let len = sel.rangeCount
      for (; i < len; ++i) {
        ranges.push(sel.getRangeAt(i))
      }
      return ranges
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange()
  }
  return null
}

export function restoreSelection (savedSel) {
  if (savedSel) {
    if (window.getSelection) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      let i = 0
      let len = savedSel.length
      for (; i < len; ++i) {
        sel.addRange(savedSel[i])
      }
    } else if (document.selection && savedSel.select) {
      savedSel.select()
    }
  }
}

export function createLink () {
  // There's actually no need to save and restore the selection here. This is just an example.
  const savedSel = saveSelection()
  const url = document.getElementById('url').value
  restoreSelection(savedSel)
  document.execCommand('CreateLink', false, url)
}

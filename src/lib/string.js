import slugify from 'slugify'

export const makeExcerpt = (string, wordsLimit = 50) => {
  const words = stripHtml(string).replace(/\s+/g, ' ').split(' ')
  const dots = words.length > wordsLimit ? '…' : ''
  return words.splice(0, wordsLimit).join(' ') + dots
}

export const stripHtml = html => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const toCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  })
}

export const toSlug = (s) => {
  return slugify(s, { remove: /["'<>#%{}|\\^~[\]`;?:@=&]/g })
}

import slugify from 'slugify'

export const makeExcerpt = (string, wordsLimit) => {
  const words = stripHtml(string).replace(/\s+/g, ' ').split(' ')
  return words.splice(0, wordsLimit || 50).join(' ')
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

import { DateTime } from 'luxon'

const FORMAT_STRINGS = {}
const CALENDAR_STRINGS = {}

function makeShortFormat (locale) {
  const dt = DateTime.fromObject({ month: 12, year: 1111, day: 31 })
  return dt.setLocale(locale).toLocaleString(DateTime.DATE_SHORT)
    .replace('12', 'LL')
    .replace('1111', 'yyyy')
    .replace('31', 'dd')
}

export function dateInFuture (timestamp) {
  const dt = timestamp instanceof DateTime ? timestamp : DateTime.fromMillis(timestamp)
  return dt.startOf('day') > DateTime.local().startOf('day')
}

export function getShortFormatForLocale (locale) {
  if (!locale) locale = DateTime.local().locale
  if (!FORMAT_STRINGS.hasOwnProperty(locale)) {
    FORMAT_STRINGS[locale] = makeShortFormat(locale)
  }
  return FORMAT_STRINGS[locale]
}

/**
 * @param {string|DateTime} timestamp
 * @param format
 * @param locale
 * @return {string}
 */
export function format (timestamp, format = 'numeric', locale) {
  if (!timestamp) return ''
  const dt = timestamp instanceof DateTime ? timestamp : DateTime.fromMillis(timestamp)
  switch (format) {
    case 'long':
      return dt.setLocale(locale).toLocaleString(DateTime.DATE_FULL)
    case 'full':
      return dt.setLocale(locale).toLocaleString({ ...DateTime.DATETIME_MED, ...{ month: 'long' } })
    default:
      return dt.setLocale(locale).toLocaleString(DateTime.DATE_SHORT)
  }
}

export function formatTime (date, locale) {
  const d = new Date(date)
  return d.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })
}

export function formatPeriod (timestampStart, timestampEnd, locale) {
  const startDT = timestampStart instanceof DateTime ? timestampStart : DateTime.fromMillis(timestampStart)
  const endDT = timestampEnd instanceof DateTime ? timestampEnd : DateTime.fromMillis(timestampEnd)
  const startFormat = startDT.year === endDT.year ? 'LLL' : 'LLL y'
  return `${startDT.toFormat(startFormat, { locale })}-${endDT.toFormat('LLL y', { locale })}`
}

export function parseTime (string) {
  const parts = string.trim().split(':')
  let hour = parts[0] || 0
  let minute = 0
  if (parts.length > 1) {
    minute = parts[1] || 0
  } else if (hour && hour.length > 2) {
    minute = (hour.substring(2))
  }
  hour = parseInt(hour ? hour.substring(0, 2) : hour)
  if (!Number.isInteger(hour)) hour = 0
  if (hour > 23) hour = 23
  minute = parseInt(minute ? minute.substring(0, 2) : minute)
  if (!Number.isInteger(minute)) minute = 0
  if (minute > 59) minute = 59
  return { hour, minute }
}

export function parse (string, locale) {
  let checkDate = DateTime.fromFormat(string, getShortFormatForLocale(locale))
  if (checkDate.isValid) return checkDate

  let match = string.match(/^(\d{1,4})\s*([-/.', ])\s*(\d{1,2})\s*([-/.', ])\s*(\d{1,4})\s*([-/.', ]?)\s*$/)
  if (match) {
    const m1 = match[1]
    const m2 = match[3]
    const m3 = match[5]
    let year, month, day
    if (m1.length > 2) {
      year = m1
      month = m2
      day = m3
    } else {
      day = m1
      month = m2
      year = m3.length === 1
        ? `200${m3}`
        : m3.length === 2
          ? `20${m3}`
          : m3
    }
    if (month > 12 && month <= 31 && day <= 12) {
      [month, day] = [day, month]
    }
    let checkDate = DateTime.fromObject({ year, month, day })
    return checkDate.isValid ? checkDate : null
  }
  match = string.match(/^(\d{1,4})\s*([-/.', ])\s*(\d{1,4})\s*([-/.', ]?)\s*$/)
  if (match) {
    const m1 = match[1]
    const m2 = match[3]
    let year, month, day
    if (m1.length > 2) {
      year = m1
      month = parseInt(m2) ? m2 : new Date().getMonth() + 1
      day = 1
    } else if (m2.length > 2) {
      year = m2
      month = m1
      day = 1
    } else {
      day = m1
      month = parseInt(m2) ? m2 : new Date().getMonth() + 1
      year = new Date().getFullYear()
      if (month > 12 && month <= 31 && day <= 12) {
        [month, day] = [day, month]
      }
    }
    let checkDate = DateTime.fromObject({ year, month, day })
    return checkDate.isValid ? checkDate : null
  }
  match = string.match(/^(\d{1,4})\s*([-/.', ]?)\s*$/)
  if (match) {
    const m1 = match[1]
    let year, month, day
    if (m1.length > 2) {
      year = m1
      month = new Date().getMonth() + 1
      day = new Date().getDate()
    } else {
      day = parseInt(m1) ? m1 : new Date().getDate()
      month = new Date().getMonth() + 1
      year = new Date().getFullYear()
    }
    let checkDate = DateTime.fromObject({ year, month, day })
    return checkDate.isValid ? checkDate : null
  }
  return null
}

export function getCalendarStringsForLocale (locale) {
  if (!locale) locale = DateTime.local().locale
  if (!CALENDAR_STRINGS.hasOwnProperty(locale)) {
    CALENDAR_STRINGS[locale] = generateLocaleStrings(locale)
  }
  return CALENDAR_STRINGS[locale]
}

function generateLocaleStrings (locale) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDay()

  const months = Array.apply(null, Array(12)).map((_, i) => {
    const d = new Date(year, i)
    return {
      short: d.toLocaleString(locale, { month: 'short' }),
      full: d.toLocaleString(locale, { month: 'long' })
    }
  })
  const firstMondayDate = today.getDate() - day + (day === 0 ? -6 : 1)
  const days = Array.apply(null, Array(7)).map((_, i) => {
    const d = new Date(year, month, firstMondayDate + i)
    return {
      short: d.toLocaleString(locale, { weekday: 'short' }),
      full: d.toLocaleString(locale, { weekday: 'long' })
    }
  })
  return { months, days }
}

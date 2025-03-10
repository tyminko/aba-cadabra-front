interface LocalData {
  [key: string]: any
}

const localData: LocalData = {}

export function get (key: string): any {
  if (localData[key] === undefined) {
    try {
      const item = localStorage.getItem(key)
      localData[key] = item ? JSON.parse(item) : null
    } catch (err) {
      console.error('Error reading from localStorage:', err)
      localData[key] = null
    }
  }
  return localData[key]
}

export function set (key: string, value: any): void {
  localData[key] = value
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Error writing to localStorage:', err)
  }
}

export function remove (key: string): void {
  delete localData[key]
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Error removing from localStorage:', err)
  }
}

export default {
  get,
  set,
  remove
}

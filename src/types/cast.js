/**
 * @param {object} object
 * @param {Class} Type
 * @return {object}
 */
export function castToType (object, Type) {
  const instance = new Type()
  if (!object || typeof object !== 'object') return instance
  Object.keys(instance).forEach(prop => {
    if (!object.hasOwnProperty(prop)) return
    const newVal = object[prop]
    let val
    switch (typeof instance[prop]) {
      case 'boolean':
        val = parseBoolean(newVal)
        if (typeof val === 'boolean') {
          instance[prop] = newVal
        }
        break
      case 'number':
        val = parseNumber(newVal)
        if (typeof val === 'number') {
          instance[prop] = newVal
        }
        break
      case 'string':
        if (typeof newVal === 'string') {
          instance[prop] = newVal
        }
        break
      default:
        const factory = Type.hasOwnProperty('propFactory') ? Type.propFactory : null
        if (factory && typeof factory[prop] === 'function') {
          instance[prop] = factory[prop](newVal)
        }
    }
  })
  return instance
}

/**
 * @param {object} object
 * @param {Class} Type
 * @return {*[]|[]}
 */
export function castToArrayOfType (object, Type) {
  if (typeof object === 'object' && object !== null) {
    const a = Array.isArray(object) ? object : Object.values(object)
    return a.map(item => castToType(item, Type))
  }
  return []
}

export function modifiedFields (object) {
  const original = object.__original || {}
  const defaultObject = new object.constructor()
  return Object.entries(object).reduce((res, [field, value]) => {
    if (field === '__original') return res
    if (original.hasOwnProperty(field)) {
      const isObj = isObject(value)
      const val = isObj ? JSON.stringify(value) : value
      const origVal = isObj ? JSON.stringify(original[field]) : original[field]
      if (val !== origVal) {
        res[field] = value
      }
      return res
    }
    if (value !== defaultObject[field]) {
      res[field] = value
    }
    return res
  }, {})
}

export function isObject (val) {
  return typeof val === 'object' && val !== null
}

function parseBoolean (value) {
  if (typeof value === 'boolean') {
    return value
  } else if (value === 1 || value === 0) {
    return !!value
  } else if (value === 'true' || value === 'false') {
    return value === 'true'
  }
}

function parseNumber (value) {
  if (typeof value === 'number') {
    return value
  } else if (typeof value === 'string') {
    const n = parseFloat(value)
    if (Number.isFinite(n)) {
      return n
    }
  }
}

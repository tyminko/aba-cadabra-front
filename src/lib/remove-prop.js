/**
 * @param {Object} value
 * @param {string|string[]} name
 * @return {Object}
 */
export default function (value, name) {
  const data = JSON.parse(JSON.stringify(value))
  const props = Array.isArray(name) ? [...name] : [name]
  props.forEach(prop => {
    if (data.hasOwnProperty(prop)) {
      delete data[prop]
    }
  })
  return data
}

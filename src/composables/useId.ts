// Declare global counter type
declare global {
  interface Window {
    __useIdCounter: number
  }
}

// Track generated IDs to prevent collisions
const generatedIds = new Set<string>()

// Prefix registry for consistent ID generation
const prefixRegistry = new Map<string, { count: number, template?: string }>()

// Counter management
let counter = 0
const getNextCount = () => ++counter

// Debug mode flag
let debugMode = false

// Default configuration
const defaultConfig = {
  randomLength: 6,
  separator: '-',
  charset: 'abcdefghijklmnopqrstuvwxyz',
  namespace: '',
  prefix: 'id',
  template: '{namespace}{separator}{prefix}{separator}{random}{separator}{count}'
} as const

// Types
type IdConfig = {
  randomLength?: number
  separator?: string
  charset?: string
  namespace?: string
  prefix?: string
  template?: string
}

type BatchConfig = IdConfig & {
  count: number
}

type IdParams = {
  namespace: string
  separator: string
  prefix: string
  random: string
  count: string
}

/**
 * Generates a random string of specified length using the given character set
 * @param {number} length - The length of the random string to generate
 * @param {string} charset - The character set to use for generation
 * @returns {string} A random string
 */
function generateRandomString (length: number, charset: string): string {
  const charLength = charset.length
  let result = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    result += charset.charAt(array[i] % charLength)
  }
  return result
}

/**
 * Ensures an ID is unique by adding additional random characters if needed
 * @param {string} id - The ID to make unique
 * @param {string} charset - The character set to use for additional randomization
 * @returns {string} A unique ID
 */
function ensureUnique (id: string, charset: string): string {
  let uniqueId = id
  while (generatedIds.has(uniqueId)) {
    uniqueId = id + generateRandomString(2, charset)
  }
  generatedIds.add(uniqueId)
  return uniqueId
}

/**
 * Validates the configuration object
 * @param {IdConfig} config - The configuration to validate
 * @throws {Error} If the configuration is invalid
 */
function validateConfig (config: IdConfig): void {
  if (config.randomLength !== undefined && (config.randomLength < 1 || config.randomLength > 32)) {
    throw new Error('randomLength must be between 1 and 32')
  }
  if (config.charset !== undefined && config.charset.length < 2) {
    throw new Error('charset must contain at least 2 characters')
  }
  if (config.separator !== undefined && config.separator.length > 3) {
    throw new Error('separator must not be longer than 3 characters')
  }
  if (config.template && !config.template.includes('{random}')) {
    throw new Error('template must include {random} placeholder')
  }
}

/**
 * Formats an ID using a template
 * @param {IdParams} params - Parameters to format the template with
 * @param {string} template - The template string
 * @returns {string} Formatted ID string
 */
function formatId (params: IdParams, template: string): string {
  return template.replace(/{(\w+)}/g, (match, key: keyof IdParams) => params[key] || '')
}

/**
 * Reserves an ID for future use
 * @param {string} id - The ID to reserve
 * @returns {boolean} Whether the reservation was successful
 */
function reserveId (id: string): boolean {
  if (generatedIds.has(id)) return false
  generatedIds.add(id)
  return true
}

/**
 * Gets the prefix string from the prefix or config
 * @param {string | IdConfig | undefined} prefixOrConfig - The prefix or config
 * @returns {string} The prefix string
 */
function getPrefix (prefixOrConfig: string | IdConfig | undefined): string {
  if (typeof prefixOrConfig === 'string') return prefixOrConfig
  if (!prefixOrConfig) return defaultConfig.prefix
  return prefixOrConfig.prefix || defaultConfig.prefix
}

/**
 * Composable that generates unique IDs for components
 * @param {string | IdConfig} prefixOrConfig - Either a prefix string or a configuration object
 * @returns {string} A unique ID string
 *
 * @example
 * // Basic usage with prefix
 * const id = useId('button') // => 'button-abc123-1'
 *
 * @example
 * // Advanced usage with configuration
 * const id = useId({
 *   prefix: 'button',
 *   namespace: 'form',
 *   randomLength: 8,
 *   charset: 'ABC123',
 *   separator: '_'
 * }) // => 'form_button_A1B2C3_1'
 */
export function useId (prefixOrConfig?: string | IdConfig): string {
  // Increment counter
  const count = getNextCount()

  // Handle string prefix case
  if (typeof prefixOrConfig === 'string' || !prefixOrConfig) {
    const prefix = getPrefix(prefixOrConfig)
    const registryEntry = prefixRegistry.get(prefix)

    if (registryEntry) {
      const template = registryEntry.template || defaultConfig.template
      const randomStr = generateRandomString(defaultConfig.randomLength, defaultConfig.charset)
      const params: IdParams = {
        namespace: defaultConfig.namespace,
        separator: defaultConfig.separator,
        prefix,
        random: randomStr,
        count: String(++registryEntry.count)
      }
      const id = formatId(params, template)
      return ensureUnique(id, defaultConfig.charset)
    }

    const randomStr = generateRandomString(defaultConfig.randomLength, defaultConfig.charset)
    const id = `${prefix}${defaultConfig.separator}${randomStr}${defaultConfig.separator}${count}`
    return ensureUnique(id, defaultConfig.charset)
  }

  // Handle configuration object case
  const config = { ...defaultConfig, ...prefixOrConfig }
  validateConfig(config)

  const { namespace, prefix, randomLength, charset, separator, template } = config
  const randomStr = generateRandomString(randomLength, charset)

  if (template) {
    const params: IdParams = {
      namespace: namespace || '',
      separator,
      prefix: prefix || '',
      random: randomStr,
      count: String(count)
    }
    const id = formatId(params, template)
    return ensureUnique(id, charset)
  }

  const parts = [
    namespace,
    prefix,
    randomStr,
    count.toString()
  ].filter(Boolean)

  const id = parts.join(separator)
  return ensureUnique(id, charset)
}

// Add static configuration method
useId.configure = function (config: IdConfig): void {
  validateConfig(config)
  Object.assign(defaultConfig, config)
}

// Add method to clear generated IDs (useful for testing)
useId.clearTracking = function (): void {
  generatedIds.clear()
  prefixRegistry.clear()
  counter = 0
}

// Add method to check if an ID exists
useId.exists = function (id: string): boolean {
  return generatedIds.has(id)
}

// Add method to register a prefix with optional template
useId.registerPrefix = function (prefix: string, template?: string): void {
  if (template) validateConfig({ template })
  prefixRegistry.set(prefix, { count: 0, template })
}

// Add method to generate multiple IDs at once
useId.batch = function (config: BatchConfig): string[] {
  const { count, ...idConfig } = config
  return Array.from({ length: count }, () => useId(idConfig))
}

// Add method to reserve an ID
useId.reserve = reserveId

// Add debug mode toggle
useId.setDebugMode = function (enabled: boolean): void {
  debugMode = enabled
  if (enabled) {
    console.log('useId debug mode enabled')
    const debugState = {
      generatedIds: Array.from(generatedIds),
      prefixRegistry: Array.from(prefixRegistry).reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {} as Record<string, { count: number, template?: string }>),
      counter,
      defaultConfig
    }
    console.log('Current state:', debugState)
  }
}

// Initialize counter in global scope for SSR compatibility
if (typeof window === 'undefined') {
  (globalThis as any).__useIdCounter = 0
}

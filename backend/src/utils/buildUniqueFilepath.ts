import { randomByteFromRanges } from 'node-lib'

/**
 * Returns a unique name hash with timestamp and random bytes.
 * - - - -
 * @param {string} extension The extension you want to attach to the file.
 * @returns {string}
 */
export const buildUniqueFilename = (extension?: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
  const random = randomByteFromRanges(3).toString('hex')
  return `${timestamp}_${random.toUpperCase()}${extension ? (extension.startsWith('.') ? extension : `.${extension}`) : ''}`
}

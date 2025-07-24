import type { YARGReplayValidatorResults } from '../app.exports'

export const processReplayValidator = <T extends object>(obj: Record<string, any>) => {
  const output = new Map<string, any>()
  for (const objKeys of Object.keys(obj)) {
    const newKeys = `${objKeys.charAt(0).toLowerCase()}${objKeys.slice(1)}`
    const val = obj[objKeys] as unknown
    if (val && typeof val === 'object') output.set(newKeys, processReplayValidator(val))
    else output.set(newKeys, val)
  }

  return Object.fromEntries(output.entries()) as T
}

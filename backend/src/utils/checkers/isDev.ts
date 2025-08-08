import { evalBooleanString } from '../../utils.exports'

export const isDev = (): boolean => (process.env.DEV ? evalBooleanString(process.env.DEV) : false)

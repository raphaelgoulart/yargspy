export type BooleanStringValueTypes = 'true' | 'false' | '1' | '0'

export const evalBooleanString = (val: string) => (val.toLowerCase().trim() === 'true' || val.toLowerCase().trim() === '1' ? true : false)

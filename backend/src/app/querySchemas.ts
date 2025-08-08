import zod from 'zod'
import { ServerError } from './error'

export const userAllEntriesQuerystringSchema = zod.object({
  page: zod
    .string()
    .optional()
    .default('1')
    .transform((arg) => {
      const num = Number(arg)
      if (isNaN(num)) throw new ServerError('err_invalid_input')
      return num
    }),
  limit: zod
    .string()
    .optional()
    .default('15')
    .transform((arg) => {
      const num = Number(arg)
      if (isNaN(num)) throw new ServerError('err_invalid_input')
      return num
    }),
})

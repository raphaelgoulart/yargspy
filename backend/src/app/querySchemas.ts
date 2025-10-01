import zod from 'zod'
import { ServerError } from './error'

export const userEntriesQuerystringSchema = zod.object({
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
  username: zod
    .string()
    .min(3).max(32)
    .optional()
})

export const songEntriesQuerystringSchema = zod.object({
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
  name: zod
    .string()
    .optional(),
  artist: zod
    .string()
    .optional(),
  charter: zod
    .string()
    .optional(),
  sort: zod
    .string()
    .optional()
    .default('0')
    .transform((arg) => {
      const num = Number(arg)
      if (isNaN(num)) throw new ServerError('err_invalid_input')
      return num
    }),
  descending: zod
    .string()
    .optional()
})

export const userScoresQuerystringSchema = zod.object({
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
  id: zod
    .string()
    .nonempty()
})

export const adminLogsQuerystringSchema = zod.object({
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
  admin: zod
    .string()
    .optional(),
  action: zod
    .string()
    .optional()
    .default('-1')
    .transform((arg) => {
      const num = Number(arg)
      if (isNaN(num)) throw new ServerError('err_invalid_input')
      return num
    }),
  startDate: zod.iso.datetime().optional(),
  endDate: zod.iso.datetime().optional(),
})
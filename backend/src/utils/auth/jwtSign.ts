import { createSigner, createVerifier } from 'fast-jwt'
import 'dotenv/config'

/**
 * Returns a function that can sign JsonWebTokens.
 * - - - -
 */
export const jwtSign = createSigner({ key: process.env.JWT_SECRET, expiresIn: '30 days' })

/**
 * Returns a function that can verify and decrypt JsonWebTokens.
 * - - - -
 */
export const jwtVerify = createVerifier({ key: process.env.JWT_SECRET })

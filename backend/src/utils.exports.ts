import { pathLikeToDirPath, resolve } from 'node-lib'

export * from './utils/bearerTokenVerifier'
export * from './utils/envCheck'
export * from './utils/jwtSign'
export * from './utils/passwordValidator'

export const packageDirPath = () => pathLikeToDirPath(resolve(import.meta.dirname, '../'))

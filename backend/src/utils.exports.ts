import { pathLikeToDirPath, resolve } from 'node-lib'

export * from './utils/bearerTokenVerifier'
export * from './utils/buildUniqueFilepath'
export * from './utils/envCheck'
export * from './utils/jwtSign'
export * from './utils/passwordValidator'
export * from './utils/processReplayValidator'

export const packageDirPath = () => pathLikeToDirPath(resolve(import.meta.dirname, '../'))

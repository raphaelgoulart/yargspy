import { pathLikeToDirPath, resolve } from 'node-lib'
import 'dotenv/config'

export const getServerRoot = () => pathLikeToDirPath(resolve(import.meta.dirname, '../../../'))
export const getServerTemp = () => getServerRoot().gotoDir('temp')
export const getServerPublic = () => getServerRoot().gotoDir('public')
export const getValidatorPath = () => getServerRoot().gotoFile(process.env.DEV ? (Boolean(process.env.DEV) ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe') : 'bin/YARGReplayValidator.exe')

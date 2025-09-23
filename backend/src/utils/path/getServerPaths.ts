import { pathLikeToDirPath, resolve } from 'node-lib'
import { isDev } from '../checkers/isDev'

export const getServerRoot = () => pathLikeToDirPath(resolve(import.meta.dirname, '../../../'))
export const getServerTemp = () => getServerRoot().gotoDir('temp')
export const getServerFile = () => getServerRoot().gotoDir('files')
export const getValidatorPath = () => getServerRoot().gotoFile(isDev() ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe')

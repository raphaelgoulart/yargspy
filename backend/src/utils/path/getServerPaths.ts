import { pathLikeToDirPath, resolve } from 'node-lib'
import { isDev } from '../checkers/isDev'

export const getServerRoot = () => pathLikeToDirPath(process.env.FILE_ROOT ? process.env.FILE_ROOT : resolve(import.meta.dirname, '../../../'))
export const getServerTemp = () => (process.env.FILE_TEMP ? pathLikeToDirPath(process.env.FILE_TEMP) : getServerRoot().gotoDir('temp'))
export const getServerFile = () => getServerRoot().gotoDir('files')
export const getValidatorPath = () => {
  const extension = process.platform === 'win32' ? '.exe' : '.dll'
  return pathLikeToDirPath(resolve(import.meta.dirname, '../../../')).gotoFile(isDev() ? `../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator${extension}` : `bin/YARGReplayValidator${extension}`)
}

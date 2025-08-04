import type { DirPath } from 'node-lib'
import { getServerTemp } from '../path/getServerPaths'

export const tempFolderCheck = async (): Promise<DirPath> => {
  const temp = getServerTemp()
  if (!temp.exists) await temp.mkDir()
  return temp
}

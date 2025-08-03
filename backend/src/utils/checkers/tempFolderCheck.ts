import { getServerTemp } from '../path/getServerPaths'

export const tempFolderCheck = async () => {
  const temp = getServerTemp()
  if (!temp.exists) await temp.mkDir()
}

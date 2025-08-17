import type { DirPath } from 'node-lib'
import { getServerPublic, getServerTemp } from '../path/getServerPaths'

export const checkTempAndPublicFolders = async (): Promise<{
  [key in 'tempFolder' | 'publicFolder' | 'publicReplay' | 'publicChart']: DirPath
}> => {
  const tempFolder = getServerTemp()
  if (!tempFolder.exists) await tempFolder.mkDir()

  const publicFolder = getServerPublic()
  if (!publicFolder.exists) await publicFolder.mkDir()

  const publicReplay = publicFolder.gotoDir('replay')
  const publicChart = publicFolder.gotoDir('chart')
  if (!publicReplay.exists) await publicReplay.mkDir()
  if (!publicChart.exists) await publicChart.mkDir()

  return { tempFolder, publicFolder, publicReplay, publicChart }
}

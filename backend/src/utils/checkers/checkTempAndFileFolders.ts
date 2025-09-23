import type { DirPath } from 'node-lib'
import { getServerFile, getServerTemp } from '../path/getServerPaths'

export const checkTempAndFileFolders = async (): Promise<{
  [key in 'tempFolder' | 'fileFolder' | 'fileReplay' | 'fileChart']: DirPath
}> => {
  const tempFolder = getServerTemp()
  if (!tempFolder.exists) await tempFolder.mkDir()

  const fileFolder = getServerFile()
  if (!fileFolder.exists) await fileFolder.mkDir()

  const fileReplay = fileFolder.gotoDir('replay')
  const fileChart = fileFolder.gotoDir('chart')
  if (!fileReplay.exists) await fileReplay.mkDir()
  if (!fileChart.exists) await fileChart.mkDir()

  return { tempFolder, fileFolder, fileReplay, fileChart }
}

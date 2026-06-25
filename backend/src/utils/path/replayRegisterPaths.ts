import { buildUniqueFilename } from './buildUniqueFilename'
import { getServerFile, getServerTemp } from './getServerPaths'

export const createReplayRegisterTempPaths = () => {
  const temp = getServerTemp()
  const uid = buildUniqueFilename()
  const replayTemp = temp.gotoFile(`${uid}.replay`)
  const midiTemp = temp.gotoFile(`${uid}.mid`)
  const chartTemp = temp.gotoFile(`${uid}.chart`)
  const iniTemp = temp.gotoFile(`${uid}.ini`)
  const dtaTemp = temp.gotoFile(`${uid}.dta`)
  const updateTemp = temp.gotoFile(`${uid}.update.mid`)
  const upgradeTemp = temp.gotoFile(`${uid}.upgrade.mid`)

  const deleteAllTempFiles = async () => {
    if (replayTemp.exists) await replayTemp.delete()
    if (midiTemp.exists) await midiTemp.delete()
    if (chartTemp.exists) await chartTemp.delete()
    if (iniTemp.exists) await iniTemp.delete()
    if (dtaTemp.exists) await dtaTemp.delete()
    if (updateTemp.exists) await updateTemp.delete()
    if (upgradeTemp.exists) await upgradeTemp.delete()
  }
  return { replayTemp, midiTemp, chartTemp, iniTemp, dtaTemp, updateTemp, upgradeTemp, deleteAllTempFiles }
}

export const createReplayRegisterPaths = () => {
  const fileFolder = getServerFile()
  const uid = buildUniqueFilename()
}

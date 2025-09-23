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

  const deleteAllTempFiles = async () => {
    if (replayTemp.exists) await replayTemp.delete()
    if (midiTemp.exists) await midiTemp.delete()
    if (chartTemp.exists) await chartTemp.delete()
    if (iniTemp.exists) await iniTemp.delete()
    if (dtaTemp.exists) await dtaTemp.delete()
  }
  return { replayTemp, midiTemp, chartTemp, iniTemp, dtaTemp, deleteAllTempFiles }
}

export const createReplayRegisterPaths = () => {
  const fileFolder = getServerFile()
  const uid = buildUniqueFilename()
}

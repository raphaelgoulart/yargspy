import type { FilePath } from 'node-lib'
import { ServerError } from '../../app.exports'

export const replayRegisterTempFileInputCheck = async ({ replayTemp, chartTemp, dtaTemp, iniTemp, midiTemp }: Record<'replayTemp' | 'chartTemp' | 'dtaTemp' | 'iniTemp' | 'midiTemp', FilePath>, replayOnly = false): Promise<void> => {
  // Might need to make a more robust checking, maybe calculate header size?
  const replayMagic = (await replayTemp.readOffset(0, 8)).toString()
  if (replayMagic !== 'YARGPLAY' && replayMagic !== 'YAREPLAY') throw new ServerError('err_replay_invalid_magic')

  if (replayOnly) return
}

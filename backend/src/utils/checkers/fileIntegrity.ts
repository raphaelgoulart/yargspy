import type { FilePath } from 'node-lib'
import { ServerError } from '../../app.exports'

export const checkReplayFileIntegrity = async (replayFilePath: FilePath): Promise<void> => {
  // Might need to make a more robust checking, maybe calculate header size?
  const replayMagic = (await replayFilePath.readOffset(0, 8)).toString()
  if (replayMagic !== 'YARGPLAY' && replayMagic !== 'YAREPLAY') throw new ServerError('err_replay_invalid_replay_file')
}

export const checkChartFilesIntegrity = async (chartPath: FilePath, midiPath: FilePath) => {
  if (midiPath.exists) {
    const midiMagic = (await midiPath.readOffset(0, 4)).toString()
    if (midiMagic !== 'MThd') {
      throw new ServerError('err_replay_invalid_midi_file')
    }
  }

  if (chartPath.exists) {
    let chartMagicBytes = (await chartPath.readOffset(0, 9)).toString('hex')

    // Excluding BOM from UTF-8 files (if any)
    if (chartMagicBytes.toLowerCase().startsWith('efbbbf')) chartMagicBytes = Buffer.from(chartMagicBytes.substring(6), 'hex').toString()
    else chartMagicBytes = Buffer.from(chartMagicBytes.substring(0, 12), 'hex').toString()
    if (chartMagicBytes !== '[Song]' && chartMagicBytes !== '[song]') {
      throw new ServerError('err_replay_invalid_chart_file')
    }
  }
}

export const checkSongDataFilesIntegrity = async (iniPath: FilePath, dtaPath: FilePath) => {}

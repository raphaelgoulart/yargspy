import { execAsync, pathLikeToFilePath, type BufferEncodingOrNull, type FilePathLikeTypes } from 'node-lib'
import { getValidatorPath } from '../path/getServerPaths'
import { ServerError } from '../../app.exports'
import type { SongSchemaDocument } from '../../models/Song'

export interface ValidatorReturnSongHashObject {
  songChecksum: { hashBytes: string }
}

export const ReadMode = {
  ReplayOnly: 0,
  ReplayAndMidi: 1,
  MidiOnly: 2,
  ReturnSongHash: 3,
} as const

export class YARGReplayValidatorAPI {
  static camelCaseKeyTransform<T extends object>(obj: Record<string, any>) {
    const output = new Map<string, any>()
    for (const objKeys of Object.keys(obj)) {
      const newKeys = `${objKeys.charAt(0).toLowerCase()}${objKeys.slice(1)}`
      const val = obj[objKeys] as unknown
      if (val && typeof val === 'object') output.set(newKeys, this.camelCaseKeyTransform(val))
      else output.set(newKeys, val)
    }

    return Object.fromEntries(output.entries()) as T
  }

  static async returnSongHashRaw(replayFilePath: FilePathLikeTypes): Promise<ValidatorReturnSongHashObject> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)

    const command = `"./${validatorPath.fullname}" "${replayFile.path}" -m ${ReadMode.ReturnSongHash}`
    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', { stderr })

    return this.camelCaseKeyTransform<ValidatorReturnSongHashObject>(JSON.parse(stdout))
  }

  /**
   *
   * @param replayFilePath
   * @param [digest] `OPTIONAL` Default is `'hex'`.
   * @returns {Promise<string>}
   */
  static async returnSongHash(replayFilePath: FilePathLikeTypes, digest?: BufferEncodingOrNull): Promise<string> {
    const replayFile = pathLikeToFilePath(replayFilePath)
    const {
      songChecksum: { hashBytes: checksumRaw },
    } = await this.returnSongHashRaw(replayFile)

    return Buffer.from(checksumRaw, 'base64').toString(digest ?? 'hex')
  }

  static async returnReplayInfo(replayFilePath: FilePathLikeTypes, songFilePath: FilePathLikeTypes, replayOnly: boolean, song: SongSchemaDocument, eighthnoteHopo?: Boolean, hopofreq?: Number): Promise<Record<string, any>> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)
    const songFile = pathLikeToFilePath(songFilePath)

    const readMode = replayOnly ? ReadMode.ReplayOnly : ReadMode.ReplayAndMidi;

    let command = `"./${validatorPath.fullname}" "${replayFile.path}" "${songFile.path}" -m ${readMode}`
    // Input parameters from Song
    if (song.isRb3con) command += " -c true";
    if (song.pro_drums !== undefined) command += " -p " + (song.pro_drums ? "true" : "false")
    if (song.five_lane_drums !== undefined) command += " -g " + (song.five_lane_drums ? "true" : "false")
    if (song.sustain_cutoff_threshold !== undefined) command += " -s " + song.sustain_cutoff_threshold.toString();
    if (song.multiplier_note !== undefined) command += " -n " + song.multiplier_note.toString();
    // Other input params
    if (eighthnoteHopo !== undefined) command += " -e " + (eighthnoteHopo ? "true" : "false");
    if (hopofreq !== undefined) command += " -f " + hopofreq.toString();
    // TODO: test params
    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', { stderr })

    return JSON.parse(stdout) // TODO: types
  }
}

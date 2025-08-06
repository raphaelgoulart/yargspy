import { execAsync, pathLikeToFilePath, type BufferEncodingOrNull, type FilePathLikeTypes } from 'node-lib'
import { ServerError, type YARGReplayValidatorResults } from '../../app.exports'
import type { SongSchemaDocument } from '../../models/Song'
import { booleanToString, getValidatorPath } from '../../utils.exports'

export interface ValidatorReturnSongHashObject {
  songChecksum: { hashBytes: string }
}

export class YARGReplayValidatorAPI {
  /**
   * Enum for read-mode `-m` parameter.
   */
  static readonly readMode = {
    replayOnly: 0,
    replayAndMidi: 1,
    midiOnly: 2,
    returnSongHash: 3,
  } as const

  /**
   * Transforms the keys strings of a C#-key-style JSON object to camel case, used in JS environments.
   * - - - -
   * @template T
   * @param {Record<string, any>} obj The parsed JSON object to be transformed.
   * @returns {T}
   */
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

  /**
   * Reads a YARG REPLAY file and extracts the song's chart hash used to play this song.
   *
   * This method returns a raw unprocessed JSON object directly from the `YARGReplayValidator` process.
   * - - - -
   * @param {FilePathLikeTypes} replayFilePath The path to the YARG REPLAY file to extract the song's hash.
   * @returns {Promise<ValidatorReturnSongHashObject>}
   */
  static async returnSongHashRaw(replayFilePath: FilePathLikeTypes): Promise<ValidatorReturnSongHashObject> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)

    const command = `"./${validatorPath.fullname}" "${replayFile.path}" -m ${this.readMode.returnSongHash}`
    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', { error: stderr, errorOrigin: 'YARGReplayValidatorAPI.returnSongHash()' })

    return this.camelCaseKeyTransform<ValidatorReturnSongHashObject>(JSON.parse(stdout))
  }

  /**
   * Reads a YARG REPLAY file and extracts the song's chart hash used to play this song.
   * - - - -
   * @param {FilePathLikeTypes} replayFilePath The path to the YARG REPLAY file to extract the song's hash.
   * @param {BufferEncodingOrNull} [encoding] `OPTIONAL` The encoding of the hash. Default is `'hex'`.
   * @returns {Promise<string>}
   */
  static async returnSongHash(replayFilePath: FilePathLikeTypes, encoding: BufferEncodingOrNull = 'hex'): Promise<string> {
    const replayFile = pathLikeToFilePath(replayFilePath)
    const {
      songChecksum: { hashBytes: checksumRaw },
    } = await this.returnSongHashRaw(replayFile)

    return Buffer.from(checksumRaw, 'base64').toString(encoding ?? 'hex')
  }

  static async returnReplayInfo(replayFilePath: FilePathLikeTypes, chartFilePath: FilePathLikeTypes, isSongEntryFound: boolean, song: SongSchemaDocument, eighthNoteHopo?: boolean, hopoFreq?: number): Promise<YARGReplayValidatorResults> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)
    const chartFile = pathLikeToFilePath(chartFilePath)

    const readMode = isSongEntryFound ? this.readMode.replayOnly : this.readMode.replayAndMidi

    let command = `"./${validatorPath.fullname}" "${replayFile.path}" "${chartFile.path}" -m ${readMode}`

    // Input parameters from Song model
    if (song.isRb3con) command += ' -c true'
    if (song.proDrums !== undefined) command += ` -p ${booleanToString(song.proDrums)}`
    if (song.fiveLaneDrums !== undefined) command += ` -g ${booleanToString(song.fiveLaneDrums)}`
    if (song.sustainCutoffThreshold !== undefined) command += ` -s ${song.sustainCutoffThreshold.toString()}`
    if (song.multiplierNote !== undefined) command += ` -n ${song.multiplierNote.toString()}`

    // Other input params
    if (eighthNoteHopo !== undefined) command += ` -e ${booleanToString(eighthNoteHopo)}`
    if (hopoFreq !== undefined) command += ` -f ${hopoFreq.toString()}`

    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', { error: stderr, errorOrigin: 'YARGReplayValidatorAPI.returnReplayInfo()' })

    return this.camelCaseKeyTransform<YARGReplayValidatorResults>(JSON.parse(stdout))
  }
}

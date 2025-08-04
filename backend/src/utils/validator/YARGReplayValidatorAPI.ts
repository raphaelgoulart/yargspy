import { execAsync, pathLikeToFilePath, type BufferEncodingOrNull, type FilePathLikeTypes } from 'node-lib'
import { getValidatorPath } from '../path/getServerPaths'
import { ServerError } from '../../app.exports'

export interface ValidatorReturnSongHashObject {
  songChecksum: { hashBytes: string }
}

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

    const command = `"${validatorPath.fullname}" "${replayFile.path}" -m 3`
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
}

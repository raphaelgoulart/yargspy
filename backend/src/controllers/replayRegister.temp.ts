// import { TokenError } from "fast-jwt"
// import { ServerError } from "../app.exports"
// import { serverReply } from "../core.exports"
// import type { FastifyErrorHandlerFn } from "../lib.exports"
// import type { IReplayRegister } from "./replayRegister"

// export interface IReplayRegister {
//   decorators: {
//     user?: UserSchemaDocument
//   }
// }

// export interface IReplayRegisterFileFieldObj {
//   path: string
//   fieldname: string
//   filename: string
//   encoding: string
//   mimetype: string
// }

// #region Handler

// const replayRegisterHandler: FastifyHandlerFn<IReplayRegister> = async function (req, reply) {
//   const packageDir = packageDirPath()
//   const uniqueFileName = buildUniqueFilename()
//   let replayPath = packageDir.gotoFile(`public/temp/${uniqueFileName}.replay`) // files placed in temp folder; will be moved to proper folder if there's no error during validation
//   let midiPath = packageDir.gotoFile(`public/temp/${uniqueFileName}.mid`) // temp name; mids/charts should be named after their hash
//   let chartPath = packageDir.gotoFile(`public/temp/${uniqueFileName}.chart`) // temp name; mids/charts should be named after their hash
//   let songPath = midiPath
//   let iniPath = packageDir.gotoFile(`public/temp/${uniqueFileName}.ini`)
//   let dtaPath = packageDir.gotoFile(`public/temp/${uniqueFileName}.dta`)
//   const validatorPath = packageDir.gotoFile(Boolean(process.env.DEV) ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe')

//   let songHash: string

//   try {
//     const parts = req.parts({ limits: { parts: 5 } })
//     const fileFields = new Map<string, IReplayRegisterFileFieldObj>()
//     const bodyMap = new Map<string, any>()

//     // The file streams must have a handler so the streamed data can reach somewhere, otherwise the request will freeze here
//     for await (const part of parts) {
//       if (part.type === 'file') {
//         let fileStream = new ReadableStreamClone(part.file)
//         let filePath: FilePath
//         if (part.fieldname == 'replayFile' && part.filename.endsWith('.replay')) {
//           filePath = replayPath
//         } else if (part.fieldname == 'chartFile' && part.filename.endsWith('.mid')) {
//           // change midiPath so its named [SHA-1 filehash].mid
//           let hashStream = new ReadableStreamClone(part.file)
//           const hash: Buffer = await getHash(hashStream)
//           songHash = hash.toString('base64') // useful later
//           midiPath = packageDir.gotoFile(`public/chart/${hash.toString('hex')}.mid`)
//           //
//           filePath = midiPath
//           songPath = filePath
//         } else if (part.fieldname == 'chartFile' && part.filename.endsWith('.chart')) {
//           // change chartPath so its named [SHA-1 filehash].chart
//           let hashStream = new ReadableStreamClone(part.file)
//           const hash: Buffer = await getHash(hashStream)
//           songHash = hash.toString('base64') // useful later
//           chartPath = packageDir.gotoFile(`public/chart/${hash.toString('hex')}.chart`)
//           //
//           filePath = chartPath
//           songPath = filePath
//         } else if (part.fieldname == 'metadataFile' && part.filename.endsWith('.ini')) {
//           filePath = iniPath
//         } else if (part.fieldname == 'metadataFile' && part.filename.endsWith('.dta')) {
//           filePath = dtaPath
//         } else throw new ServerError('err_replay_unsupportedfile') // TODO: NEW ERROR

//         await pipeline(fileStream, await filePath.createWriteStream())

//         fileFields.set(part.fieldname, {
//           path: filePath.path,
//           fieldname: part.fieldname,
//           filename: part.filename,
//           encoding: part.encoding,
//           mimetype: part.mimetype,
//         })
//       } else {
//         bodyMap.set(part.fieldname, part.value)
//       }
//     }

//     // It must have a file
//     if (fileFields.size === 0) {
//       throw new ServerError('err_replay_nofileuploaded')
//     }

//     // ...and one of these files must be the replay file
//     if (!fileFields.has('replayFile')) {
//       throw new ServerError('err_replay_nofileuploaded')
//     }

//     // Checking file signatures
//     const replayMagic = (await replayPath.readOffset(0, 8)).toString()

//     if (replayMagic !== 'YARGPLAY' && replayMagic !== 'YAREPLAY') {
//       throw new ServerError('err_replay_invalid_magic')
//     }

//     // TODO: run validator to get replay song hash
//     // TODO: try to find song in database via hash
//     let songFound = false

//     if (!songFound) {
//       if (!fileFields.get('chartFile')) throw new ServerError('err_replay_missing_chart')

//       if (midiPath.exists) {
//         const midiMagic = (await midiPath.readOffset(0, 4)).toString()
//         if (midiMagic !== 'MThd') {
//           throw new ServerError('err_replay_invalid_midi_magic')
//         }
//       }

//       if (chartPath.exists) {
//         let chartMagicBytes = (await chartPath.readOffset(0, 9)).toString('hex')
//         // Excluding BOM from UTF-8 files
//         if (chartMagicBytes.toLowerCase().startsWith('efbbbf')) chartMagicBytes = Buffer.from(chartMagicBytes.substring(6), 'hex').toString()
//         if (chartMagicBytes !== '[Song]') {
//           throw new ServerError('err_replay_invalid_chart_magic')
//         }
//       }

//       // TODO: parse metadata for song/validator
//     }

//     const { stdout, stderr } = await execAsync(`./${validatorPath.fullname} "${replayPath.path}"${songPath ? ` "${songPath.path}"` : ''}`, { cwd: validatorPath.root, windowsHide: true })

//     // This is where the runtime errors from YARGReplayValidator must be taken
//     if (stderr) {
//       const errString = stderr.trim()
//       if (errString.endsWith('Missing MIDI path/parse settings.')) throw new ServerError('err_replay_missing_chart')
//       else if (errString.endsWith("REPLAY band score and simulated band score don't match.")) throw new ServerError('err_replay_invalid_chart')
//       throw new ServerError('err_unknown', { error: stderr })
//     }

//     const data = processReplayValidator<YARGReplayValidatorHashResults>(JSON.parse(stdout))

//     // TODO: check if replay checksum has been uploaded already; error out if so
//     // TODO: if !songFound, move mid/chart to correct folder and save song DB object
//     // TODO: else, delete temp mid/chart files if they exist
//     // TODO: move replay file to correct folder
//     // TODO: create band score object (don't save yet)
//     // TODO: create child score object (for each player), save to DB, add to band score object (childrenScores)
//     // TODO: save band score object to DB

//     if (iniPath.exists) await chartPath.delete()
//     if (dtaPath.exists) await chartPath.delete()

//     throw new ServerError('ok', data)

//     serverReply(reply, 'ok', data)
//   } catch (err) {
//     if (replayPath.exists) await replayPath.delete()
//     if (midiPath.exists) await midiPath.delete()
//     if (chartPath.exists) await chartPath.delete()
//     if (iniPath.exists) await chartPath.delete()
//     if (dtaPath.exists) await chartPath.delete()
//     throw err
//   }
// }

// // #region Error Handler

// const replayRegisterErrorHandler: FastifyErrorHandlerFn<IReplayRegister> = function (error, req, reply) {
//   // Generic ServerError
//   if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

//   // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
//   if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

//   // Unknown error
//   return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) }, { resolution: error.message })
// }

// const getHash = (rs: Readable) =>
//   new Promise<Buffer>((resolve, reject) => {
//     const hash = crypto.createHash('sha1')
//     rs.on('error', reject)
//     rs.on('data', (chunk) => hash.update(chunk))
//     rs.on('end', () => resolve(hash.digest()))
//   })

// #region Controller

// export const replayRegisterController = {
//   handler: replayRegisterHandler,
//   errorHandler: replayRegisterErrorHandler,
// } as const

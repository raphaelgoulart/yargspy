import type { FilePath } from 'node-lib'
import type { SongSchemaDocument } from '../../models/Song'
import { getServerPublic } from './getServerPaths'

export const getChartFilePathFromSongEntry = (songEntry: SongSchemaDocument): FilePath => getServerPublic().gotoFile(`chart/${songEntry.chartFileHash}${songEntry.isChart ? '.chart' : '.mid'}`)

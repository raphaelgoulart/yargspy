import type { FilePath } from 'node-lib'
import type { SongSchemaDocument } from '../../models/Song'
import { getServerFile } from './getServerPaths'

export const getChartFilePathFromSongEntry = (songEntry: SongSchemaDocument): FilePath => getServerFile().gotoFile(`chart/${songEntry.chartFileHash}${songEntry.isChart ? '.chart' : '.mid'}`)

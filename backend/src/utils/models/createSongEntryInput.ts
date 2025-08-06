import type { FilePath } from 'node-lib'
import type { SongSchemaInput } from '../../models/Song'
import { DTAParser } from '../../lib.exports'
import { parse as iniParser } from 'ini'
import { ServerError } from '../../app.exports'

export type INIBooleanStringValueTypes = 'true' | 'false' | '1' | '0'

export type INISongDataObject = {
  [key in 'song' | 'Song']?: {
    name: string
    artist: string
    charter?: string
    frets?: string
    album?: string
    year?: string
    pro_drums?: INIBooleanStringValueTypes
    pro_drum?: INIBooleanStringValueTypes
    five_lane_drums?: INIBooleanStringValueTypes
    sustain_cutoff_threshold?: string
    multiplier_note?: string
    star_power_note?: string
    hopo_frequency?: string
    eighthnote_hopo?: INIBooleanStringValueTypes
    hopofreq?: string
  }
}

export type SongEntryCreatorObject = SongSchemaInput & {
  hopoFreq?: number
  eighthNoteHopo: boolean
}

export const evalBooleanString = (text: INIBooleanStringValueTypes) => (text.toLowerCase().trim() === 'true' || text.toLowerCase().trim() === '1' ? true : false)
export const evalNumberString = (text: string) => Number(text)
export const booleanToString = (val: boolean) => (val ? 'true' : 'false')

export const createSongEntryInput = async (chartFilePath: FilePath, chartFileHash: string, songDataPath: FilePath) => {
  const newSongEntryMap = new Map<keyof SongEntryCreatorObject, any>()

  const isChart = chartFilePath.ext === '.chart'
  const isRb3con = !isChart && songDataPath.ext === '.dta'

  newSongEntryMap.set('hash', chartFileHash)
  newSongEntryMap.set('isChart', isChart)
  newSongEntryMap.set('isRb3con', isRb3con)

  if (isRb3con) {
    const parser = await DTAParser.fromFile(songDataPath)
    const { name, artist, author, album_name, year_released, hopo_threshold } = parser.songs[0]
    newSongEntryMap.set('name', name)
    newSongEntryMap.set('artist', artist)
    if (author) newSongEntryMap.set('charter', author)
    if (album_name) newSongEntryMap.set('album', album_name)
    newSongEntryMap.set('year', year_released)
    newSongEntryMap.set('proDrums', true)
    newSongEntryMap.set('fiveLaneDrums', false)
    newSongEntryMap.set('hopoFrequency', hopo_threshold ?? 170)
  } else {
    const ini = iniParser(await songDataPath.read('utf8')) as INISongDataObject

    if (!ini.song && !ini.Song) throw new ServerError('err_unknown', { error: `No Song/song attribute found while trying to parse INI file "${songDataPath.path}"` })

    const { artist, name, album, charter, eighthnote_hopo, five_lane_drums, frets, hopo_frequency, hopofreq, multiplier_note, pro_drum, pro_drums, star_power_note, sustain_cutoff_threshold, year } = ini.song ?? ini.Song!

    newSongEntryMap.set('name', name)
    newSongEntryMap.set('artist', artist)

    if (charter) newSongEntryMap.set('charter', charter)
    else if (frets) newSongEntryMap.set('charter', frets)

    newSongEntryMap.set('album', album ?? 'N/A')
    newSongEntryMap.set('year', year)

    if (pro_drums) newSongEntryMap.set('proDrums', evalBooleanString(pro_drums))
    else if (pro_drum) newSongEntryMap.set('proDrums', evalBooleanString(pro_drum))

    if (five_lane_drums) newSongEntryMap.set('fiveLaneDrums', evalBooleanString(five_lane_drums))

    if (sustain_cutoff_threshold) newSongEntryMap.set('sustainCutoffThreshold', evalNumberString(sustain_cutoff_threshold))

    if (multiplier_note) newSongEntryMap.set('multiplierNote', evalNumberString(multiplier_note))
    else if (star_power_note) newSongEntryMap.set('multiplierNote', evalNumberString(star_power_note))

    if (hopo_frequency) newSongEntryMap.set('hopoFrequency', evalNumberString(hopo_frequency))
    else if (eighthnote_hopo) newSongEntryMap.set('eighthNoteHopo', evalBooleanString(eighthnote_hopo))
    else if (hopofreq) newSongEntryMap.set('hopoFreq', evalNumberString(hopofreq))
  }

  return Object.fromEntries(newSongEntryMap.entries()) as SongEntryCreatorObject
}

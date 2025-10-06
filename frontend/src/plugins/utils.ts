import moment from "moment";
import api from "./axios";
import { GameMode, type IScore } from "./types";

export const convertedDateTime = (dateTime: string, small: boolean = false): string => {
  if (small) {
    const today = new Date();
    const targetDate = new Date(dateTime);

    const timeDifference = today.getTime() - targetDate.getTime();
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const daysDifference = timeDifference / millisecondsInADay;
    return Math.floor(daysDifference).toLocaleString() + 'd'
  }
  else return moment(dateTime).fromNow();
}

export const percent = (n: number): string => (Math.floor(n*10000)/100).toLocaleString() + "%"

export const getDownloadLink = (replay: string): string => `${api.defaults.baseURL}/file/replay/${replay}.replay`

export const getDownloadFileName = (entry: IScore, username: string): string => username + "-" + entry.song.name + "-" + entry.song.artist + "-" + entry.replayPath + ".replay"

// TODO: improve functions below
export function getInstrument(index: number) {
  switch(index) {
    case 0: return "Five-Fret Guitar";
    case 1: return "Five-Fret Bass";
    case 2: return "Five-Fret Rhythm";
    case 3: return "Five-Fret Coop Guitar";
    case 4: return "Keys";

    case 10: return "Six-Fret Guitar";
    case 11: return "Six-Fret Bass";
    case 12: return "Six-Fret Rhythm";
    case 13: return "Six-Fret Coop Guitar";

    case 20: return "Four-Lane Drums";
    case 21: return "Pro Drums";
    case 22: return "Five-Lane Drums";
    case 23: return "Elite Drums";

    case 30: return "Pro Guitar (17-fret)";
    case 31: return "Pro Guitar (22-fret)";
    case 32: return "Pro Bass (17-fret)";
    case 33: return "Pro Bass (22-fret)";
    case 34: return "Pro Keys";

    case 40: return "Vocals";
    case 41: return "Harmony";
    case 255: return "Band"
  }
  return "Unknown";
}
export function getDifficulty(index: number) {
  switch(index) {
    case 0: return "Beginner";
    case 1: return "Easy";
    case 2: return "Medium";
    case 3: return "Hard";
    case 4: return "Expert";
    case 5: return "Expert+";
  }
  return "Unknown";
}
export function getEngine(index: number) {
  switch(index) {
    case 0: return "Default";
    case 1: return "Casual";
    case 2: return "Precision";
  }
  return "Unknown";
}
export function getModifier(index: number) {
  switch(index) {
    case 0: return "All Strums";
    case 1: return "All HO/POs";
    case 2: return "All Taps";
    case 3: return "HO/POs to Taps";
    case 4: return "Taps to HO/POs";
    case 5: return "Note Shuffle";
    case 6: return "No Kicks";
    case 7: return "Unpitched Only";
    case 8: return "No Dynamics";
    case 9: return "No Vocal Percussion";
    case 10: return "Range Compress";
  }
  return "Unknown";
}
export function getVersion(index: number) {
  switch(index) {
    case 0: return "0.13.1";
  }
  return "Unknown";
}

export function isGuitar(gameMode: number) {
  return ([GameMode.FiveFretGuitar, GameMode.SixFretGuitar] as number[]).includes(gameMode)
}
export function isDrums(gameMode: number) {
  return ([GameMode.FiveLaneDrums, GameMode.FourLaneDrums] as number[]).includes(gameMode)
}
export function isKeys(gameMode: number) {
  return([GameMode.ProKeys] as number[]).includes(gameMode)
}
export function isProGuitar(gameMode: number) {
  return ([GameMode.ProGuitar] as number[]).includes(gameMode)
}

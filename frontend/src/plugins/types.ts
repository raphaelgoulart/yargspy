interface IResponse {
  code: string
  message: string
  statusCode: number
  statusFullName: string
  statusName: string
}

interface IEntriesResponse extends IResponse {
  limit: number
  page: number
  totalEntries: number
  totalPages: number
}

export interface ISong {
  _id: string
  album?: string
  artist: string
  charter: string
  name: string
  year?: string
}

export interface IUser {
  __v: number
  _id: string
  active: boolean
  admin: boolean
  createdAt: string
  updatedAt: string
  username: string
  profilePhotoURL?: string
  country: string
  email?: string
  emailVerified: boolean
}

export interface IScore {
  _id: string
  song: ISong
  uploader: string
  replayPath: string
  replayFileHash: string
  childrenScores: IScore[]
  version: number
  hidden: boolean
  instrument: number
  gamemode?: number
  difficulty?: number
  engine?: number
  modifiers: number[]
  songSpeed: number
  profileName: string
  score: number
  stars: number
  notesHit?: number
  maxCombo?: number
  starPowerPhrasesHit?: number
  starPowerActivationCount?: number
  soloBonuses?: number
  createdAt: string
  percent?: number
  overhits?: number
  ghostInputs?: number
  sustainScore?: number
  ghostNotesHit?: number
  accentNotesHit?: number
  __v: number
}

export interface IUserEntriesResponse extends IEntriesResponse {
  entries: IUser[]
}

export interface ILeaderboardEntriesResponse extends IEntriesResponse {
  entries: ISong[]
}

export interface IScoreEntriesResponse extends IEntriesResponse {
  entries: IScore[]
}

export const GameMode = {
  // Game modes are reserved in multiples of 5
  // 0-4: Guitar
  FiveFretGuitar: 0,
  SixFretGuitar: 1,

  // 5-9: Drums
  FourLaneDrums: 5,
  FiveLaneDrums: 6,
  // EliteDrums = 7,

  // 10-14: Pro instruments
  ProGuitar: 10,
  ProKeys: 11,

  // 15-19: Vocals
  Vocals: 15,

  // 20-24: Other
  // Dj = 20,
} as const

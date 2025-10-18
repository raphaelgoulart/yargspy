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
  availableInstruments?: [
    {
      difficulty: number
      instrument: number
      notes: number
      starPowerPhrases: number
    },
  ]
  playerCount: number
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
  bannerURL?: string
}

export interface IScore {
  _id: string
  song: ISong
  uploader: { username: string; country: string }
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

export interface IAdminLog {
  __v: number
  _id: string
  action: number
  admin: { _id: string; username: string }
  createdAt: string
  item: string
  reason?: string
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

export interface IAdminLogEntriesResponse extends IEntriesResponse {
  entries: IAdminLog[]
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

export const Difficulty = {
  Beginner: 0,
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Expert: 4,
  ExpertPlus: 5,
} as const

export const AdminAction = {
  UserBan: 0,
  UserUnban: 1,
  SongAdd: 2,
  SongUpdate: 3,
  SongDelete: 4,
  ScoreDelete: 5,
  UserUpdate: 6,
} as const

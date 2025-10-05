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

export interface IUserEntriesResponse extends IEntriesResponse {
  entries: IUser[]
}

export interface ILeaderboardEntriesResponse extends IEntriesResponse {
  entries: [
    {
      _id: string
      album: string
      artist: string
      charter: string
      name: string
      year: string
    },
  ]
}

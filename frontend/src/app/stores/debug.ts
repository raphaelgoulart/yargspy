import { create } from 'zustand'
import type { GenericServerResponseObject } from '../types'

export interface DebugGlobalStateProps {
  debugTabSelected: number
  username: string
  password: string
  lastRequest: (GenericServerResponseObject & { requestTime: number }) | null
  isRequesting: boolean
  hasUserToken: boolean
  isRequestingUserProfile: boolean
  replayFileSelected: File | null
  chartFileSelected: File | null
  songDataFileSelected: File | null
  hasSongDataOnReq: boolean
  // song leaderboard
  songId: string,
  instrument: number,
  difficulty: number,
  engine: number,
  allowedModifiers: Array<number>,
  allowSlowdowns: boolean,
  sortByNotesHit: boolean,
}

export interface DebugGlobalStateActions {
  setDebugGlobalState(state: Partial<DebugGlobalStateProps> | ((oldState: DebugGlobalStateProps) => Partial<DebugGlobalStateProps>)): void
  getDebugGlobalState(): DebugGlobalStateProps
  resetDebugGlobalState(): void
}

export type DebugGlobalStateHook = DebugGlobalStateProps & DebugGlobalStateActions

const DebugGlobalStateDefaultState: DebugGlobalStateProps = {
  debugTabSelected: 0,
  username: '',
  password: '',
  lastRequest: null,
  isRequesting: false,
  hasUserToken: false,
  isRequestingUserProfile: false,
  replayFileSelected: null,
  chartFileSelected: null,
  songDataFileSelected: null,
  hasSongDataOnReq: false,
  // song leaderboard
  songId: '',
  instrument: 255,
  difficulty: 4,
  engine: 0,
  allowedModifiers: [0, 4, 5, 8, 9, 10],
  allowSlowdowns: false,
  sortByNotesHit: false,
}

export const DebugGlobalState = create<DebugGlobalStateHook>()((set, get) => ({
  ...DebugGlobalStateDefaultState,
  setDebugGlobalState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  resetDebugGlobalState() {
    return set(() => ({ ...DebugGlobalStateDefaultState }))
  },
  getDebugGlobalState() {
    const state = get()
    const data = new Map()
    for (const key of Object.keys(state)) {
      if (typeof state[key as keyof typeof state] === 'function') continue
      else {
        data.set(key, state[key as keyof typeof state])
      }
    }

    return Object.fromEntries(data)
  },
}))

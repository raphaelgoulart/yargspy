import { create } from 'zustand'
import type { GenericServerResponseObject } from '../@types/app'

export interface UserLoginStateProps {
  username: string
  password: string
  lastRequest: GenericServerResponseObject | null
  isRequesting: boolean
}

export interface UserLoginStateActions {
  setUserLoginState(state: Partial<UserLoginStateProps> | ((oldState: UserLoginStateProps) => Partial<UserLoginStateProps>)): void
  getUserLoginState(): UserLoginStateProps
  resetUserLoginState(): void
}

export type UserLoginStateHook = UserLoginStateProps & UserLoginStateActions

const UserLoginStateDefaultState: UserLoginStateProps = {
  username: '',
  password: '',
  lastRequest: null,
  isRequesting: false,
}

export const UserLoginState = create<UserLoginStateHook>()((set, get) => ({
  ...UserLoginStateDefaultState,
  setUserLoginState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  resetUserLoginState() {
    return set(() => ({ ...UserLoginStateDefaultState }))
  },
  getUserLoginState() {
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

import { create } from 'zustand'

export interface AppGlobalStateProps {}

export interface AppGlobalStateActions {
  setAppGlobalState(state: Partial<AppGlobalStateProps> | ((oldState: AppGlobalStateProps) => Partial<AppGlobalStateProps>)): void
  getAppGlobalState(): AppGlobalStateProps
  resetAppGlobalState(): void
}

export type AppGlobalStateHook = AppGlobalStateProps & AppGlobalStateActions

const AppGlobalStateDefaultState: AppGlobalStateProps = {}

export const AppGlobalState = create<AppGlobalStateHook>()((set, get) => ({
  ...AppGlobalStateDefaultState,
  setAppGlobalState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  resetAppGlobalState() {
    return set(() => ({ ...AppGlobalStateDefaultState }))
  },
  getAppGlobalState() {
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

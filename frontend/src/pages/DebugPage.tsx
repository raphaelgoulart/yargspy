import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import DebugUserLogin from '../components/debug/DebugUserLogin'
import DebugUserRegister from '../components/debug/DebugUserRegister'
import { useCallback, useEffect } from 'react'
import { DebugGlobalState } from '../app/stores/debug'
import DebugUserProfile from '../components/debug/DebugUserProfile'
import axios, { AxiosError } from 'axios'
import type { GenericServerResponseObject } from '../app/types'
import DebugUploadReplayFile from '../components/debug/DebugUploadReplayFile'

const debugTabs = ['user_login', 'user_register', 'user_profile', 'upload_replay_file'] as const

export default function DebugPage() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const { t } = useTranslation()

  const debugPageEfx = useCallback(async () => {
    setDebugGlobalState({
      isRequesting: false,
      lastRequest: null,
      hasUserToken: Boolean(localStorage.getItem('userToken')),
      replayFileSelected: null,
    })

    if (debugTabSelected === 2 && hasUserToken) {
      setDebugGlobalState({
        isRequestingUserProfile: true,
        lastRequest: null,
      })

      const startTime = Date.now()
      try {
        const { data } = await axios.get<GenericServerResponseObject>(`${import.meta.env.VITE_SERVER_URI}/user/profile`, {
          responseType: 'json',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        })
        setDebugGlobalState({
          lastRequest: {
            ...data,
            requestTime: Date.now() - startTime,
          },
          isRequestingUserProfile: false,
        })
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.data) {
            setDebugGlobalState({ lastRequest: { ...err.response?.data, requestTime: Date.now() - startTime }, isRequestingUserProfile: false })
          } else {
            setDebugGlobalState({ lastRequest: { statusCode: 503, statusName: 'Service Unavailable', statusFullName: '503 Service Unavailable', code: 'err_service_unavailable', message: 'Server is down', requestTime: 0 } })
          }
        }

        setDebugGlobalState({ isRequestingUserProfile: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugTabSelected, setDebugGlobalState])

  useEffect(() => {
    debugPageEfx().then(() => {
      // Do nothing
    })
  }, [debugPageEfx])
  return (
    <>
      <main className="h-full w-full bg-neutral-950">
        <nav className="!sticky z-10 w-full !flex-row overflow-x-scroll border-b border-neutral-700 bg-neutral-900 drop-shadow-[0px_0px_36px_rgba(0,0,0)]">
          {debugTabs.map((tab, tabI) => {
            return (
              <button onClick={() => setDebugGlobalState({ debugTabSelected: tabI })} className={clsx('p-2 text-xs font-bold uppercase', debugTabSelected === tabI ? 'bg-white/15 hover:bg-white/25' : 'hover:bg-white/5')} key={`debugTab${tabI}`}>
                {t(tab)}
              </button>
            )
          })}
        </nav>

        {/* Components */}
        <div className="h-full w-full overflow-y-scroll px-5 pt-6">
          <div>
            <DebugUserLogin />
            <DebugUserRegister />
            <DebugUserProfile />
            <DebugUploadReplayFile />
          </div>
        </div>
      </main>
    </>
  )
}

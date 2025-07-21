import axios, { AxiosError } from 'axios'
import { AnimatedComponent, createAnimation, MotionDiv, MotionSection } from '../../lib.exports'
import { DebugGlobalState } from '../../app/stores/debug'
import type { DebugUserLoginResponseDecorators, GenericServerResponseObject } from '../../app/types'
import { VscLoading } from '../../assets/icons'
import clsx from 'clsx'
import BlockOfCode from '../BlockOfCode'
import { useTranslation } from 'react-i18next'

export default function DebugUserRegister() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const username = DebugGlobalState((x) => x.username)
  const password = DebugGlobalState((x) => x.password)
  const isRequesting = DebugGlobalState((x) => x.isRequesting)
  const lastRequest = DebugGlobalState((x) => x.lastRequest)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const isActivated = debugTabSelected === 1
  const { t } = useTranslation()
  return (
    <AnimatedComponent condition={isActivated}>
      <MotionSection {...createAnimation({ opacity: true })} className="!absolute w-full origin-top">
        <h1 className="mb-4 text-5xl">{t('user_register')}</h1>
        <form
          className="mb-2 border-b border-neutral-700 pb-2"
          onSubmit={async (ev) => {
            setDebugGlobalState({ isRequesting: true })
            ev.preventDefault()
            const loginBody = {
              username: username.length === 0 ? undefined : username,
              password: password.length === 0 ? undefined : password,
            } as const

            try {
              const { data } = await axios.post<GenericServerResponseObject>(`${import.meta.env.VITE_SERVER_URI}/user/register`, loginBody, { responseType: 'json' })

              setDebugGlobalState({ lastRequest: data, isRequesting: false })
            } catch (err) {
              if (err instanceof AxiosError) {
                if (err.response?.data) {
                  setDebugGlobalState({ lastRequest: err.response?.data, isRequesting: false })
                } else {
                  setDebugGlobalState({ lastRequest: { statusCode: 503, statusName: 'Service Unavailable', statusFullName: '503 Service Unavailable', code: 'err_service_unavailable', message: 'Server is down' } })
                }
              }

              setDebugGlobalState({ isRequesting: false })
            }
          }}
        >
          <h2 className="mb-1 text-xs font-bold uppercase">{t('username_short')}</h2>
          <input name="username" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={username} onChange={(ev) => setDebugGlobalState({ username: ev.target.value })} />
          <h2 className="mb-1 text-xs font-bold uppercase">{t('password')}</h2>
          <input name="password" type="password" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={password} onChange={(ev) => setDebugGlobalState({ password: ev.target.value })} />
          <button disabled={isRequesting} className="rounded-sm bg-cyan-700 py-2 uppercase hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-700">
            {t('register')}
          </button>
        </form>
        <h3 className="mb-2 text-xs font-bold uppercase">{t('last_response')}</h3>
        <div className="mb-2 border-b border-neutral-700 pb-2">
          <AnimatedComponent condition={isRequesting}>
            <MotionDiv {...createAnimation({ opacity: true })} className="!absolute z-20 h-full w-full items-center bg-black/90">
              <VscLoading className="mt-6 animate-spin text-3xl" />
            </MotionDiv>
          </AnimatedComponent>
          {(() => {
            const { code, message, statusCode, statusFullName, statusName, token }: DebugUserLoginResponseDecorators = lastRequest ?? { code: 'off', message: t('debug_make_first_req_message'), statusCode: 0, statusFullName: '000 Off', statusName: 'Off' }
            return (
              <>
                <div className={clsx('rounded-sm p-3', statusCode === 0 ? 'bg-neutral-700' : statusCode < 400 ? 'bg-green-900' : 'bg-red-900')}>
                  <h1 className="mb-2 rounded-sm bg-neutral-800 px-1 font-mono text-lg uppercase">{statusFullName}</h1>
                  <h2 className="mb-2">{message}.</h2>
                  <div className="mb-2 rounded-sm bg-neutral-800 p-3">
                    <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('res_json')}</h2>
                    <BlockOfCode code={JSON.stringify(lastRequest, null, 4)} className="text-xs" />
                  </div>

                  {token && (
                    <div className="relative rounded-sm bg-neutral-800 p-3">
                      <h2 className="text-sm font-bold uppercase">{t('received_token')}</h2>
                      <code className="font-mono text-xs font-bold break-all">{token}</code>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>

        <div className="min-h-6 w-full bg-transparent"></div>
      </MotionSection>
    </AnimatedComponent>
  )
}

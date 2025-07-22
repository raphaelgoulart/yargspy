import axios, { AxiosError } from 'axios'
import { DebugGlobalState } from '../../app/stores/debug'
import { AnimatedComponent, createAnimation, MotionDiv, MotionSection } from '../../lib.exports'
import type { DebugUserLoginResponseDecorators, GenericServerResponseObject } from '../../app/types'
import { VscLoading } from '../../assets/icons'
import clsx from 'clsx'
import BlockOfCode from '../BlockOfCode'
import { useTranslation } from 'react-i18next'

export default function DebugUserLogin() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const username = DebugGlobalState((x) => x.username)
  const password = DebugGlobalState((x) => x.password)
  const lastRequest = DebugGlobalState((x) => x.lastRequest) as DebugUserLoginResponseDecorators | null
  const isRequesting = DebugGlobalState((x) => x.isRequesting)
  const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const isActivated = debugTabSelected === 0
  const { t } = useTranslation()

  return (
    <AnimatedComponent condition={isActivated}>
      <MotionSection {...createAnimation({ opacity: true })} className="!absolute min-h-full w-full origin-top">
        <h1 className="mb-4 text-5xl">{t('login')}</h1>
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
              const { data } = await axios.post<
                GenericServerResponseObject & {
                  token: string
                }
              >(`${import.meta.env.VITE_SERVER_URI}/user/login`, loginBody, { responseType: 'json' })

              localStorage.setItem('userToken', data.token)
              setDebugGlobalState({ hasUserToken: true, lastRequest: data, isRequesting: false })
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
            {t('login')}
          </button>
        </form>
        <h3 className="mb-2 text-xs font-bold uppercase">{t('last_response')}</h3>
        <div className="mb-2 border-b border-neutral-700 pb-2">
          <AnimatedComponent condition={isRequesting}>
            <MotionDiv {...createAnimation({ opacity: true })} className="!absolute z-20 h-full w-full items-center justify-center bg-black/90">
              <VscLoading className="animate-spin" />
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
                    <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('req_details')}</h2>
                    <h3 className="text-xs font-bold uppercase">{t('url')}</h3>
                    <p className="mb-2">{`${import.meta.env.VITE_SERVER_URI}/user/login`}</p>
                    <h3 className="text-xs font-bold uppercase">{t('content_type')}</h3>
                    <p>{t('json')}</p>
                    <div className="h-3 w-full bg-transparent"></div>
                    <BlockOfCode
                      code={JSON.stringify(
                        {
                          username: username.length === 0 ? undefined : username,
                          password: password.length === 0 ? undefined : password,
                        },
                        null,
                        4
                      )}
                      className="text-xs"
                    />
                  </div>

                  <div className="mb-2 rounded-sm bg-neutral-800 p-3">
                    <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('res_json')}</h2>
                    <BlockOfCode code={JSON.stringify(lastRequest, null, 4)} className="text-xs" />
                  </div>
                  {token && (
                    <div className="rounded-sm bg-neutral-800 p-3">
                      <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('received_token')}</h2>
                      <code className="font-mono text-xs font-bold break-all">{token}</code>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase">{t('status')}</h3>
          {hasUserToken ? (
            <>
              <div className="!flex-row items-center">
                <p className="mr-auto uppercase">{t('logged')}</p>
                <button
                  onClick={async () => {
                    if (lastRequest?.token) await navigator.clipboard.writeText(lastRequest?.token)
                  }}
                  className="mr-1 rounded-xs bg-slate-700 px-2 py-1 text-xs font-bold uppercase duration-200 hover:bg-slate-600"
                >
                  {t('token_copy')}
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('userToken')
                    setDebugGlobalState({ hasUserToken: false })
                  }}
                  className="rounded-xs bg-red-700 px-2 py-1 text-xs font-bold uppercase duration-200 hover:bg-red-600"
                >
                  {t('token_delete')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="uppercase">{t('not_logged')}</p>
            </>
          )}
        </div>

        <div className="min-h-6 w-full bg-transparent"></div>
      </MotionSection>
    </AnimatedComponent>
  )
}

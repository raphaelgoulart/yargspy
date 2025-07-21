import axios, { AxiosError } from 'axios'
import { DebugGlobalState } from '../../app/stores/debug'
import { AnimatedComponent, createAnimation, MotionDiv, MotionSection } from '../../lib.exports'
import type { DebugUserLoginResponseDecorators, GenericServerResponseObject } from '../../@types/app'
import { VscLoading } from '../../assets/icons'
import clsx from 'clsx'
import BlockOfCode from '../BlockOfCode'


export default function DebugUserLogin() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const username = DebugGlobalState((x) => x.username)
  const password = DebugGlobalState((x) => x.password)
  const lastRequest = DebugGlobalState((x) => x.lastRequest) as DebugUserLoginResponseDecorators | null
  const isRequesting = DebugGlobalState((x) => x.isRequesting)
  const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const isActivated = debugTabSelected === 0

  return (
    <AnimatedComponent condition={isActivated}>
      <MotionSection {...createAnimation({ opacity: true })} className="!absolute origin-top w-full min-h-full">
        <h1 className="text-5xl mb-4">Login</h1>
        <form
          className="pb-2 mb-2 border-b border-neutral-700"
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
          <h2 className="text-xs font-bold mb-1">USERNAME</h2>
          <input name="username" className="bg-white/10 py-1 px-2 mb-2 rounded-xs" value={username} onChange={(ev) => setDebugGlobalState({ username: ev.target.value })} />
          <h2 className="text-xs font-bold mb-1">PASSWORD</h2>
          <input name="password" type="password" className="bg-white/10 py-1 px-2 mb-2 rounded-xs" value={password} onChange={(ev) => setDebugGlobalState({ password: ev.target.value })} />
          <button disabled={isRequesting} className="bg-cyan-700 hover:bg-cyan-600 py-2 rounded-sm disabled:bg-neutral-800 disabled:text-neutral-700">
            LOGIN
          </button>
        </form>
        <h3 className="mb-2 font-bold text-xs">LAST RESPONSE</h3>
        <div className="pb-2 border-b border-neutral-700 mb-2">
          <AnimatedComponent condition={isRequesting}>
            <MotionDiv {...createAnimation({ opacity: true })} className="!absolute z-20 bg-black/90 w-full h-full items-center justify-center">
              <VscLoading className="animate-spin" />
            </MotionDiv>
          </AnimatedComponent>

          {(() => {
            const { code, message, statusCode, statusFullName, statusName, token }: DebugUserLoginResponseDecorators = lastRequest ?? { code: 'off', message: 'Make your first request', statusCode: 0, statusFullName: '000 Off', statusName: 'Off' }
            return (
              <>
                <div className={clsx('p-3 rounded-sm', statusCode === 0 ? 'bg-neutral-700' : statusCode < 400 ? 'bg-green-900' : 'bg-red-900')}>
                  <h1 className="font-mono uppercase text-lg bg-neutral-800 px-1 mb-2 rounded-sm">{statusFullName}</h1>
                  <h2 className="mb-2">{message}.</h2>

                  <div className="bg-neutral-800 p-3 rounded-sm mb-2">
                    <h2 className="text-sm uppercase font-bold mr-auto mb-3">Response JSON</h2>
                    <BlockOfCode code={JSON.stringify(lastRequest, null, 4)} className="text-xs" />
                  </div>
                  {token && (
                    <div className="bg-neutral-800 p-3 rounded-sm">
                      <h2 className="text-sm uppercase font-bold mr-auto mb-3">Received Token</h2>
                      <code className="break-all font-mono font-bold text-xs">{token}</code>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
        <div>
          <h3 className="mb-2 font-bold text-xs">STATUS</h3>
          {hasUserToken ? (
            <>
              <div className="!flex-row items-center">
                <p className="mr-auto">LOGGED</p>
                <button
                  onClick={async () => {
                    if (lastRequest?.token) await navigator.clipboard.writeText(lastRequest?.token)
                  }}
                  className="bg-slate-700 hover:bg-slate-600 duration-200 px-2 py-1 rounded-xs text-xs font-bold mr-1"
                >
                  COPY TOKEN
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('userToken')
                    setDebugGlobalState({ hasUserToken: false })
                  }}
                  className="bg-red-700 hover:bg-red-600 duration-200 px-2 py-1 rounded-xs text-xs font-bold"
                >
                  DELETE TOKEN
                </button>
              </div>
            </>
          ) : (
            <>
              <p>NOT LOGGED</p>
            </>
          )}
        </div>

        <div className="min-h-6 w-full bg-transparent"></div>
      </MotionSection>
    </AnimatedComponent>
  )
}

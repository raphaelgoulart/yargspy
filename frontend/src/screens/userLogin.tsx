import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { UserLoginState } from './userLogin.store'
import type { GenericServerResponseObject } from '../@types/app'
import clsx from 'clsx'
import { VscLoading } from '../icons'

export function UserLoginScreen() {
  const username = UserLoginState((x) => x.username)
  const password = UserLoginState((x) => x.password)
  const lastRequest = UserLoginState((x) => x.lastRequest)
  const isRequesting = UserLoginState((x) => x.isRequesting)
  const setUserLoginState = UserLoginState((x) => x.setUserLoginState)
  const [userToken, setUserToken] = useState<string | null>(null)

  function resetFormState() {
    setUserLoginState({
      username: '',
      password: '',
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setUserToken(localStorage.getItem('userToken'))
  })
  return (
    <section className="h-full px-4 overflow-y-auto pb-16">
      <h1 className="text-5xl mb-4">Login</h1>
      <form
        onSubmit={async (ev) => {
          setUserLoginState({ isRequesting: true })
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
            >('http://localhost:5000/user/login', loginBody, { responseType: 'json' })

            localStorage.setItem('userToken', data.token)
            setUserLoginState({ lastRequest: data, isRequesting: false })
          } catch (err) {
            if (err instanceof AxiosError) {
              if (err.response?.data) {
                setUserLoginState({ lastRequest: err.response?.data, isRequesting: false })
              } else {
                setUserLoginState({ lastRequest: { statusCode: 503, statusName: 'Service Unavailable', code: '', message: 'Server is down' } })
              }
            }

            setUserLoginState({ isRequesting: false })
          }
        }}
      >
        <h2 className="text-xs font-bold mb-1">USERNAME</h2>
        <input name="username" className="bg-white/10 py-1 px-2 mb-2 rounded-xs" value={username} onChange={(ev) => setUserLoginState({ username: ev.target.value })} />
        <h2 className="text-xs font-bold mb-1">PASSWORD</h2>
        <input name="password" type="password" className="bg-white/10 py-1 px-2 mb-2 rounded-xs" value={password} onChange={(ev) => setUserLoginState({ password: ev.target.value })} />
        <button className="bg-cyan-700 hover:bg-cyan-600 py-2 rounded-sm">LOGIN</button>
      </form>
      <div className="h-[1px] bg-neutral-300 my-4"></div>
      <h3 className="mb-2">LAST RESPONSE</h3>
      {lastRequest !== null &&
        (() => {
          const { code, message, statusCode, statusName, token } = lastRequest as GenericServerResponseObject & {
            token?: string
          }

          return (
            <div className={clsx('p-3 rounded-sm', statusCode < 400 ? 'bg-green-900' : 'bg-red-900')}>
              <div className={clsx('!absolute bg-black w-full h-full -ml-3 -mt-3 items-center justify-center opacity-60', !isRequesting && 'z-[-1]')}>
                <VscLoading className="animate-spin" />
              </div>
              <h1 className="font-mono uppercase text-2xl bg-neutral-800 px-1 mb-2 rounded-sm">
                {statusCode} {statusName}
              </h1>
              <h2>{message}.</h2>

              {token && (
                <div className="relative z-0 mt-4 bg-neutral-800 p-3 rounded-sm">
                  <h2 className="text-sm uppercase font-bold mt-2">Received Token</h2>
                  <code className="break-all font-mono font-bold text-2xl">{token}</code>
                </div>
              )}
            </div>
          )
        })()}
      <div className="h-[1px] bg-neutral-300 my-4"></div>

      {userToken ? (
        <div className="p-2 bg-white/10">
          <h3 className="font-bold text-xs">USER TOKEN FOUND ON LOCAL STORAGE</h3>
          <code className="break-all">{userToken}</code>
          <div className="!flex-row border-t mt-1">
            <p className="mr-auto">It means you're logged in!</p>
            <button
              onClick={() => {
                localStorage.removeItem('userToken')
                setUserToken(null)
              }}
              className="font-bold text-xs p-1 bg-red-500 hover:bg-red-400"
            >
              DELETE
            </button>
          </div>
        </div>
      ) : (
        <>No user token found on local storage</>
      )}
    </section>
  )
}

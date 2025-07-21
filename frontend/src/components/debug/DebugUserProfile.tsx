import { DebugGlobalState } from '../../app/stores/debug'
import { AnimatedComponent, createAnimation, MotionDiv, MotionSection } from '../../lib.exports'
import type { DebugUserProfileResponseDecorators, GenericServerResponseObject } from '../../@types/app'
import { VscLoading } from '../../assets/icons'
import clsx from 'clsx'
import BlockOfCode from '../BlockOfCode'

export default function DebugUserProfile() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const lastRequest = DebugGlobalState((x) => x.lastRequest) as DebugUserProfileResponseDecorators | null
  const isRequestingUserProfile = DebugGlobalState((x) => x.isRequestingUserProfile)
  const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const isActivated = debugTabSelected === 2

  return (
    <AnimatedComponent condition={isActivated}>
      <MotionSection {...createAnimation({ opacity: true })} className="!absolute origin-top w-full">
        <h1 className="text-5xl mb-4">User Profile</h1>
        <h3 className="mb-2 font-bold text-xs">LAST RESPONSE</h3>
        <div className="pb-2 border-b border-neutral-700 mb-2">
          <AnimatedComponent condition={isRequestingUserProfile}>
            <MotionDiv {...createAnimation({ opacity: true })} className="!absolute z-20 bg-black/90 w-full h-full items-center">
              <VscLoading className="animate-spin mt-6 text-3xl" />
            </MotionDiv>
          </AnimatedComponent>
          {(() => {
            const { code, message, statusCode, statusFullName, statusName }: GenericServerResponseObject = lastRequest ?? { code: 'off', message: 'Make your first request', statusCode: 0, statusFullName: '000 Off', statusName: 'Off' }
            return (
              <>
                <div className={clsx('p-3 rounded-sm', statusCode === 0 ? 'bg-neutral-700' : statusCode < 400 ? 'bg-green-900' : 'bg-red-900')}>
                  <h1 className="font-mono uppercase text-lg bg-neutral-800 px-1 mb-2 rounded-sm">{statusFullName}</h1>
                  <h2 className="mb-2">{message}.</h2>
                  <div className="bg-neutral-800 p-3 rounded-sm mb-2">
                    <h2 className="text-sm uppercase font-bold mr-auto mb-3">Response JSON</h2>
                    <BlockOfCode code={JSON.stringify(lastRequest, null, 4)} className="text-xs" />
                  </div>
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
                    if (hasUserToken) await navigator.clipboard.writeText(localStorage.getItem('userToken')!)
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
              <p>NOT LOGGED: You must be logged to retrieve your user profile data</p>
            </>
          )}
          {hasUserToken &&
            lastRequest?.user &&
            (() => {
              const { _id, active, admin, createdAt, updatedAt, username } = lastRequest.user
              const cAT = new Date(createdAt)
              const uAT = new Date(updatedAt)
              return (
                <div className="pt-2 mt-2 border-t border-neutral-700">
                  <h2 className="text-xs font-bold mb-1">USERNAME</h2>
                  <p className="mb-2">{username}</p>
                  <h2 className="text-xs font-bold mb-1">IS ACTIVE?</h2>
                  <p className="mb-2">{String(active)}</p>
                  <h2 className="text-xs font-bold mb-1">IS ADMIN?</h2>
                  <p className="mb-2">{String(admin)}</p>
                  <h2 className="text-xs font-bold mb-1">CREATED AT</h2>
                  <p className="mb-2">
                    {cAT.toLocaleDateString()} {cAT.toLocaleTimeString()}
                  </p>
                  <h2 className="text-xs font-bold mb-1">UPDATED AT</h2>
                  <p className="mb-2">
                    {uAT.toLocaleDateString()} {uAT.toLocaleTimeString()}
                  </p>
                </div>
              )
            })()}
        </div>
        <div className="min-h-6 w-full bg-transparent"></div>
      </MotionSection>
    </AnimatedComponent>
  )
}

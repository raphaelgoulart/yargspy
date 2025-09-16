import clsx from 'clsx'
import { useTranslation } from "react-i18next"
import { DebugGlobalState } from "../../app/stores/debug"
import { AnimatedComponent, createAnimation, formatReqDuration, MotionDiv, MotionSection } from '../../lib.exports'
import type { DebugUserProfileResponseDecorators, GenericServerResponseObject } from "../../app/types"
import CheckBox from '../CheckBox'
import { VscLoading } from '../../assets/icons'
import BlockOfCode from '../BlockOfCode'
import axios, { AxiosError } from 'axios'

function stringToNumberArray(str: string): number[] {
    const result = []
    const split = str.split(",")
    for (const item in split) {
        result.push(Number(split[item]))
    }
    return result
}

export default function DebugSongLeaderboard() {
    const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
    const lastRequest = DebugGlobalState((x) => x.lastRequest) as DebugUserProfileResponseDecorators | null
    const isRequesting = DebugGlobalState((x) => x.isRequesting)
    const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
    // fields
    const songId = DebugGlobalState((x) => x.songId)
    const instrument = DebugGlobalState((x) => x.instrument)
    const difficulty = DebugGlobalState((x) => x.difficulty)
    const engine = DebugGlobalState((x) => x.engine)
    const allowedModifiers = DebugGlobalState((x) => x.allowedModifiers)
    const allowSlowdowns = DebugGlobalState((x) => x.allowSlowdowns)
    const sortByNotesHit = DebugGlobalState((x) => x.sortByNotesHit)
    //
    const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
    const isActivated = debugTabSelected === 3
    
    const { t } = useTranslation()
    
    return (
        <AnimatedComponent condition={isActivated}>
        <MotionSection {...createAnimation({ opacity: true })} className="!absolute w-full origin-top">
        <h1 className="mb-4 text-5xl">{t('song_leaderboard')}</h1>
        
        <form
        className="mb-2 border-b border-neutral-700 pb-2"
        onSubmit={async (ev) => {
            setDebugGlobalState({ isRequesting: true })
            ev.preventDefault()
            const body = {
              id: songId,
              instrument: instrument,
              difficulty: difficulty,
              engine: engine,
              allowedModifiers: allowedModifiers,
              allowSlowdowns: allowSlowdowns,
              sortByNotesHit: sortByNotesHit
            } as const
            const startTime = Date.now()
            try {
              const { data } = await axios.post<
                GenericServerResponseObject & {
                  token: string
                }
              >(`${import.meta.env.VITE_SERVER_URI}/song/leaderboard`, body, { responseType: 'json' })
                setDebugGlobalState({
                    hasUserToken: true,
                    lastRequest: {
                    ...data,
                    requestTime: Date.now() - startTime,
                    },
                    isRequesting: false,
                })
            } catch (err) {
              if (err instanceof AxiosError) {
                if (err.response?.data) {
                  setDebugGlobalState({
                    lastRequest: {
                      ...err.response?.data,
                      requestTime: Date.now() - startTime,
                    },
                    isRequesting: false,
                  })
                } else {
                  setDebugGlobalState({ lastRequest: { statusCode: 503, statusName: 'Service Unavailable', statusFullName: '503 Service Unavailable', code: 'err_service_unavailable', message: 'Server is down', requestTime: Date.now() - startTime } })
                }
              }

              setDebugGlobalState({ isRequesting: false })
        }}}
        >
        <h2 className="mb-1 text-xs font-bold uppercase">{t('songId')}</h2>
        <input name="songId" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={songId} onChange={(ev) => setDebugGlobalState({ songId: ev.target.value })} />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('instrument')}</h2>
        <input name="instrument" type="number" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={instrument} onChange={(ev) => setDebugGlobalState({ instrument: Number(ev.target.value) })} />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('difficulty')}</h2>
        <input name="difficulty" type="number" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={difficulty} onChange={(ev) => setDebugGlobalState({ difficulty: Number(ev.target.value) })} />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('engine')}</h2>
        <input name="engine" type="number" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={engine} onChange={(ev) => setDebugGlobalState({ engine: Number(ev.target.value) })} />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('allowedModifiers')}</h2>
        <input name="allowedModifiers" className="mb-2 rounded-xs bg-white/10 px-2 py-1" value={allowedModifiers.join(",")} onChange={(ev) => setDebugGlobalState({ allowedModifiers: stringToNumberArray(ev.target.value) })} />
        <div className="mb-2 w-full !flex-row items-center">
        <CheckBox
        condition={allowSlowdowns}
        type="button"
        className="mr-2 disabled:!cursor-default disabled:text-neutral-800"
        onClick={() => {
            setDebugGlobalState({ allowSlowdowns: !allowSlowdowns })
        }}
        disabled={!hasUserToken}
        />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('allowSlowdowns')}</h2>
        </div>
        <div className="mb-2 w-full !flex-row items-center">
        <CheckBox
        condition={sortByNotesHit}
        type="button"
        className="mr-2 disabled:!cursor-default disabled:text-neutral-800"
        onClick={() => {
            setDebugGlobalState({ sortByNotesHit: !sortByNotesHit })
        }}
        disabled={!hasUserToken}
        />
        <h2 className="mb-1 text-xs font-bold uppercase">{t('sortByNotesHit')}</h2>
        </div>
        <button disabled={isRequesting} className="rounded-sm bg-cyan-700 py-2 uppercase hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-700">
        Upload
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
            const { code, message, statusCode, statusFullName, statusName, requestTime }: GenericServerResponseObject = lastRequest ?? { code: 'off', message: t('debug_make_first_req_message'), statusCode: 0, statusFullName: '000 Off', statusName: 'Off', requestTime: 0 }
            return (
                <>
                <div className={clsx('rounded-sm p-3', statusCode === 0 ? 'bg-neutral-700' : statusCode < 400 ? 'bg-green-900' : 'bg-red-900')}>
                <div className="mb-2 !flex-row items-center rounded-sm bg-neutral-800 px-1 font-mono text-lg">
                <h1 className="mr-auto uppercase">{statusFullName}</h1>
                {requestTime > 0 && <h2 className="text-xs">{formatReqDuration(requestTime)}</h2>}
                </div>
                <h2 className="mb-2">{message}.</h2>
                
                <div className="mb-2 rounded-sm bg-neutral-800 p-3">
                <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('req_details')}</h2>
                <h3 className="text-xs font-bold uppercase">{t('url')}</h3>
                <p className="mb-2">{`${import.meta.env.VITE_SERVER_URI}/song/leaderboard`}</p>
                <h3 className="text-xs font-bold uppercase">{t('content_type')}</h3>
                <p className="mb-2">{t('json')}</p>
                <h3 className="text-xs font-bold uppercase">{t('header_auth_message')}</h3>
                </div>
                <div className="mb-2 rounded-sm bg-neutral-800 p-3">
                <h2 className="mr-auto mb-3 text-sm font-bold uppercase">{t('res_json')}</h2>
                <BlockOfCode code={JSON.stringify(lastRequest, null, 4)} className="text-xs" />
                </div>
                </div>
                </>
            )
        })()}
        </div>
        <div>
        <h3 className="mb-2 text-xs font-bold">{t('status')}</h3>
        {hasUserToken ? (
            <>
            <div className="!flex-row items-center">
            <p className="mr-auto uppercase">{t('logged')}</p>
            <button
            onClick={async () => {
                if (hasUserToken) await navigator.clipboard.writeText(localStorage.getItem('userToken')!)
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
            <p>{`${t('not_logged').toUpperCase()}: ${t('debug_not_logged_message')}`}</p>
            </>
        )}
        {hasUserToken &&
            lastRequest?.user &&
            (() => {
                const { _id, active, admin, createdAt, updatedAt, username } = lastRequest.user
                const cAT = new Date(createdAt)
                const uAT = new Date(updatedAt)
                return (
                    <div className="mt-2 border-t border-neutral-700 pt-2">
                    <h2 className="mb-1 text-xs font-bold uppercase">{t('username_short')}</h2>
                    <p className="mb-2">{username}</p>
                    <h2 className="mb-1 text-xs font-bold uppercase">{t('debug_is_user_active')}</h2>
                    <p className="mb-2">{String(active)}</p>
                    <h2 className="mb-1 text-xs font-bold uppercase">{t('debug_is_user_admin')}</h2>
                    <p className="mb-2">{String(admin)}</p>
                    <h2 className="mb-1 text-xs font-bold uppercase">{t('created_at')}</h2>
                    <p className="mb-2">
                    {cAT.toLocaleDateString()} {cAT.toLocaleTimeString()}
                    </p>
                    <h2 className="mb-1 text-xs font-bold uppercase">{t('updated_at')}</h2>
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
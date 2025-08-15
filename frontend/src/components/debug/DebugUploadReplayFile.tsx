import clsx from 'clsx'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DebugGlobalState } from '../../app/stores/debug'
import { AnimatedComponent, createAnimation, formatReqDuration, MotionDiv, MotionSection } from '../../lib.exports'
import type { DebugUserProfileResponseDecorators, GenericServerResponseObject } from '../../app/types'
import { VscLoading } from '../../assets/icons'
import BlockOfCode from '../BlockOfCode'
import axios, { AxiosError } from 'axios'
import CheckBox from '../CheckBox'

export default function DebugUploadReplayFile() {
  const debugTabSelected = DebugGlobalState((x) => x.debugTabSelected)
  const lastRequest = DebugGlobalState((x) => x.lastRequest) as DebugUserProfileResponseDecorators | null
  const isRequesting = DebugGlobalState((x) => x.isRequesting)
  const hasUserToken = DebugGlobalState((x) => x.hasUserToken)
  const replayFileSelected = DebugGlobalState((x) => x.replayFileSelected)
  const chartFileSelected = DebugGlobalState((x) => x.chartFileSelected)
  const songDataFileSelected = DebugGlobalState((x) => x.songDataFileSelected)
  const hasSongDataOnReq = DebugGlobalState((x) => x.hasSongDataOnReq)
  const setDebugGlobalState = DebugGlobalState((x) => x.setDebugGlobalState)
  const isActivated = debugTabSelected === 3

  const replayInputRef = useRef<HTMLInputElement>(null)
  const chartInputRef = useRef<HTMLInputElement>(null)
  const songDataInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  return (
    <AnimatedComponent condition={isActivated}>
      <MotionSection {...createAnimation({ opacity: true })} className="!absolute w-full origin-top">
        <h1 className="mb-4 text-5xl">{t('upload_replay_file')}</h1>
        <form
          encType="multipart/form-data"
          className="mb-2 border-b border-neutral-700 pb-2"
          onSubmit={async (ev) => {
            ev.preventDefault()
            setDebugGlobalState({ isRequesting: true })
            const form = new FormData()
            form.append('replayFile', replayInputRef.current!.files![0])
            if (hasSongDataOnReq) {
              form.append('chartFile', chartInputRef.current!.files![0])
              form.append('songDataFile', songDataInputRef.current!.files![0])
            }
            form.append('reqType', hasSongDataOnReq ? 'complete' : 'replayOnly')

            const startTime = Date.now()
            try {
              const { data } = await axios.post<GenericServerResponseObject>(`${import.meta.env.VITE_SERVER_URI}/replay/register`, form, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('userToken')}` }, timeout: 25 * 1000 })
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
                  setDebugGlobalState({ lastRequest: { ...err.response?.data, requestTime: Date.now() - startTime }, isRequesting: false })
                } else {
                  setDebugGlobalState({ lastRequest: { statusCode: 503, statusName: 'Service Unavailable', statusFullName: '503 Service Unavailable', code: 'err_service_unavailable', message: 'Server is down', requestTime: Date.now() - startTime } })
                }
              }

              setDebugGlobalState({ isRequesting: false })
            }
          }}
        >
          <div className="mb-2 w-full !flex-row items-center">
            <h2 className="mr-auto text-xs font-bold uppercase">Replay File</h2>
            <button type="button" disabled={!hasUserToken} className="w-fit rounded-sm bg-cyan-700 px-2 py-0.5 text-xs font-bold uppercase hover:bg-cyan-600 disabled:!cursor-default disabled:bg-neutral-800 disabled:text-neutral-700" onClick={() => replayInputRef.current!.click()}>
              Select REPLAY file
            </button>
          </div>
          {replayFileSelected ? <p className="mb-4">Selected File: {replayFileSelected.name}</p> : <p className="mb-4">No REPLAY file selected</p>}
          <input
            type="file"
            name="replayFile"
            accept=".replay"
            ref={replayInputRef}
            hidden
            onChange={(ev) => {
              if (ev.target.files?.[0]) setDebugGlobalState({ replayFileSelected: ev.target.files[0] })
            }}
          />
          <div className="mb-2 w-full !flex-row items-center">
            <CheckBox
              condition={hasSongDataOnReq}
              type="button"
              className="mr-2 disabled:!cursor-default disabled:text-neutral-800"
              onClick={() => {
                if (!hasSongDataOnReq) setDebugGlobalState({ hasSongDataOnReq: true, chartFileSelected: null, songDataFileSelected: null })
                else setDebugGlobalState({ hasSongDataOnReq: false, chartFileSelected: null, songDataFileSelected: null })
              }}
              disabled={!hasUserToken}
            />
            <h2 className="mr-auto text-xs font-bold uppercase">Includes Song Data</h2>
          </div>

          <div className="mb-4 !flex-row items-center">
            <input
              type="file"
              name="chartFile"
              accept=".chart,.mid"
              ref={chartInputRef}
              hidden
              onChange={(ev) => {
                if (ev.target.files?.[0]) setDebugGlobalState({ chartFileSelected: ev.target.files[0] })
              }}
            />
            <input
              type="file"
              name="songData"
              accept=".dta,.ini"
              ref={songDataInputRef}
              hidden
              onChange={(ev) => {
                if (ev.target.files?.[0]) setDebugGlobalState({ songDataFileSelected: ev.target.files[0] })
              }}
            />
            <div className={clsx('mr-2 h-full w-1/2 items-center rounded-sm border p-4', !hasUserToken || (!hasSongDataOnReq && '!border-neutral-800'))}>
              <button type="button" disabled={!hasUserToken || !hasSongDataOnReq} className="mb-2 max-h-36 w-full rounded-sm bg-cyan-700 px-2 py-0.5 text-xs font-bold uppercase hover:bg-cyan-600 disabled:!cursor-default disabled:!bg-neutral-800 disabled:!text-neutral-700" onClick={() => chartInputRef.current!.click()}>
                Select CHART/MIDI file
              </button>
              <p className={clsx(!hasUserToken || (!hasSongDataOnReq && '!text-neutral-800'))}>{chartFileSelected ? <>Selected File: {chartFileSelected.name}</> : <>No CHART/MIDI file selected</>}</p>
            </div>

            <div className={clsx('h- w-1/2 items-center rounded-sm border p-4', !hasUserToken || (!hasSongDataOnReq && '!border-neutral-800'))}>
              <button type="button" disabled={!hasUserToken || !hasSongDataOnReq} className="mb-2 max-h-36 w-full rounded-sm bg-cyan-700 px-2 py-0.5 text-xs font-bold uppercase hover:bg-cyan-600 disabled:!cursor-default disabled:!bg-neutral-800 disabled:!text-neutral-700" onClick={() => songDataInputRef.current!.click()}>
                Select song data file
              </button>
              <p className={clsx(!hasUserToken || (!hasSongDataOnReq && '!text-neutral-800'))}>{songDataFileSelected ? <>Selected File: {songDataFileSelected.name}</> : <>No song data file selected</>}</p>
            </div>
          </div>
          <button disabled={!hasUserToken || isRequesting || !replayFileSelected || (hasSongDataOnReq && (!chartFileSelected || !songDataFileSelected))} className="!disabled:cursor-default rounded-sm bg-cyan-700 py-2 uppercase hover:bg-cyan-600 disabled:!cursor-default disabled:bg-neutral-800 disabled:text-neutral-700">
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
                    <p className="mb-2">{`${import.meta.env.VITE_SERVER_URI}/user/replay/register`}</p>
                    <h3 className="text-xs font-bold uppercase">{t('content_type')}</h3>
                    <p className="mb-2">{t('formdata')}</p>
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

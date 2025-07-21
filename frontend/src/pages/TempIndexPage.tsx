import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedComponent, createAnimation, MotionDiv } from '../lib.exports'

export default function TempIndexPage() {
  const [showMessage1, setShowMessage1] = useState(false)
  useEffect(() => {
    if (showMessage1) {
      setTimeout(() => {
        setShowMessage1(false)
      }, 3000)
    }
  }, [showMessage1])
  return (
    <div className="h-full w-full items-center justify-center">
      <h1 className="mb-4 text-5xl font-bold">YARGLB</h1>
      <h2>THERE WILL BE AN ACTUAL WEBSITE HERE!!!</h2>
      <p className="mb-6">
        Right now the only thing that works is the{' '}
        <Link className="text-amber-500 underline-offset-2 hover:underline" to="debug">
          Debug
        </Link>{' '}
        page.
      </p>
      <h3 className="mb-2 text-xs font-bold">UTILITIES</h3>
      <button
        className="rounded-xs bg-amber-600 p-2 text-sm font-bold text-neutral-900 duration-100 hover:bg-amber-500"
        onClick={() => {
          localStorage.clear()
          setShowMessage1(true)
        }}
      >
        CLEAN LOCAL STORAGE
      </button>
      <AnimatedComponent condition={showMessage1}>
        <MotionDiv {...createAnimation({ height: true, scaleY: true, opacity: true })}>
          <div className="h-3 w-full"></div>
          <p>Local storage has been cleaned</p>
        </MotionDiv>
      </AnimatedComponent>
    </div>
  )
}

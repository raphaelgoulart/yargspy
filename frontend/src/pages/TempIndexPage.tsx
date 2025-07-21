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
    <div className="w-full h-full items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">YARGLB</h1>
      <h2>THERE WILL BE AN ACTUAL WEBSITE HERE!!!</h2>
      <p className="mb-6">
        Right now the only thing that works is the{' '}
        <Link className="text-amber-500 hover:underline underline-offset-2" to="debug">
          Debug
        </Link>{' '}
        page.
      </p>
      <h3 className="mb-2 text-xs font-bold">UTILITIES</h3>
      <button
        className="bg-amber-600 text-sm font-bold rounded-xs p-2 text-neutral-900 hover:bg-amber-500 duration-100"
        onClick={() => {
          localStorage.clear()
          setShowMessage1(true)
        }}
      >
        CLEAN LOCAL STORAGE
      </button>
      <AnimatedComponent condition={showMessage1}>
        <MotionDiv {...createAnimation({ height: true, scaleY: true, opacity: true })}>
        <div className='w-full h-3'></div>
          <p>Local storage has been cleaned</p>
        </MotionDiv>
      </AnimatedComponent>
    </div>
  )
}

import { Route } from 'react-router-dom'
import { createRouter } from '../lib.exports'
import TempIndexPage from '../pages/TempIndexPage'
import DebugPage from '../pages/DebugPage'

export default function AppRouter() {
  return createRouter(
    <>
      <Route path="/" element={<TempIndexPage />} />
      <Route path="/debug" element={<DebugPage />} />
    </>
  )
}

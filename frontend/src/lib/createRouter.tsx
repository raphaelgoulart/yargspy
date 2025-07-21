import type { ReactNode } from 'react'
import { createHashRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

export const createRouter = (router: ReactNode) => {
  return <RouterProvider router={createHashRouter(createRoutesFromElements(router))} />
}

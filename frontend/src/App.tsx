// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useState } from 'react'
import clsx from 'clsx'
import axios from 'axios'
import { UserLoginScreen } from './screens/userLogin'

const tables = [
  {
    name: 'Login',
  },
  {
    name: 'User Register',
  },
  {
    name: 'User Profile',
  },
] as const

function App() {
  const [selectedMain, setSelectedMain] = useState(0)
  return (
    <>
      <section className="!flex-row w-full overflow-x-visible">
        {tables.map((table, tableI) => {
          return (
            <button onClick={() => setSelectedMain(tableI)} key={`${table.name.toLowerCase().replace(/\s+/g, '')}`} className={clsx('mb-2 px-2 py-2 uppercase ', selectedMain === tableI ? 'bg-white/20 hover:bg-white/25' : 'hover:bg-white/5')}>
              {table.name}
            </button>
          )
        })}
      </section>
      {selectedMain === 0 && <UserLoginScreen />}
    </>
  )
}

export default App

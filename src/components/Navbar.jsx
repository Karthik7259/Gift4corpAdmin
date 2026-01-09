import React from 'react'
import {assets} from '../assets/assets'

const Navbar = ({setToken}) => {
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <div className='navbar glass-interactive'>
      <div className='flex items-center gap-3'>
        <img className='w-12 h-12 object-contain rounded-lg' src={assets.logo} alt="Gift4Corp" />
        <div>
          <p className='font-semibold text-white text-sm sm:text-base'>Gift4Corp Admin</p>
          <p className='text-xs text-gray-300'>Liquid Glass Console</p>
        </div>
      </div>
      <div className='flex items-center gap-2 sm:gap-3'>
        <div className='pill-small'>
          <span className='dot bg-green-400' />
          <span className='hidden sm:inline'>Online</span>
        </div>
        <button onClick={handleLogout} className='btn btn-secondary px-4 py-2 text-sm'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar

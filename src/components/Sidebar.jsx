import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  const links = [
    { to: '/', label: 'Dashboard', glyph: '⌂' },
    { to: '/add', label: 'Add Items', image: assets.add_icon },
    { to: '/list', label: 'Products', image: assets.order_icon },
    { to: '/orders', label: 'Orders', image: assets.parcel_icon },
    { to: '/categories', label: 'Categories', glyph: 'C' },
    { to: '/merchandise', label: 'Merchandise', glyph: 'M' },
    { to: '/settings', label: 'Settings', glyph: '⚙' },
  ]

  return (
    <div className='flex flex-col gap-6'>
      <div className='nav-logo'>
        <img src={assets.logo} alt="Gift4Corp" />
        <div>
          <p className='nav-title'>Gift4Corp Admin</p>
          <p className='text-xs text-gray-300'>Liquid Glass Dashboard</p>
        </div>
      </div>

      <div className='nav-links'>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className='w-10 h-10 glass-elevated flex items-center justify-center text-sm font-semibold'>
              {link.image ? <img src={link.image} alt="" className='w-5 h-5 object-contain' /> : link.glyph}
            </div>
            <span className='font-medium'>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar

import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Login from './components/Login'
import ManageCategories from './pages/ManageCategories'
import ManageMerchandise from './pages/ManageMerchandise'
import Settings from './pages/Settings'
import { ToastContainer } from 'react-toastify';

export const backendURL = import.meta.env.VITE_BACKEND_URL
export const currency="₹"   
const App = () => {

const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "");

useEffect(() => {
 localStorage.setItem('token', token);
}, [token]);



  return (
    <div className='app-bg'>
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <ToastContainer theme="dark" position="top-right" />

      {token === "" ? (
        <Login setToken={setToken}/>
      ) : (
        <div className='app-grid'>
          <div className='sidebar glass-panel'>
            <Sidebar />
          </div>
          <div className='main-column'>
            <Navbar setToken={setToken}/>
            <div className='content-surface scroll-area'>
              <Routes>
                <Route path='/' element={ <Dashboard token={token} /> } />
                <Route path='/add' element={ <Add token={token} /> } />
                <Route path='/list' element={ <List token={token} /> } />
                <Route path='/orders' element={ <Orders token={token} /> } />
                <Route path='/orders/:orderId' element={ <OrderDetails token={token} /> } />
                <Route path='/categories' element={ <ManageCategories token={token} /> } />
                <Route path='/merchandise' element={ <ManageMerchandise token={token} /> } />
                <Route path='/settings' element={ <Settings token={token} /> } />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

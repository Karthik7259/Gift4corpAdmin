import React, { useState } from 'react'
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
const Login = ({setToken}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

const onSubmitHandler =async (e)=>{
    try{
     e.preventDefault();
     const res=await axios.post(backendURL+'/api/user/admin', { email, password })

     if(res.data.success){
        setToken(res.data.token)
     }else{
        toast.error(res.data.message)
     }
    }catch(err){
        console.log(err);
        toast.error('Something went wrong. Please try again later.')
    }
}



  return (
    <div className='login-shell'>
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <div className='login-panel glass-card'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-12 h-12 glass-elevated flex items-center justify-center rounded-xl'>
            <img src={assets.logo} alt="Gift4Corp" className='w-9 h-9 object-contain' />
          </div>
          <div>
            <p className='text-sm text-gray-300'>Gift4Corp Admin</p>
            <h1 className='login-heading'>Welcome back</h1>
          </div>
        </div>

        <p className='login-subtitle'>Sign in to manage orders, products, and settings.</p>

        <form onSubmit={onSubmitHandler} className='space-y-3'>
          <div className='field'>
            <label className='input-label'>Email Address</label>
            <input
              onChange={(e)=>setEmail(e.target.value)}
              value={email}
              className='glass-input glass-select'
              type="email"
              placeholder='admin@company.com'
              required
            />
          </div>

          <div className='field'>
            <label className='input-label'>Password</label>
            <input
              onChange={(e)=>setPassword(e.target.value)}
              value={password}
              className='glass-input'
              type="password"
              placeholder='Enter your password'
              required
            />
          </div>

          <button className="btn btn-primary w-full justify-center" type='submit'>Sign in</button >
        </form>
      </div>
    </div>
  )
}

export default Login

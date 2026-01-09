import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendURL, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Orders = ({ token }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

     if(!token) return null;

    try {
    const response=await axios.post(backendURL+'/api/order/list',{},{headers:{token}})
    console.log("Orders response ",response.data)
    
    if(response.data.success){
      setOrders(response.data.orders.reverse()) 
    }else {
      toast.error('Failed to fetch orders')
    }
   


    }
    catch (error) {
    
      toast.error(error.message )
    }

  }

  const statusHandler =async(e,orderId)=>{
    try{
      const response=await axios.put(backendURL+'/api/order/status',{orderId,status:e.target.value},{headers:{token}})
        if(response.data.success){
          toast.success("Status updated")
          await fetchAllOrders()
        }
        else{
          
          toast.error("Failed to update status")

        }
    }catch(err){
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])
  return (
    <div className='space-y-4'>
      <div className='section-title'>
        <div>
          <p className='text-sm text-gray-300'>Fulfillment</p>
          <h3 className='text-2xl font-bold text-white'>Orders</h3>
        </div>
      </div>

      <div className='space-y-3'>
        {orders.map((order,index)=>(
          <div 
            className='glass-card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[0.6fr_2fr_1fr] lg:grid-cols-[0.6fr_2fr_1fr_1fr_1fr] gap-3 items-start cursor-pointer'
            key={index}
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            <div className='flex flex-col gap-2 items-start'>
              <img className='w-12 h-12 object-contain' src={assets.parcel_icon} alt="" />
              <span className='pill-small font-mono'>#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className='space-y-2'>
              <div className='space-y-1 text-sm text-gray-200'>
                {order.items.map((item,i)=>(
                  <p key={i}>{item.name} x {item.quantity} {item.size && <span>({item.size})</span>}</p>
                ))}
              </div>
              <p className='mt-3 mb-1 font-semibold text-white'>{order.address.firstName + " " +order.address.lastName}</p>
              <div className='text-sm text-gray-300 space-y-1'>
                <p>{order.address.street}</p>
                <p>{order.address.city+ ", " +order.address.state + " , " + order.address.country + " , " +  order.address.zipcode }</p>
                <p>{order.address.phone}</p>
              </div>
            </div>

            <div className='space-y-2 text-sm text-gray-200'>
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending" }</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className='text-lg font-semibold text-green-300'>{currency }{order.amount}</p>
            <select
              onChange={(e)=>statusHandler(e,order._id)}
              onClick={(e)=>e.stopPropagation()}
              value={order.status}
              className='glass-input text-sm'
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders

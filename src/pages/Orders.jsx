import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendURL, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import ProductImageThumbnails from '../components/ProductImageThumbnails'
import { getOrderPreviewImages } from '../utils/productImages'
import ConfirmDialog from '../components/ConfirmDialog'

const Orders = ({ token }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  const openDeleteModal = (order, e) => {
    e.stopPropagation()
    setDeleteTarget(order)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await axios.post(
        `${backendURL}/api/order/delete`,
        { orderId: deleteTarget._id },
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Order removed')
        setDeleteTarget(null)
        await fetchAllOrders()
      } else {
        toast.error(res.data.message || 'Failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

  const setPaymentStatus = async (orderId, payment, e) => {
    e.stopPropagation()
    try {
      const res = await axios.put(
        `${backendURL}/api/order/payment-status`,
        { orderId, payment },
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success(res.data.message || (payment ? 'Marked as paid' : 'Marked as pending'))
        await fetchAllOrders()
      } else {
        toast.error(res.data.message || 'Failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete this order?"
        subtitle={
          deleteTarget
            ? `Order #${deleteTarget._id.slice(-8).toUpperCase()} · ${currency}${deleteTarget.amount}`
            : ''
        }
        confirmLabel="Delete order"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        variant="danger"
      >
        {deleteTarget && (
          <>
            {shouldRestoreStockHint(deleteTarget) && (
              <p className="text-amber-200/95 mb-3 flex gap-2">
                <span className="shrink-0" aria-hidden>
                  ↻
                </span>
                <span>Product stock will be restored for this order.</span>
              </p>
            )}
            <p className="text-gray-400 text-xs leading-relaxed">
              This removes the order from your admin and database only. Process refunds in Razorpay and
              shipment changes in Shiprocket separately if needed.
            </p>
          </>
        )}
      </ConfirmDialog>

      <div className='space-y-3'>
        {orders.map((order,index)=>(
          <div 
            className={`glass-card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[0.6fr_2fr_1fr] lg:grid-cols-[0.6fr_2fr_1fr_1fr_1fr] gap-3 items-start cursor-pointer transition-colors relative overflow-hidden ${
              !order.payment
                ? 'border-2 border-red-500 bg-red-950/40 ring-2 ring-red-500/50 shadow-[0_0_24px_-4px_rgba(239,68,68,0.45)]'
                : ''
            }`}
            key={index}
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            {!order.payment && (
              <div
                className='absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l pointer-events-none'
                aria-hidden
              />
            )}
            {!order.payment && (
              <div className='col-span-full flex flex-wrap items-center gap-2 border-b border-red-500/35 pb-3 -mt-1'>
                <span className='inline-flex items-center rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md'>
                  Payment pending
                </span>
                <span className='text-xs text-red-200/90'>
                  {order.paymentMethod === 'Razorpay'
                    ? 'Awaiting online payment'
                    : 'Cash on delivery — not marked paid yet'}
                </span>
              </div>
            )}
            <div className='flex flex-col gap-2 items-start'>
              <ProductImageThumbnails
                source={getOrderPreviewImages(order)}
                sizeClass='w-9 h-9'
                className='max-w-[6.5rem]'
                fallbackSrc={assets.parcel_icon}
                alt='Order items'
              />
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
              <p className={!order.payment ? 'text-red-300 font-semibold' : ''}>
                Payment: {order.payment ? 'Paid' : 'Pending'}
              </p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className='text-lg font-semibold text-green-300'>{currency }{order.amount}</p>
            <div className='flex flex-col gap-2' onClick={(e) => e.stopPropagation()}>
              <select
                onChange={(e)=>statusHandler(e,order._id)}
                value={order.status}
                className='glass-input text-sm'
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              {!order.payment && (
                <button
                  type='button'
                  className='text-xs py-2 px-3 rounded border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10'
                  onClick={(e) => setPaymentStatus(order._id, true, e)}
                >
                  Mark paid
                </button>
              )}
              {order.payment && (
                <button
                  type='button'
                  className='text-xs py-2 px-3 rounded border border-amber-500/50 text-amber-200 hover:bg-amber-500/10'
                  onClick={(e) => setPaymentStatus(order._id, false, e)}
                >
                  Mark pending
                </button>
              )}
              <button
                type='button'
                className='text-xs py-2 px-3 rounded border border-red-500/50 text-red-300 hover:bg-red-500/10'
                onClick={(e) => openDeleteModal(order, e)}
              >
                Delete order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function shouldRestoreStockHint(order) {
  if (order.paymentMethod === 'COD') return true
  if (order.paymentMethod === 'Razorpay' && order.payment) return true
  return false
}

export default Orders

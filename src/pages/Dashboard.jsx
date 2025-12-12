import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingPayments: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    processingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendURL + '/api/order/list',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const orders = response.data.orders;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate statistics
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const pendingPayments = orders.filter(order => !order.payment);
        const shippedOrders = orders.filter(order => order.status === 'Shipped');
        const deliveredOrders = orders.filter(order => order.status === 'Delivered');
        const processingOrders = orders.filter(order => 
          order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled'
        );

        const todayRevenue = todayOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        const totalRevenue = orders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        setStats({
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          pendingPayments: pendingPayments.length,
          shippedOrders: shippedOrders.length,
          deliveredOrders: deliveredOrders.length,
          todayRevenue: todayRevenue,
          totalRevenue: totalRevenue,
          processingOrders: processingOrders.length,
        });

        // Get 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-gray-600 text-sm font-medium'>{title}</p>
          <p className='text-3xl font-bold mt-2 text-gray-800'>{value}</p>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>
        <div className='text-4xl'>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className='pb-8'>
      <h2 className='text-3xl font-bold mb-6 text-gray-800'>Dashboard</h2>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Orders Today'
          value={stats.todayOrders}
          icon='📦'
          color='border-blue-500'
          subtitle={`${currency}${stats.todayRevenue.toFixed(2)} revenue`}
        />
        <StatCard
          title='Pending Payments'
          value={stats.pendingPayments}
          icon='⏳'
          color='border-yellow-500'
        />
        <StatCard
          title='Shipped Orders'
          value={stats.shippedOrders}
          icon='🚚'
          color='border-green-500'
        />
        <StatCard
          title='Delivered Orders'
          value={stats.deliveredOrders}
          icon='✅'
          color='border-purple-500'
        />
      </div>

      {/* Additional Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <StatCard
          title='Total Orders'
          value={stats.totalOrders}
          icon='📊'
          color='border-indigo-500'
        />
        <StatCard
          title='Processing Orders'
          value={stats.processingOrders}
          icon='⚙️'
          color='border-orange-500'
        />
        <StatCard
          title='Total Revenue'
          value={`${currency}${stats.totalRevenue.toFixed(2)}`}
          icon='💰'
          color='border-green-600'
        />
      </div>

      {/* Recent Orders */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-800'>Recent Orders</h3>
          <button
            onClick={() => navigate('/orders')}
            className='text-blue-600 hover:text-blue-800 text-sm font-medium'
          >
            View All →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Order ID</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Customer</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Items</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Amount</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Payment</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3 text-sm'>
                      <span className='font-mono font-medium'>#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <div>
                        <p className='font-medium'>{order.address.firstName} {order.address.lastName}</p>
                        <p className='text-xs text-gray-500'>{order.address.city}</p>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm'>{order.items.length}</td>
                    <td className='px-4 py-3 text-sm font-semibold'>{currency}{order.amount}</td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.payment ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

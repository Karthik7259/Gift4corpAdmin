import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('today'); // today, thisMonth, lastMonth, custom
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingPayments: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    processingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
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
        const allOrders = response.data.orders;
        
        // Filter orders based on selected filter
        const filteredOrders = filterOrders(allOrders);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate statistics based on filtered orders
        const todayOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const pendingPayments = filteredOrders.filter(order => !order.payment);
        const shippedOrders = filteredOrders.filter(order => order.status === 'Shipped');
        const deliveredOrders = filteredOrders.filter(order => order.status === 'Delivered');
        const processingOrders = filteredOrders.filter(order => 
          order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled'
        );

        const todayRevenue = todayOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        const totalRevenue = filteredOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        // Count total products sold in filtered orders
        const totalProducts = filteredOrders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // Calculate top selling products
        const productStats = {};
        filteredOrders.forEach(order => {
          order.items.forEach(item => {
            const productId = item._id;
            if (!productStats[productId]) {
              productStats[productId] = {
                id: productId,
                name: item.name,
                image: item.image ? item.image[0] : null,
                category: item.category,
                quantitySold: 0,
                revenue: 0,
                orderCount: 0
              };
            }
            productStats[productId].quantitySold += item.quantity;
            productStats[productId].revenue += item.price * item.quantity;
            productStats[productId].orderCount += 1;
          });
        });

        // Sort by quantity sold and get top 10
        const topSellingProducts = Object.values(productStats)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 10);

        setTopProducts(topSellingProducts);

        setStats({
          totalOrders: filteredOrders.length,
          todayOrders: todayOrders.length,
          pendingPayments: pendingPayments.length,
          shippedOrders: shippedOrders.length,
          deliveredOrders: deliveredOrders.length,
          todayRevenue: todayRevenue,
          totalRevenue: totalRevenue,
          processingOrders: processingOrders.length,
          totalProducts: totalProducts,
        });

        // Get 5 most recent filtered orders
        setRecentOrders(filteredOrders.slice(0, 5));
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

  const filterOrders = (orders) => {
    const now = new Date();
    
    switch(filterType) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
      
      case 'thisMonth':
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        });
      
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === lastMonth.getMonth() && 
                 orderDate.getFullYear() === lastMonth.getFullYear();
        });
      
      case 'custom':
        if (!selectedMonth) return orders;
        const [year, month] = selectedMonth.split('-');
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === parseInt(month) - 1 && 
                 orderDate.getFullYear() === parseInt(year);
        });
      
      case 'all':
      default:
        return orders;
    }
  };

  const getFilterLabel = () => {
    switch(filterType) {
      case 'today': return 'Today';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'custom': return selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Select Month';
      case 'all': return 'All Time';
      default: return 'Today';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, filterType, selectedMonth]);

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
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-gray-800'>Dashboard</h2>
        
        {/* Filter Section */}
        <div className='flex gap-3 items-center'>
          <span className='text-sm font-medium text-gray-600'>Filter:</span>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              if (e.target.value !== 'custom') {
                setSelectedMonth('');
              }
            }}
            className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='today'>Today</option>
            <option value='thisMonth'>This Month</option>
            <option value='lastMonth'>Last Month</option>
            <option value='custom'>Custom Month</option>
            <option value='all'>All Time</option>
          </select>
          
          {filterType === 'custom' && (
            <input
              type='month'
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
              className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          )}
          
          <div className='bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium'>
            Showing: {getFilterLabel()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Total Orders'
          value={stats.totalOrders}
          icon='📦'
          color='border-blue-500'
          subtitle={`${stats.totalProducts} products sold`}
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
        <StatCard
          title='Products Sold'
          value={stats.totalProducts}
          icon='📊'
          color='border-indigo-500'
        />
      </div>

      {/* Recent Orders */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
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

      {/* Top Selling Products */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-800'>Top Selling Products</h3>
          <button
            onClick={() => navigate('/list')}
            className='text-blue-600 hover:text-blue-800 text-sm font-medium'
          >
            View All Products →
          </button>
        </div>

        {topProducts.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>No products sold yet</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Rank</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Product</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Category</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Units Sold</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Orders</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Revenue</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {topProducts.map((product, index) => (
                  <tr key={index} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3 text-sm'>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <div className='flex items-center gap-3'>
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className='w-12 h-12 object-cover rounded border'
                          />
                        )}
                        <div>
                          <p className='font-medium text-gray-800'>{product.name}</p>
                          <p className='text-xs text-gray-500'>ID: {product.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'>
                        {product.category || 'N/A'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-lg text-blue-600'>{product.quantitySold}</span>
                        <span className='text-gray-500 text-xs'>units</span>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm font-medium'>{product.orderCount}</td>
                    <td className='px-4 py-3 text-sm font-semibold text-green-600'>
                      {currency}{product.revenue.toFixed(2)}
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

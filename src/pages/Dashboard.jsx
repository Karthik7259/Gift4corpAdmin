import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
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
  const [insights, setInsights] = useState({
    avgOrderValue: 0,
    avgItemsPerOrder: 0,
    paymentSuccessRate: 0,
    deliveryRate: 0,
    repeatCustomerRate: 0,
    uniqueCustomers: 0,
    revenueChange: null,
    ordersChange: null,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    switch (filterType) {
      case 'today': {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const endToday = new Date(startToday);
        endToday.setDate(endToday.getDate() + 1);
        return { start: startToday, end: endToday };
      }
      case 'thisMonth':
        return { start: startOfMonth, end: startOfNextMonth };
      case 'lastMonth': {
        const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { start: startLastMonth, end: startOfMonth };
      }
      case 'custom': {
        if (!selectedMonth) return { start: null, end: null };
        const [year, month] = selectedMonth.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        return { start, end };
      }
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  const getPreviousRange = (currentRange) => {
    if (!currentRange || !currentRange.start || !currentRange.end) return null;
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    return {
      start: new Date(currentRange.start.getTime() - duration),
      end: new Date(currentRange.start.getTime()),
    };
  };

  const filterOrders = (orders, range = getDateRange()) => {
    if (!range || !range.start || !range.end) return orders;
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= range.start && orderDate < range.end;
    });
  };

  const buildDelta = (changeValue) => {
    if (changeValue === null || Number.isNaN(changeValue) || !isFinite(changeValue)) return null;
    const direction = changeValue >= 0 ? 'up' : 'down';
    const formatted = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(1)}%`;
    return { direction, value: formatted, label: 'vs previous period' };
  };

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
        const currentRange = getDateRange();
        const previousRange = getPreviousRange(currentRange);
        const filteredOrders = filterOrders(allOrders, currentRange);
        const previousOrders = previousRange ? filterOrders(allOrders, previousRange) : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

        const paidOrders = filteredOrders.filter(order => order.payment);
        const todayRevenue = todayOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        const totalRevenue = filteredOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        const totalProducts = filteredOrders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const uniqueCustomersSet = new Set();
        filteredOrders.forEach(order => {
          const address = order.address || {};
          const emailKey = address.email ? address.email.toLowerCase() : '';
          const phoneKey = address.phone || '';
          const fallbackKey = `${address.firstName || ''}${address.lastName || ''}` || order._id;
          uniqueCustomersSet.add(emailKey || phoneKey || fallbackKey || order._id);
        });

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

        const topSellingProducts = Object.values(productStats)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 10);

        const previousRevenue = previousOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

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
        setInsights({
          avgOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
          avgItemsPerOrder: filteredOrders.length ? totalProducts / filteredOrders.length : 0,
          paymentSuccessRate: filteredOrders.length ? (paidOrders.length / filteredOrders.length) * 100 : 0,
          deliveryRate: filteredOrders.length ? (deliveredOrders.length / filteredOrders.length) * 100 : 0,
          repeatCustomerRate: filteredOrders.length ? ((filteredOrders.length - uniqueCustomersSet.size) / filteredOrders.length) * 100 : 0,
          uniqueCustomers: uniqueCustomersSet.size,
          revenueChange: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : null,
          ordersChange: previousOrders.length ? ((filteredOrders.length - previousOrders.length) / previousOrders.length) * 100 : null,
        });

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

  const getFilterLabel = () => {
    switch (filterType) {
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

  const StatCard = ({ title, value, subtitle, accent, delta }) => (
    <div className='glass-card stat-card'>
      <div className='stat-glow' style={{ background: `radial-gradient(circle, ${accent || 'rgba(0, 122, 255, 0.25)'} 0%, transparent 65%)` }} />
      <div className='stat-content'>
        <p className='stat-title'>{title}</p>
        <p className='stat-value'>{value}</p>
        {subtitle && <p className='stat-sub'>{subtitle}</p>}
        {delta && (
          <div className={`trend ${delta.direction === 'up' ? 'up' : 'down'}`}>
            <span>{delta.value}</span>
            <span className='text-xs text-gray-200'>{delta.label}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='glass-card px-6 py-5 flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full skeleton' />
          <div className='space-y-2'>
            <div className='w-40 h-3 skeleton' />
            <div className='w-24 h-3 skeleton' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='section-card glass-card'>
        <div className='section-title flex-wrap'>
          <div>
            <p className='text-sm text-gray-300'>Overview</p>
            <h2 className='text-2xl font-bold text-white'>Dashboard</h2>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='pill'>Showing: {getFilterLabel()}</div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (e.target.value !== 'custom') {
                  setSelectedMonth('');
                }
              }}
              className='glass-input glass-select w-44'
            >
              <option value='all'>All Time</option>
              <option value='today'>Today</option>
              <option value='thisMonth'>This Month</option>
              <option value='lastMonth'>Last Month</option>
              <option value='custom'>Custom Month</option>
            </select>

            {filterType === 'custom' && (
              <input
                type='month'
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
                className='glass-input w-44'
              />
            )}
          </div>
        </div>
      </div>

      <div className='stat-grid'>
        <StatCard
          title='Total Orders'
          value={stats.totalOrders}
          subtitle={`${stats.totalProducts} products sold`}
          accent='rgba(0, 122, 255, 0.35)'
          delta={buildDelta(insights.ordersChange)}
        />
        <StatCard
          title='Pending Payments'
          value={stats.pendingPayments}
          accent='rgba(255, 159, 10, 0.35)'
        />
        <StatCard
          title='Shipped Orders'
          value={stats.shippedOrders}
          accent='rgba(48, 209, 88, 0.35)'
        />
        <StatCard
          title='Delivered Orders'
          value={stats.deliveredOrders}
          accent='rgba(191, 90, 242, 0.35)'
        />
      </div>

      <div className='stat-grid'>
        <StatCard
          title='Processing Orders'
          value={stats.processingOrders}
          accent='rgba(255, 214, 10, 0.28)'
        />
        <StatCard
          title='Total Revenue'
          value={`${currency}${stats.totalRevenue.toFixed(2)}`}
          accent='rgba(48, 209, 88, 0.4)'
          delta={buildDelta(insights.revenueChange)}
        />
        <StatCard
          title='Products Sold'
          value={stats.totalProducts}
          accent='rgba(0, 122, 255, 0.3)'
        />
      </div>

      <div className='stat-grid'>
        <StatCard
          title='Avg Order Value'
          value={`${currency}${insights.avgOrderValue.toFixed(2)}`}
          subtitle={`${insights.avgItemsPerOrder.toFixed(1)} items per order`}
          accent='rgba(0, 122, 255, 0.28)'
        />
        <StatCard
          title='Payment Success'
          value={`${insights.paymentSuccessRate.toFixed(1)}%`}
          subtitle={`${stats.pendingPayments} unpaid invoices`}
          accent='rgba(48, 209, 88, 0.35)'
        />
        <StatCard
          title='Delivery Rate'
          value={`${insights.deliveryRate.toFixed(1)}%`}
          subtitle={`${stats.deliveredOrders}/${stats.totalOrders || 0} delivered`}
          accent='rgba(191, 90, 242, 0.32)'
        />
        <StatCard
          title='Returning Customers'
          value={`${insights.repeatCustomerRate.toFixed(1)}%`}
          subtitle={`${insights.uniqueCustomers} unique buyers`}
          accent='rgba(255, 214, 10, 0.32)'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='section-card glass-card table-shell'>
          <div className='section-title'>
            <h3 className='text-xl font-semibold text-white'>Recent Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              className='table-action'
            >
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className='text-center py-8 text-gray-300'>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className='scroll-area'>
              <table className='glass-table'>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr
                      key={index}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className='cursor-pointer'
                    >
                      <td>
                        <span className='font-mono font-semibold'>#{order._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td>
                        <div className='space-y-1'>
                          <p className='font-medium text-white'>{order.address.firstName} {order.address.lastName}</p>
                          <p className='text-xs text-gray-300'>{order.address.city}</p>
                        </div>
                      </td>
                      <td>{order.items.length}</td>
                      <td className='font-semibold text-green-300'>{currency}{order.amount}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === 'Delivered'
                              ? 'success'
                              : order.status === 'Shipped'
                                ? 'info'
                                : order.status === 'Cancelled'
                                  ? 'error'
                                  : 'warn'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${order.payment ? 'success' : 'error'}`}>
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

        <div className='section-card glass-card table-shell'>
          <div className='section-title'>
            <h3 className='text-xl font-semibold text-white'>Top Selling Products</h3>
            <button
              onClick={() => navigate('/list')}
              className='table-action'
            >
              View Products
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className='text-center py-8 text-gray-300'>
              <p>No products sold yet</p>
            </div>
          ) : (
            <div className='scroll-area'>
              <table className='glass-table'>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div className='w-9 h-9 glass-elevated rounded-full flex items-center justify-center font-semibold'>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <div className='flex items-center gap-3'>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className='w-12 h-12 object-cover rounded border border-white/10'
                            />
                          )}
                          <div>
                            <p className='font-medium text-white'>{product.name}</p>
                            <p className='text-xs text-gray-300'>ID: {product.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className='badge info'>{product.category || 'N/A'}</span>
                      </td>
                      <td>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold text-lg text-blue-200'>{product.quantitySold}</span>
                          <span className='text-gray-400 text-xs'>units</span>
                        </div>
                      </td>
                      <td className='font-medium'>{product.orderCount}</td>
                      <td className='font-semibold text-green-300'>
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
    </div>
  );
};

export default Dashboard;

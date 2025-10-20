'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAIL = 'admin@gmail.com';

interface Order {
  id: number;
  name: string;
  phone: string;
  service: string;
  details: string;
  image_urls: string[];
  order_type: string;
  status: string;
  final_price: number | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [swipedOrder, setSwipedOrder] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('admin_session');
    const adminEmail = localStorage.getItem('admin_email');
    
    if (!adminSession || adminEmail !== ADMIN_EMAIL) {
      router.push('/admin/login');
      return;
    }

    fetchOrders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Close dropdown
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setSwipedOrder(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      
      // If no orders left, reset the sequence
      if (updatedOrders.length === 0) {
        await supabase.rpc('reset_orders_sequence');
      }
      
      setSwipedOrder(null);
      alert('Order deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
      setSwipedOrder(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (orderId: number) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    
    if (isLeftSwipe) {
      setSwipedOrder(orderId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = (orderId: number) => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    
    if (isLeftSwipe) {
      setSwipedOrder(orderId);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: 'Pending', 
        emoji: '⏳', 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        text: 'text-yellow-700',
        hover: 'hover:bg-yellow-100',
        ring: 'ring-yellow-500'
      },
      in_progress: { 
        label: 'In Progress', 
        emoji: '🔨', 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-700',
        hover: 'hover:bg-blue-100',
        ring: 'ring-blue-500'
      },
      ready: { 
        label: 'Ready', 
        emoji: '✅', 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'text-green-700',
        hover: 'hover:bg-green-100',
        ring: 'ring-green-500'
      },
      completed: { 
        label: 'Completed', 
        emoji: '📦', 
        bg: 'bg-neutral-100', 
        border: 'border-neutral-300', 
        text: 'text-neutral-600',
        hover: 'hover:bg-neutral-200',
        ring: 'ring-neutral-500'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-neutral-900 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="px-4 py-8 max-w-7xl mx-auto">
        {/* Stats - Clickable Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total Orders Card */}
          <button
            onClick={() => setFilter('all')}
            className={`text-left p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              filter === 'all'
                ? 'bg-neutral-900 border-2 border-neutral-900 shadow-lg'
                : 'bg-white border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
            }`}
          >
            <p className={`text-sm mb-1 font-medium ${filter === 'all' ? 'text-neutral-300' : 'text-neutral-600'}`}>
              Total Orders
            </p>
            <p className={`text-3xl font-bold ${filter === 'all' ? 'text-white' : 'text-neutral-900'}`}>
              {stats.total}
            </p>
          </button>

          {/* Pending Card */}
          <button
            onClick={() => setFilter('pending')}
            className={`text-left p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              filter === 'pending'
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-500 shadow-lg shadow-yellow-200'
                : 'bg-white border-2 border-yellow-200 hover:bg-yellow-50'
            }`}
          >
            <p className={`text-sm mb-1 font-medium ${filter === 'pending' ? 'text-yellow-900' : 'text-yellow-700'}`}>
              ⏳ Pending
            </p>
            <p className={`text-3xl font-bold ${filter === 'pending' ? 'text-white' : 'text-yellow-700'}`}>
              {stats.pending}
            </p>
          </button>

          {/* In Progress Card */}
          <button
            onClick={() => setFilter('in_progress')}
            className={`text-left p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              filter === 'in_progress'
                ? 'bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-blue-500 shadow-lg shadow-blue-200'
                : 'bg-white border-2 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <p className={`text-sm mb-1 font-medium ${filter === 'in_progress' ? 'text-blue-900' : 'text-blue-700'}`}>
              🔨 In Progress
            </p>
            <p className={`text-3xl font-bold ${filter === 'in_progress' ? 'text-white' : 'text-blue-700'}`}>
              {stats.in_progress}
            </p>
          </button>

          {/* Ready Card */}
          <button
            onClick={() => setFilter('ready')}
            className={`text-left p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              filter === 'ready'
                ? 'bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-500 shadow-lg shadow-green-200'
                : 'bg-white border-2 border-green-200 hover:bg-green-50'
            }`}
          >
            <p className={`text-sm mb-1 font-medium ${filter === 'ready' ? 'text-green-900' : 'text-green-700'}`}>
              ✅ Ready
            </p>
            <p className={`text-3xl font-bold ${filter === 'ready' ? 'text-white' : 'text-green-700'}`}>
              {stats.ready}
            </p>
          </button>

          {/* Completed Card */}
          <button
            onClick={() => setFilter('completed')}
            className={`col-span-2 text-left p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              filter === 'completed'
                ? 'bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-purple-500 shadow-lg shadow-purple-200'
                : 'bg-white border-2 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <p className={`text-sm mb-1 font-medium ${filter === 'completed' ? 'text-purple-900' : 'text-purple-700'}`}>
              📦 Completed
            </p>
            <p className={`text-3xl font-bold ${filter === 'completed' ? 'text-white' : 'text-purple-700'}`}>
              {stats.completed}
            </p>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Orders', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'in_progress', label: 'In Progress', count: stats.in_progress },
            { id: 'ready', label: 'Ready', count: stats.ready },
            { id: 'completed', label: 'Completed', count: stats.completed },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                filter === item.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="relative overflow-hidden rounded-xl"
              >
                {/* Delete Background */}
                <div className="absolute inset-0 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-end px-8">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>

                {/* Order Card */}
                <div
                  onClick={() => {
                    if (swipedOrder !== order.id) {
                      router.push(`/admin/orders/${order.id}`);
                    }
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(order.id)}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => handleMouseUp(order.id)}
                  onMouseLeave={() => {
                    setTouchStart(null);
                    setTouchEnd(null);
                  }}
                  className={`bg-white border border-neutral-300 rounded-xl p-6 hover:border-neutral-900 hover:shadow-lg transition-all cursor-pointer relative ${
                    swipedOrder === order.id ? '-translate-x-24' : 'translate-x-0'
                  }`}
                  style={{ 
                    transition: swipedOrder === order.id ? 'transform 0.3s ease-out' : 'transform 0.3s ease-out, border 0.3s, box-shadow 0.3s',
                    transform: swipedOrder === order.id ? 'translateX(-96px)' : touchStart !== null && touchEnd !== null ? `translateX(${Math.min(0, touchEnd - touchStart)}px)` : 'translateX(0)'
                  }}
                >
                  {/* Swipe delete button */}
                  {swipedOrder === order.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors animate-fade-in z-10"
                    >
                      Delete
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg text-neutral-900">Order #{order.id}</p>
                        {order.order_type && (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">
                            {order.order_type === 'custom' ? 'Custom' : 'Alteration'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">{order.service}</p>
                    </div>
                    
                    {/* Custom Status Dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const config = getStatusConfig(order.status);
                        return (
                          <>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 flex items-center gap-2 ${config.bg} ${config.border} ${config.text} ${config.hover} shadow-sm hover:shadow-lg transition-all duration-500 ease-out hover:scale-[1.08] active:scale-95 hover:-translate-y-0.5`}
                            >
                              <span className={`text-base transition-transform duration-300 ${openDropdown === order.id ? 'scale-125 rotate-12' : ''}`}>
                                {config.emoji}
                              </span>
                              <span className="transition-all duration-300">{config.label}</span>
                              <svg 
                                className={`w-4 h-4 transition-all duration-500 ease-out ${openDropdown === order.id ? 'rotate-180 scale-110' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                          {/* Dropdown Menu */}
                          {openDropdown === order.id && (
                            <>
                              {/* Backdrop */}
                              <div className="fixed inset-0 z-40" onClick={(e) => e.stopPropagation()} />
                              
                              {/* Menu */}
                              <div className="absolute right-0 mt-3 w-56 z-50 dropdown-enter">
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-neutral-200/50 overflow-hidden ring-1 ring-black/5">
                                  {['pending', 'in_progress', 'ready', 'completed'].map((status, index) => {
                                    const statusConfig = getStatusConfig(status);
                                    const isActive = order.status === status;
                                    return (
                                      <button
                                        key={status}
                                        onClick={() => handleStatusChange(order.id, status)}
                                        className={`dropdown-menu-item w-full px-5 py-4 text-left flex items-center gap-3.5 relative overflow-hidden ${
                                          isActive 
                                            ? `${statusConfig.bg} ${statusConfig.text}` 
                                            : 'hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent text-neutral-700'
                                        } ${isActive ? 'font-bold' : 'font-medium'} border-b border-neutral-100/50 last:border-b-0 group`}
                                        style={{
                                          animationDelay: `${index * 50}ms`
                                        }}
                                      >
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <span className="text-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out relative z-10">
                                          {statusConfig.emoji}
                                        </span>
                                        <span className="text-sm flex-1 relative z-10 transition-all duration-300 group-hover:translate-x-1">
                                          {statusConfig.label}
                                        </span>
                                        {isActive && (
                                          <svg className="w-5 h-5 text-green-600 relative z-10 animate-in fade-in duration-300 scale-in" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                    </div>
                  </div>
                
                <div className="mb-3">
                  <p className="text-sm text-neutral-900 font-medium">{order.name}</p>
                  <p className="text-sm text-neutral-600">{order.phone}</p>
                </div>
                
                {order.details && (
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{order.details}</p>
                )}
                
                {order.image_urls && order.image_urls.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {order.image_urls.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="w-12 h-12 bg-neutral-100 rounded border border-neutral-200 overflow-hidden">
                        <img src={url} alt={`Order ${order.id} image ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.image_urls.length > 3 && (
                      <div className="w-12 h-12 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center text-xs text-neutral-600">
                        +{order.image_urls.length - 3}
                      </div>
                    )}
                  </div>
                )}
                
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                    {order.final_price && <span className="font-semibold text-neutral-900">RM {order.final_price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

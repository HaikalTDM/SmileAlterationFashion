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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-neutral-900 rounded-xl p-6">
            <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-300 rounded-xl p-6">
            <p className="text-sm text-neutral-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.pending}</p>
          </div>
          <div className="bg-white border border-neutral-300 rounded-xl p-6">
            <p className="text-sm text-neutral-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.in_progress}</p>
          </div>
          <div className="bg-white border border-neutral-300 rounded-xl p-6">
            <p className="text-sm text-neutral-600 mb-1">Ready</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.ready}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Orders', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'in_progress', label: 'In Progress', count: stats.in_progress },
            { id: 'ready', label: 'Ready', count: stats.ready },
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
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="bg-white border border-neutral-300 rounded-xl p-6 hover:border-neutral-900 hover:shadow-lg transition-all cursor-pointer"
              >
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
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-300 flex items-center gap-2 ${config.bg} ${config.border} ${config.text} ${config.hover} hover:scale-105 active:scale-95 shadow-sm hover:shadow-md`}
                          >
                            <span className="text-base">{config.emoji}</span>
                            <span>{config.label}</span>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-300 ${openDropdown === order.id ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdown === order.id && (
                            <div className="absolute right-0 mt-2 w-52 z-50 dropdown-enter">
                              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
                                {['pending', 'in_progress', 'ready', 'completed'].map((status, index) => {
                                  const statusConfig = getStatusConfig(status);
                                  const isActive = order.status === status;
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(order.id, status)}
                                      className={`dropdown-menu-item w-full px-4 py-3.5 text-left flex items-center gap-3 ${
                                        isActive 
                                          ? `${statusConfig.bg} ${statusConfig.text}` 
                                          : 'hover:bg-neutral-50 text-neutral-700'
                                      } ${isActive ? 'font-semibold' : 'font-medium'} border-b border-neutral-100 last:border-b-0 group`}
                                      style={{
                                        animationDelay: `${index * 30}ms`
                                      }}
                                    >
                                      <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                                        {statusConfig.emoji}
                                      </span>
                                      <span className="text-sm flex-1">{statusConfig.label}</span>
                                      {isActive && (
                                        <svg className="w-5 h-5 text-green-600 animate-in fade-in duration-200" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  service_id: number;
  customer_name: string;
  customer_phone: string;
  customer_notes: string;
  status: string;
  final_price: number | null;
  created_at: string;
  services: {
    name: string;
  };
}

const statusConfig = {
  pending: { label: 'Pending Review', variant: 'warning' as const },
  quoted: { label: 'Quoted', variant: 'info' as const },
  approved: { label: 'Approved', variant: 'success' as const },
  in_progress: { label: 'In Progress', variant: 'info' as const },
  ready: { label: 'Ready for Collection', variant: 'success' as const },
  completed: { label: 'Completed', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'error' as const },
};

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      fetchOrders(user.id);
    };

    checkUser();
  }, [router, supabase]);

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-0 to-neutral-100">
      <header className="bg-neutral-0 border-b border-neutral-200 shadow-sm">
        <div className="container-custom py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-1000">My Account</h1>
            <p className="text-sm text-neutral-800">{user?.phone}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-1000">
              My Orders
            </h2>
            <Button onClick={() => router.push('/order/new')}>
              + New Order
            </Button>
          </div>

          {loading ? (
            <Card>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-neutral-800">Loading orders...</p>
              </div>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-neutral-1000 mb-2">
                  No orders yet
                </h3>
                <p className="text-neutral-800 mb-6">
                  Start by placing your first order
                </p>
                <Button onClick={() => router.push('/order/new')}>
                  Place Your First Order
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                
                return (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-1000 mb-1">
                              {order.services.name}
                            </h3>
                            <p className="text-sm text-neutral-800 mb-2">
                              Order #{order.id} • {new Date(order.created_at).toLocaleDateString('en-MY', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-neutral-800 space-y-1">
                          <p className="line-clamp-2">{order.customer_notes}</p>
                          {order.final_price && (
                            <p className="font-semibold text-neutral-1000 mt-2">
                              Price: RM {order.final_price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {order.status === 'ready' && (
                        <div className="md:text-right">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Ready for Collection!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


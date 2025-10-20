'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ADMIN_EMAIL = 'admin@gmail.com';

interface Order {
  id: number;
  name: string;
  phone: string;
  service: string;
  details: string;
  image_urls: string[];
  admin_images: string[];
  order_type: string;
  status: string;
  final_price: number | null;
  created_at: string;
  updated_at: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [price, setPrice] = useState('');
  const [adminImages, setAdminImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('admin_session');
    const adminEmail = localStorage.getItem('admin_email');
    
    if (!adminSession || adminEmail !== ADMIN_EMAIL) {
      router.push('/admin/login');
      return;
    }

    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      setOrder(data);
      setStatus(data.status);
      setPrice(data.final_price?.toString() || '');
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + adminImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setAdminImages(prev => [...prev, ...files]);
  };

  const removeAdminImage = (index: number) => {
    setAdminImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOrder = async () => {
    if (!order) return;
    
    setUpdating(true);
    toast.loading('Updating order...');

    try {
      // Upload admin images if any
      const uploadedImageUrls: string[] = [...(order.admin_images || [])];
      
      if (adminImages.length > 0) {
        setUploading(true);
        for (const image of adminImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('order-images')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('order-images')
            .getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrl);
        }
        setUploading(false);
      }

      const { error } = await supabase
        .from('orders')
        .update({
          status,
          final_price: price ? parseFloat(price) : null,
          admin_images: uploadedImageUrls
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.dismiss();
      toast.success('Order updated successfully!');
      setAdminImages([]);
      fetchOrder();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to update order');
    } finally {
      setUpdating(false);
      setUploading(false);
    }
  };

  const handleNotifyCustomer = () => {
    if (!order) return;

    const orderType = order.order_type === 'custom' ? 'Custom Clothes' : 'Alteration';
    const statusText = status.replace('_', ' ').toUpperCase();
    
    let message = `Hello ${order.name}! 👋\n\n`;
    message += `*Order Update - Order #${order.id}*\n\n`;
    message += `${orderType} - ${order.service}\n`;
    message += `Status: *${statusText}*\n\n`;
    
    if (price) {
      message += `💰 Price: *RM ${price}*\n\n`;
    }
    
    if (status === 'ready') {
      message += `✅ Your order is ready for pickup!\n`;
      message += `Please visit us at your convenience.\n\n`;
    } else if (status === 'in_progress') {
      message += `👔 We're working on your order.\n`;
      message += `We'll notify you when it's ready!\n\n`;
    }
    
    message += `_Smile Alteration & Fashions_`;

    const whatsappUrl = `https://wa.me/${order.phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-neutral-900 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-neutral-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Order not found</p>
          <Link href="/admin/dashboard" className="text-neutral-900 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900">Order #{order.id}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Order Type & Status */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 bg-neutral-900 text-white text-sm font-medium rounded-lg">
            {order.order_type === 'custom' ? 'Custom Clothes' : 'Alteration'}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-lg ${
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            order.status === 'ready' ? 'bg-green-100 text-green-700' :
            order.status === 'completed' ? 'bg-neutral-100 text-neutral-600' :
            'bg-neutral-200 text-neutral-700'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Customer Info */}
        <div className="bg-neutral-50 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-neutral-900 mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Name</p>
              <p className="text-neutral-900 font-medium">{order.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Phone</p>
              <p className="text-neutral-900 font-medium">{order.phone}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Service</p>
              <p className="text-neutral-900 font-medium">{order.service}</p>
            </div>
            {order.details && (
              <div>
                <p className="text-sm text-neutral-600 mb-1">Details & Requirements</p>
                <p className="text-neutral-900 whitespace-pre-wrap">{order.details}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-600 mb-1">Order Date</p>
              <p className="text-neutral-900">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Images */}
        {order.image_urls && order.image_urls.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg text-neutral-900 mb-4">Reference Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {order.image_urls.map((url, idx) => (
                <a 
                  key={idx} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-900 transition-colors group"
                >
                  <img 
                    src={url} 
                    alt={`Order ${order.id} image ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Admin Images (Progress/Completed Photos) */}
        {order.admin_images && order.admin_images.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg text-neutral-900 mb-4">Admin Photos (Progress/Completed)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {order.admin_images.map((url, idx) => (
                <a 
                  key={idx} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square bg-green-50 rounded-xl overflow-hidden border-2 border-green-200 hover:border-green-500 transition-colors group"
                >
                  <img 
                    src={url} 
                    alt={`Admin photo ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Update Order */}
        <div className="bg-neutral-50 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-neutral-900 mb-4">Update Order</h2>
          
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready for Pickup</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Price (RM)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Admin Images Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Add Progress/Completed Photos (Optional)
              </label>
              
              {adminImages.length < 5 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-neutral-900 hover:bg-white transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg className="w-10 h-10 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-neutral-600 font-medium">Add photos of progress or completed work</p>
                  <p className="text-xs text-neutral-500 mt-1">{adminImages.length}/5 images</p>
                </label>
              )}

              {/* Admin Image Preview */}
              {adminImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {adminImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 border-green-200 group">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`Admin preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdminImage(idx)}
                        className="absolute top-2 right-2 bg-neutral-900 text-white p-1.5 rounded-full hover:bg-neutral-700 transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateOrder}
              disabled={updating || uploading}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading images...
                </>
              ) : updating ? (
                'Updating...'
              ) : (
                'Update Order'
              )}
            </button>
          </div>
        </div>

        {/* Notify Customer */}
        <button
          onClick={handleNotifyCustomer}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Notify Customer via WhatsApp
        </button>
      </div>
    </main>
  );
}

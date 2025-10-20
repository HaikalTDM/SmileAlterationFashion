'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, TextArea, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Service {
  id: number;
  name: string;
  description: string | null;
  base_price: number | null;
}

export default function NewOrderPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Fetch services
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setServices(data);
      });
  }, [supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('order-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Format phone number
      let formattedPhone = customerPhone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+60' + formattedPhone.substring(1);
        } else {
          formattedPhone = '+60' + formattedPhone;
        }
      }

      // Create order via API (guest order - no authentication required)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: parseInt(selectedService),
          customer_name: customerName,
          customer_phone: formattedPhone,
          customer_notes: notes,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      toast.success('Order placed successfully! We will contact you via WhatsApp shortly.');
      
      // Reset form
      setSelectedService('');
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setImageFile(null);
      
      // Redirect to home with success message
      setTimeout(() => {
        router.push('/?success=true');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-0">
      {/* Premium Header with Gradient */}
      <header className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-white to-blue-600">
          <div className="absolute inset-0 bg-neutral-1000/50"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 container-custom py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center gap-2 text-neutral-0 hover:text-neutral-200 transition-colors mb-8 group">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium tracking-wide uppercase">Back to Home</span>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-0/10 backdrop-blur-md border border-neutral-0/20 rounded-full mb-6">
              <svg className="w-4 h-4 text-neutral-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs font-medium text-neutral-0 tracking-widest uppercase">New Order</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-0 mb-6 leading-tight tracking-tight">
              Place Your Order
            </h1>
            <p className="text-lg text-neutral-200 leading-relaxed max-w-2xl">
              Fill in your details below and our team will contact you within 24 hours with a personalized quote via WhatsApp.
            </p>
          </div>
        </div>
      </header>

      {/* Order Form */}
      <div className="relative -mt-12 z-20">
        <div className="container-custom pb-20">
          <div className="max-w-3xl mx-auto">
            {/* Main Form Card */}
            <div className="bg-neutral-0 rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Form Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-neutral-50 to-neutral-0 border-b border-neutral-200">
                  <h2 className="text-2xl font-bold text-neutral-1000 mb-2">Order Information</h2>
                  <p className="text-sm text-neutral-600">All fields are required unless marked optional</p>
                </div>

                {/* Form Body */}
                <div className="p-8 space-y-8">
                  {/* Section 1: Service Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-1000">Select Service</h3>
                    </div>
                    
                    <Select
                      label="Service Type"
                      options={services.map(s => ({
                        value: s.id,
                        label: `${s.name}${s.base_price ? ` - Starting from RM${s.base_price}` : ''}`,
                      }))}
                      placeholder="Choose the service you need"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-200"></div>

                  {/* Section 2: Contact Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-1000">Contact Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Your Full Name"
                        type="text"
                        placeholder="Ali bin Ahmad"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />

                      <Input
                        label="WhatsApp Number"
                        type="tel"
                        placeholder="0123456789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        helperText="We'll contact you on WhatsApp"
                        required
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-200"></div>

                  {/* Section 3: Order Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-1000">Order Requirements</h3>
                    </div>

                    <TextArea
                      label="Detailed Description"
                      placeholder="Please provide specific details:&#10;• For alterations: What needs to be adjusted (hem, waist, sleeves, etc.)&#10;• For custom garments: Measurements, fabric preferences, design details&#10;• For repairs: Describe the issue and desired outcome"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                      required
                    />

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-1000 mb-3">
                        Reference Images <span className="text-neutral-600 font-normal">(Optional)</span>
                      </label>
                      
                      {/* Custom File Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                          <div className="text-center">
                            <svg className="mx-auto w-12 h-12 text-neutral-400 group-hover:text-primary transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium text-neutral-800 mb-1">
                              Click to upload image
                            </p>
                            <p className="text-xs text-neutral-600">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>

                      {imageFile && (
                        <div className="mt-3 flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                          <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-success truncate">{imageFile.name}</p>
                            <p className="text-xs text-neutral-600">{(imageFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImageFile(null)}
                            className="text-neutral-600 hover:text-error transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200">
                  <Button
                    type="submit"
                    className="w-full md:w-auto md:min-w-[240px]"
                    size="lg"
                    isLoading={loading}
                    disabled={!selectedService || !customerName || !customerPhone || !notes}
                  >
                    {loading ? 'Submitting Order...' : 'Submit Order'}
                  </Button>
                  
                  <p className="text-xs text-neutral-600 mt-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Your information is secure. By submitting, you agree to our terms of service.
                  </p>
                </div>
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-1000 mb-2">24h Response</h4>
                <p className="text-sm text-neutral-600">We'll get back to you within one business day</p>
              </div>

              <div className="text-center p-6 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-1000 mb-2">No Commitment</h4>
                <p className="text-sm text-neutral-600">Free quote with no obligation to proceed</p>
              </div>

              <div className="text-center p-6 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-1000 mb-2">WhatsApp Direct</h4>
                <p className="text-sm text-neutral-600">Convenient communication via WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

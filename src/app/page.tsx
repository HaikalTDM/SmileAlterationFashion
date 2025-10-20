'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const CUSTOM_SERVICES = [
  { id: 'baju-kurung', name: 'Baju Kurung', icon: '👗' },
  { id: 'baju-melayu', name: 'Baju Melayu', icon: '🎽' },
  { id: 'shirt', name: 'Shirt', icon: '👔' },
  { id: 'pants', name: 'Pants/Trousers', icon: '👖' },
  { id: 'skirt', name: 'Skirt', icon: '🩱' },
  { id: 'dress', name: 'Dress', icon: '👗' },
  { id: 'suit', name: 'Suit', icon: '🤵' },
  { id: 'other', name: 'Other', icon: '✨' }
];

const ALTERATION_SERVICES = [
  { id: 'hem', name: 'Hem Pants/Skirt', icon: '📏' },
  { id: 'taper', name: 'Taper/Let Out', icon: '📐' },
  { id: 'sleeves', name: 'Shorten/Lengthen Sleeves', icon: '✂️' },
  { id: 'waist', name: 'Adjust Waist', icon: '⚡' },
  { id: 'zipper', name: 'Replace Zipper', icon: '🔗' },
  { id: 'repair', name: 'Fix Tear/Hole', icon: '🧵' },
  { id: 'shoulders', name: 'Adjust Shoulders', icon: '👕' },
  { id: 'other', name: 'Other Repairs', icon: '🔧' }
];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'custom' | 'alteration' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const supabase = createClient();

  const openModal = (type: 'custom' | 'alteration') => {
    setModalType(type);
    setIsModalOpen(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Trigger animation after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    
    // Wait for animation to finish
    setTimeout(() => {
      setIsModalOpen(false);
      setModalType(null);
      setName('');
      setPhone('');
      setService('');
      setDetails('');
      setImages([]);
      setShowServicePicker(false);
      document.body.style.overflow = 'unset';
    }, 600);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    toast.loading('Processing your order...');

    try {
      const imageUrls: string[] = [];
      
      // Upload images to Supabase Storage
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('order-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('order-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Format phone number
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+60' + formattedPhone.substring(1);
        } else {
          formattedPhone = '+60' + formattedPhone;
        }
      }

      // Save order to database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          name: name,
          phone: formattedPhone,
          service: service,
          details: details || '',
          image_urls: imageUrls,
          status: 'pending',
          order_type: modalType
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderType = modalType === 'custom' ? 'CUSTOM CLOTHES ORDER' : 'ALTERATION ORDER';
      const emoji = modalType === 'custom' ? '👔' : '✂️';

      const message = `🎯 *${orderType}*
📋 *Order #${orderData.id}*

━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📱 *Phone:* ${formattedPhone}
${emoji} *Service:* ${service}

📝 *Details:*
${details || 'No additional details provided'}

${imageUrls.length > 0 ? `📷 *Reference Images (${imageUrls.length}):*\n${imageUrls.map((url, idx) => `\n${idx + 1}. ${url}`).join('')}` : '📷 No images attached'}
━━━━━━━━━━━━━━━━━━━

✅ _Order saved successfully!_
_View in Admin Dashboard for updates_`;

      const whatsappUrl = `https://wa.me/60132068891?text=${encodeURIComponent(message)}`;
      
      toast.dismiss();
      toast.success('Order saved successfully!');
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      closeModal();
      
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to process order');
      console.error('Order submission error:', error);
    } finally {
      setUploading(false);
    }
  };

  const services = modalType === 'custom' ? CUSTOM_SERVICES : ALTERATION_SERVICES;
  const selectedService = services.find(s => s.id === service);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-neutral-900">Smile Alteration</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
              {/* Logo - Fade in animation */}
              <div className="flex justify-center mb-8 animate-fade-in">
                <div className="relative w-48 h-48 hover:scale-110 transition-transform duration-500">
                  <Image 
                    src="/SmileLogo.jpg" 
                    alt="Smile Alteration Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

          {/* Welcome Text - Slide up animation */}
          <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-semibold text-neutral-900 mb-3">What can we do for you?</h2>
            <p className="text-neutral-600">Choose a service to get started</p>
          </div>

          {/* Service Buttons - Slide up with stagger */}
          <div className="space-y-5">
            {/* Custom Clothes Button */}
            <button
              onClick={() => openModal('custom')}
              className="block w-full animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-full bg-neutral-900 text-white py-6 px-6 rounded-xl hover:bg-neutral-800 transition-all duration-300 active:scale-[0.97] flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Order Custom Clothes</div>
                    <div className="text-sm text-neutral-300 mt-0.5">Bespoke tailoring services</div>
                  </div>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Alteration Button */}
            <button
              onClick={() => openModal('alteration')}
              className="block w-full animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-full bg-white text-neutral-900 py-6 px-6 rounded-xl border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 active:scale-[0.97] flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border-2 border-neutral-900 group-hover:border-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Alteration</div>
                    <div className="text-sm text-neutral-500 group-hover:text-neutral-300 mt-0.5 transition-colors">Adjust existing clothes</div>
                  </div>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

              {/* Contact Info */}
              <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <a href="https://wa.me/60132068891" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-300 hover:scale-105">
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Need help? Chat with us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Admin Link (Bottom) */}
      <div className="border-t border-neutral-200 py-4 px-4 bg-neutral-50">
        <Link href="/admin/login" className="block text-center text-xs text-neutral-500 hover:text-neutral-700">
          Admin Access
        </Link>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black z-40 transition-all ${isModalVisible ? 'opacity-50' : 'opacity-0'}`}
            onClick={closeModal}
            style={{ 
              backdropFilter: isModalVisible ? 'blur(8px)' : 'blur(0px)',
              transitionDuration: '600ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />

          {/* Modal Content */}
          <div 
            className={`fixed inset-x-0 bottom-0 z-50 ${
              isModalVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
            }`}
            style={{
              transition: 'transform 600ms cubic-bezier(0.32, 0.72, 0, 1), opacity 600ms ease-out'
            }}
          >
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 rounded-t-3xl px-6 py-5 flex items-center justify-between z-10 shadow-sm backdrop-blur-md">
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '100ms' : '0ms' }}
                >
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {modalType === 'custom' ? 'Order Custom Clothes' : 'Alteration Service'}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-0.5">Fill in your details below</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all duration-300 active:scale-90 hover:rotate-90"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                {/* Name */}
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '200ms' : '0ms' }}
                >
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
                    placeholder="Ali bin Ahmad"
                    required
                  />
                </div>

                {/* Phone */}
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '300ms' : '0ms' }}
                >
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
                    placeholder="0123456789"
                    required
                  />
                </div>

                {/* Service Picker */}
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '400ms' : '0ms' }}
                >
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    {modalType === 'custom' ? 'What do you want to make?' : 'What needs to be altered?'}
                  </label>
                  
                  {/* Selected Service Display */}
                  <button
                    type="button"
                    onClick={() => setShowServicePicker(!showServicePicker)}
                    className="w-full px-4 py-4 border border-neutral-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-neutral-900 transition-all duration-300 group"
                  >
                    {selectedService ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedService.icon}</span>
                        <span className="text-neutral-900 font-medium">{selectedService.name}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-500">Select a service</span>
                    )}
                    <svg
                      className={`w-5 h-5 text-neutral-600 transition-transform duration-300 ${showServicePicker ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Service Options Grid */}
                  <div
                    className={`grid grid-cols-2 gap-3 mt-3 transition-all duration-500 origin-top ${
                      showServicePicker ? 'opacity-100 scale-y-100 max-h-96 overflow-y-auto' : 'opacity-0 scale-y-0 max-h-0 overflow-hidden'
                    }`}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#E5E5EA #F9F9F9'
                    }}
                  >
                    {services.map((s, index) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setService(s.name);
                          setShowServicePicker(false);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                          service === s.name
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
                            : 'border-neutral-200 bg-white hover:border-neutral-900'
                        }`}
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <div className={`text-sm font-medium ${service === s.name ? 'text-white' : 'text-neutral-900'}`}>
                          {s.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '500ms' : '0ms' }}
                >
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Details & Requirements (Optional)</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none transition-all duration-300 hover:border-neutral-400"
                    placeholder="Describe what you need..."
                    rows={4}
                  />
                </div>

                {/* Images */}
                <div 
                  className={`transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '600ms' : '0ms' }}
                >
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Reference Images (Optional, max 5)
                  </label>
                  
                  {images.length < 5 && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Gallery Button */}
                      <label className="flex flex-col items-center justify-center border-2 border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-300 active:scale-95">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <svg className="w-10 h-10 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-neutral-900 font-medium">Gallery</p>
                        <p className="text-xs text-neutral-500 mt-1">Choose photos</p>
                      </label>

                      {/* Camera Button */}
                      <label className="flex flex-col items-center justify-center border-2 border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-300 active:scale-95">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <svg className="w-10 h-10 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-neutral-900 font-medium">Camera</p>
                        <p className="text-xs text-neutral-500 mt-1">Take photo</p>
                      </label>
                    </div>
                  )}
                  
                  {/* Image count indicator */}
                  {images.length < 5 && (
                    <p className="text-xs text-neutral-500 text-center mt-3">{images.length}/5 images selected</p>
                  )}

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden group">
                          <img 
                            src={URL.createObjectURL(img)} 
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
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

                {/* Submit Button */}
                <div 
                  className={`pt-4 transition-all duration-500 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: isModalVisible ? '700ms' : '0ms' }}
                >
                  <button
                    type="submit"
                    disabled={uploading || !service}
                    className="w-full bg-neutral-900 text-white py-5 rounded-xl font-semibold text-lg hover:bg-neutral-800 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Send to WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const ALTERATION_SERVICES = [
  'Hem Pants/Skirt',
  'Taper/Let Out',
  'Shorten/Lengthen Sleeves',
  'Adjust Waist',
  'Replace Zipper',
  'Fix Tear/Hole',
  'Adjust Shoulders',
  'Other Repairs'
];

export default function AlterationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

    try {
      // Upload images to Supabase
      const imageUrls: string[] = [];
      
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

      // Create WhatsApp message
      const message = `*ALTERATION ORDER*

👤 Name: ${name}
📱 Phone: ${formattedPhone}
✂️ Service: ${service}

📝 Details:
${details}

${imageUrls.length > 0 ? `📷 Images:\n${imageUrls.join('\n')}` : ''}

_Sent from Smile Alteration App_`;

      // Encode and send to WhatsApp
      const whatsappUrl = `https://wa.me/60132068891?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success('Opening WhatsApp...');
      
      // Reset form
      setName('');
      setPhone('');
      setService('');
      setDetails('');
      setImages([]);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to process order');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">Alteration</h1>
        </div>
      </header>

      {/* Form */}
      <div className="px-4 py-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
              placeholder="Ali bin Ahmad"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
              placeholder="0123456789"
              required
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              What needs to be altered?
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white transition-all duration-300 hover:border-neutral-400"
              required
            >
              <option value="">Select a service</option>
              {ALTERATION_SERVICES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Alteration Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none transition-all duration-300 hover:border-neutral-400"
              placeholder="Describe what needs to be altered (e.g., shorten by 2 inches, adjust waist to fit better...)"
              rows={6}
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Photos of Garment (Optional, max 5)
            </label>
            
            {images.length < 5 && (
              <label className="block w-full border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="mx-auto w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-neutral-600">Tap to add photos</p>
                <p className="text-xs text-neutral-500 mt-1">{images.length}/5 images</p>
              </label>
            )}

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-neutral-900 text-white p-1 rounded-full hover:bg-neutral-700"
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

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={uploading}
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

          <p className="text-xs text-neutral-500 text-center mt-4">
            Your alteration request will be sent via WhatsApp for confirmation
          </p>
        </form>
      </div>
    </main>
  );
}


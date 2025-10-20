'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number (ensure it starts with +60 for Malaysia)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+60' + formattedPhone.substring(1);
        } else {
          formattedPhone = '+60' + formattedPhone;
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setPhoneNumber(formattedPhone);
      setStep('otp');
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Check if user exists in our users table, if not create one
      if (data.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!existingUser) {
          await supabase.from('users').insert({
            id: data.user.id,
            phone_number: phoneNumber,
          });
        }
      }

      toast.success('Login successful!');
      
      // Check if user is admin
      const adminPhones = process.env.NEXT_PUBLIC_ADMIN_PHONES?.split(',') || [];
      if (adminPhones.includes(phoneNumber)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-0 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-1000 mb-2">
            Smile Alteration
          </h1>
          <p className="text-neutral-800">& Fashions</p>
        </div>

        <Card>
          <h2 className="text-2xl font-semibold text-neutral-1000 mb-6">
            {step === 'phone' ? 'Login' : 'Verify OTP'}
          </h2>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="0123456789 or +60123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                helperText="Enter your Malaysian phone number"
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                disabled={!phoneNumber}
              >
                Send OTP
              </Button>
              <p className="text-sm text-neutral-800 text-center">
                You'll receive a verification code via SMS
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <p className="text-sm text-neutral-800 mb-4">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-semibold">{phoneNumber}</span>
                </p>
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                disabled={otp.length !== 6}
              >
                Verify & Login
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full text-sm text-primary hover:underline"
              >
                Change phone number
              </button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-neutral-800 hover:text-neutral-1000"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}


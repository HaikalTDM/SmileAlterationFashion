'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Simple hardcoded authentication check
      if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Store admin session in localStorage
        localStorage.setItem('admin_session', 'true');
        localStorage.setItem('admin_email', ADMIN_EMAIL);
        
        toast.success('Login successful!');
        router.push('/admin/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error: any) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-neutral-900">Admin Login</h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 hover:scale-105 transition-transform duration-300">
              <Image 
                src="/SmileLogo.jpg" 
                alt="Smile Alteration Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-neutral-900 mb-2">Admin Access</h2>
            <p className="text-neutral-600 text-sm">Smile Alteration & Fashions</p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
                placeholder="admin@gmail.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 hover:border-neutral-400"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-5 rounded-xl font-semibold text-lg hover:bg-neutral-800 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>

            {/* Helper Text */}
            <p className="text-xs text-neutral-500 text-center pt-4">
              Admin access only. Unauthorized access is prohibited.
            </p>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

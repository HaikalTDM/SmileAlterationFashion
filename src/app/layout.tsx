import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toast } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Smile Alteration and Fashions',
  description: 'Professional tailoring services for custom baju kurung, baju melayu, and alterations',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smile Tailor',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0A84FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
        <Toast />
      </body>
    </html>
  );
}


'use client';

import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#1C1C1E',
          border: '1px solid #E5E5EA',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px hsl(220 15% 5% / 0.1), 0 2px 4px -2px hsl(220 15% 5% / 0.1)',
          padding: '16px',
          fontSize: '16px',
          lineHeight: '24px',
        },
        success: {
          iconTheme: {
            primary: '#30D158',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF453A',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
};


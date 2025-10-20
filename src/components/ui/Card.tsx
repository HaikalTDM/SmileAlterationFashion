import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = '',
  padding = 'md'
}) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div className={`bg-neutral-0 border border-neutral-200 rounded-lg shadow-md ${paddingStyles[padding]} ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-neutral-1000 mb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};


// components/ui/Button.js
import React from 'react';

export const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50',
    ghost: 'hover:bg-blue-50 text-blue-600'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
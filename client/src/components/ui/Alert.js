import React from 'react';

export function Alert({ children, className = '', ...props }) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '', ...props }) {
    return (
      <div className={`text-sm font-medium ${className}`} {...props}>
        {children}
      </div>
    );
  }
'use client';

import React from 'react';
import { Loader } from 'lucide-react';

interface HybridCardProps {
  title?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
  loading?: boolean;
}

export const HybridCard: React.FC<HybridCardProps> = ({
  title,
  badge,
  children,
  className = '',
  gradient,
  onClick,
  loading = false
}) => (
  <div 
    className={`
      bg-white rounded-xl border border-gray-200 p-4 
      transition-all duration-300 ease-out transform hover:shadow-lg 
      ${onClick ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''}
      ${gradient ? `bg-gradient-to-br ${gradient}` : ''} 
      ${loading ? 'animate-pulse opacity-70' : 'opacity-100'} 
      ${className}
    `}
    onClick={onClick}
  >
    {title && (
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          <span>{title}</span>
        </h3>
        {badge && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
            {badge}
          </span>
        )}
      </div>
    )}
    {children}
  </div>
);

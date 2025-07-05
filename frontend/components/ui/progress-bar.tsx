'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'success';
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  progress, 
  size = 'md', 
  variant = 'gradient',
  showPercentage = true,
  className 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500',
    success: 'bg-green-500',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'w-full bg-gray-800 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-400">
          <span>{Math.round(progress)}% complete</span>
        </div>
      )}
    </div>
  );
}
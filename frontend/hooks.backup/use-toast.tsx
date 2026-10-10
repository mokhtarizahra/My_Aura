'use client';

import { toast as hotToast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const isDestructive = variant === 'destructive';

    hotToast.custom(
      () => (
        <div
          className={cn(
            // Foundation classes
            'px-6 py-4 rounded-lg shadow-lg max-w-[400px]',
            'transition-all duration-300 animate-in slide-in-from-top-2',
            // Conditional classes
            isDestructive
              ? 'bg-destructive text-destructive-foreground border border-destructive/20'
              : 'bg-primary text-primary-foreground border border-primary/20'
          )}
        >
          <div className="font-semibold text-base mb-1">{title}</div>
          {description && (
            <div className="text-sm opacity-90 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      ),
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }
    );
  };

  return { toast };
}
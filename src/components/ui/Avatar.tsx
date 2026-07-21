'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-20 h-20 text-2xl',
    };

    const [imageError, setImageError] = React.useState(false);

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/5',
            sizes[size],
            className
          )}
          {...props}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ''}
            onError={() => setImageError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        </div>
      );
    }

    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5',
          'bg-gradient-to-br from-primary-400 to-primary-600',
          sizes[size],
          className
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };

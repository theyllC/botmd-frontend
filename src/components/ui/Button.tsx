import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-100 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-sm',
      secondary:
        'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-400 border border-secondary-200',
      ghost:
        'bg-transparent hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-400',
      destructive:
        'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-sm',
      outline:
        'border border-secondary-300 bg-white hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-400',
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs rounded-md h-7',
      md: 'px-3.5 py-1.5 text-[13px] rounded-md h-8',
      lg: 'px-5 py-2 text-sm rounded-md h-10',
      icon: 'p-1.5 rounded-md h-8 w-8',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

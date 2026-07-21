'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, id, className, ...aria }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none',
          checked ? 'bg-primary-500' : 'bg-secondary-300',
          className
        )}
        {...aria}
      >
        <span
          className={cn(
            'inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

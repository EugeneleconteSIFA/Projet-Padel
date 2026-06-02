'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Bouton minimaliste compatible API shadcn/ui (variant + size).
 * Utilisé par ConversationHeader. Pas de Radix, pas de cva — léger.
 */

type Variant = 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-[var(--court-700)] text-[var(--paper-50)] hover:opacity-90',
  ghost:
    'bg-transparent text-[var(--ink-950)] hover:bg-[var(--bg-muted)]',
  outline:
    'border border-[var(--border-subtle)] bg-transparent text-[var(--ink-950)] hover:bg-[var(--bg-muted)]',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--ink-950)] border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)]',
  destructive:
    'bg-[var(--color-danger,#dc2626)] text-white hover:opacity-90',
  link:
    'bg-transparent text-[var(--court-700)] underline-offset-4 hover:underline',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--court-700)]',
            variantClasses[variant],
            sizeClasses[size],
            className,
          ),
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

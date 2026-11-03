import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-paper-white/70 border border-soft text-text hover:bg-paper-white',
  dark: 'bg-ink text-paper-white hover:bg-ink-hover',
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`${variantClassName[variant]} ${sizeClassName[size]} ${className}`.trim()}
    >
      {icon ? <span className="flex items-center gap-2">{icon}{children}</span> : children}
    </button>
  );
};

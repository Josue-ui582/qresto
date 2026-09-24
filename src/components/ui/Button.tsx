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
  ghost: 'bg-white/70 border border-soft text-text hover:bg-white',
  dark: 'bg-[#1f1a17] text-white hover:bg-[#2c241f]',
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

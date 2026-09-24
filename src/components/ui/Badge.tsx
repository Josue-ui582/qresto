import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      {...props}
      className={`${variant === 'accent' ? 'badge badge-accent' : 'badge'} ${className}`.trim()}
    >
      {children}
    </span>
  );
};

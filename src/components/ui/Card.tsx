import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
}

export const Card: React.FC<CardProps> = ({
  as: Component = 'div',
  className = '',
  children,
  ...props
}) => {
  return React.createElement(
    Component,
    {
      ...props,
      className: `card ${className}`.trim(),
    },
    children,
  );
};

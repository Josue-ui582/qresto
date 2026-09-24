import React from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: 'xl' | 'lg' | 'md';
}

export const Heading: React.FC<HeadingProps> = ({
  as: Component = 'h2',
  size = 'lg',
  className = '',
  children,
  ...props
}) => {
  const sizeClass = size === 'xl' ? 'heading-xl' : size === 'md' ? 'heading-md' : 'heading-lg';

  return React.createElement(
    Component,
    {
      ...props,
      className: `${sizeClass} ${className}`.trim(),
    },
    children,
  );
};

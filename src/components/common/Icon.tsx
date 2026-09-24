import React from 'react';

interface FaIconProps {
  name: string; // e.g., "fa-solid fa-utensils" or "utensils"
  className?: string;
  style?: React.CSSProperties;
}

export const FaIcon: React.FC<FaIconProps> = ({ name, className = '', style }) => {
  // If user passes full class like "fa-solid fa-qrcode"
  const formattedClass = name.includes('fa-') ? name : `fa-solid fa-${name}`;
  return <i className={`${formattedClass} ${className}`} style={style} aria-hidden="true" />;
};

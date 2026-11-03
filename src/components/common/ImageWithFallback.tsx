'use client';

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className: string;
  placeholderClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  placeholderClassName = 'flex h-full w-full items-center justify-center bg-ink-100 text-ink-300',
  referrerPolicy = 'no-referrer',
}) => {
  if (!src) {
    return (
      <div className={placeholderClassName} role="img" aria-label={`${alt} indisponible`}>
        <ImageIcon className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }

  return <ErrorAwareImage
    key={src}
    src={src}
    alt={alt}
    className={className}
    placeholderClassName={placeholderClassName}
    referrerPolicy={referrerPolicy}
  />;
};

const ErrorAwareImage: React.FC<ImageWithFallbackProps & { src: string }> = ({
  src,
  alt,
  className,
  placeholderClassName = 'flex h-full w-full items-center justify-center bg-ink-100 text-ink-300',
  referrerPolicy = 'no-referrer',
}) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className={placeholderClassName} role="img" aria-label={`${alt} indisponible`}>
        <ImageIcon className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      onError={() => setHasError(true)}
    />
  );
};

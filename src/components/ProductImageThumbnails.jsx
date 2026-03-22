import React from 'react';
import { getProductImageList, MAX_PRODUCT_IMAGES } from '../utils/productImages';

/**
 * Renders up to `max` product image thumbnails (defaults to MAX_PRODUCT_IMAGES).
 */
const ProductImageThumbnails = ({
  source,
  max = MAX_PRODUCT_IMAGES,
  sizeClass = 'w-10 h-10',
  className = '',
  fallbackSrc = null,
  alt = '',
}) => {
  const all = getProductImageList(source);
  const urls = all.slice(0, max);
  const overflow = all.length > max ? all.length - max : 0;

  if (urls.length === 0) {
    if (!fallbackSrc) return null;
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={`${sizeClass} object-cover rounded border border-white/10 shrink-0`}
      />
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 items-center ${className}`}>
      {urls.map((url, i) => (
        <img
          key={`${url}-${i}`}
          src={url}
          alt={alt ? `${alt} ${i + 1}` : ''}
          className={`${sizeClass} object-cover rounded border border-white/10 shrink-0`}
        />
      ))}
      {overflow > 0 && (
        <span className='text-[10px] text-gray-400 tabular-nums leading-none px-0.5'>+{overflow}</span>
      )}
    </div>
  );
};

export default ProductImageThumbnails;

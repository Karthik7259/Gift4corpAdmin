export const MAX_PRODUCT_IMAGES = 6;

/**
 * Normalize API `image` field (string | string[] | missing) to a clean URL list, capped at MAX_PRODUCT_IMAGES.
 */
export function getProductImageList(image) {
  if (!image) return [];
  if (Array.isArray(image)) {
    return image.filter((u) => typeof u === 'string' && u.trim() !== '').slice(0, MAX_PRODUCT_IMAGES);
  }
  if (typeof image === 'string' && image.trim() !== '') {
    return [image];
  }
  return [];
}

export function getPrimaryProductImage(image, fallback = null) {
  const list = getProductImageList(image);
  return list[0] ?? fallback;
}

/** Unique image URLs from all line items in an order (for list previews). */
export function getOrderPreviewImages(order, max = MAX_PRODUCT_IMAGES) {
  const seen = new Set();
  const out = [];
  for (const item of order?.items || []) {
    for (const url of getProductImageList(item.image)) {
      if (!seen.has(url)) {
        seen.add(url);
        out.push(url);
        if (out.length >= max) return out;
      }
    }
  }
  return out;
}

/** Aligns with storefront / Shiprocket: apparel 5%, everything else 18%. */
export function isApparelCategory(category) {
  if (!category || typeof category !== 'string') return false
  const c = category.trim().toLowerCase()
  return c === 'apparels' || c === 'apparel'
}

export function getGSTRate(category) {
  return isApparelCategory(category) ? 0.05 : 0.18
}

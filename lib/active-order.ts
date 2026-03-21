const key = (slug: string) => `active_order_${slug}`;

export function getActiveOrder(slug: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key(slug));
}

export function setActiveOrder(slug: string, uuid: string): void {
  localStorage.setItem(key(slug), uuid);
}

export function clearActiveOrder(slug: string): void {
  localStorage.removeItem(key(slug));
}

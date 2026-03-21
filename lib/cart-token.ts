import { v4 as uuidv4 } from 'uuid';

export function getCartToken(slug: string): string {
  const key = `cart_token_${slug}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(key, token);
  }
  return token;
}

export function clearCartToken(slug: string) {
  localStorage.removeItem(`cart_token_${slug}`);
}

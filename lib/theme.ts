import { WorkspaceCustomization } from '@/types/workspace';

export function applyTheme(customization: WorkspaceCustomization) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', customization.primary_color || '#f97316');
  root.style.setProperty('--color-secondary', customization.secondary_color || '#1e293b');
  root.style.setProperty('--color-emphasis', customization.emphasis_color || '#ea580c');
}

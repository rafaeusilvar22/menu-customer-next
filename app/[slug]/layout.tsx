import { ReactNode } from 'react';
import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3018';

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

async function fetchEstablishment(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/public/${slug}`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

async function fetchCustomization(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/public/${slug}/customization`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchEstablishment(slug);
  const name: string = data?.workspace?.name ?? 'Sabora';
  const logo: string | null = data?.workspace?.logo ?? null;
  return {
    title: name,
    description: `Faça seu pedido em ${name}`,
    icons: logo ? { icon: logo, apple: logo } : undefined,
  };
}

export default async function SlugLayout({ children, params }: Props) {
  const { slug } = await params;

  // Fetch customization server-side to inject brand colors in the HTML —
  // eliminates flash of default colors on first render
  const customization = await fetchCustomization(slug);

  const active = customization?.customizations?.[0];
  const cssVars = active
    ? {
        '--color-primary': active.primary_color || '#f97316',
        '--color-secondary': active.secondary_color || '#1e293b',
        '--color-emphasis': active.emphasis_color || '#ea580c',
      }
    : {};

  return (
    <div className="min-h-screen bg-white" style={cssVars as React.CSSProperties}>
      {children}
    </div>
  );
}

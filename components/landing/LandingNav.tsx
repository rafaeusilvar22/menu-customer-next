'use client';

import { useEffect, useState } from 'react';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-secondary)]">
          <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold">
            S
          </span>
          Fastmenu
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#funcionalidades" className="hover:text-[var(--color-primary)] transition-colors">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="hover:text-[var(--color-primary)] transition-colors">
            Como funciona
          </a>
        </nav>

        {/* CTA */}
        <a
          href="#"
          className="bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[var(--color-emphasis)] transition-colors shadow-sm"
        >
          Começar grátis
        </a>
      </div>
    </header>
  );
}

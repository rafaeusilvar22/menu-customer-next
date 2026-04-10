import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CtaBanner } from '@/components/landing/CtaBanner';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Fastmenu — Cardápio Digital para Restaurantes',
  description:
    'Crie seu cardápio digital em minutos. Receba pedidos online, gerencie entregas e personalize sua marca. Grátis para começar.',
};

export default function Home() {
  return (
    <main>
      <LandingNav />
      <HeroSection />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaBanner />
      <LandingFooter />
    </main>
  );
}

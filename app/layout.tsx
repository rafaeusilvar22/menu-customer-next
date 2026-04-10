import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fastmenu',
  description: 'Faça seu pedido online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

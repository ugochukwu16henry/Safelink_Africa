import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'SafeLink Africa — Admin',
  description: 'Admin dashboard for SafeLink Africa safety platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Nav />
          <div className="flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

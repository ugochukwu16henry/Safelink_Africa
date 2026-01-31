'use client';

import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/alerts', label: 'Emergency Alerts' },
  { href: '/reports', label: 'Community Reports' },
];

export function Nav() {
  return (
    <header className="bg-safe-teal text-snow shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            SafeLink Africa
          </Link>
          <nav className="flex gap-6" aria-label="Main navigation">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-snow/90 hover:text-snow font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

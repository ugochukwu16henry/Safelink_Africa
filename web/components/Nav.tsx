'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/alerts', label: 'Emergency Alerts' },
  { href: '/reports', label: 'Community Reports' },
];

export function Nav() {
  const { user, logout, loading } = useAuth();

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
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-snow/90 hover:text-snow font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
            {!loading && (
              user ? (
                <>
                  <span className="text-snow/80 text-sm font-medium truncate max-w-[140px]" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-snow/90 hover:text-snow font-medium transition-colors text-sm"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-snow/90 hover:text-snow font-medium transition-colors">
                    Log in
                  </Link>
                  <Link href="/register" className="text-snow/90 hover:text-snow font-medium transition-colors">
                    Sign up
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

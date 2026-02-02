'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-snow rounded-lg shadow-sm border border-cloud">
      <h1 className="text-2xl font-bold text-safe-teal mb-2">Log in</h1>
      <p className="text-ink-soft mb-6">SafeLink Africa admin</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-cloud rounded-lg text-ink focus:ring-2 focus:ring-safe-teal focus:border-safe-teal"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-cloud rounded-lg text-ink focus:ring-2 focus:ring-safe-teal focus:border-safe-teal"
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-sos-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-safe-teal text-snow font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-soft">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-safe-teal font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

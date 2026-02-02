'use client';

import { useState, useEffect, useCallback } from 'react';

const EMERGENCY_API = process.env.NEXT_PUBLIC_EMERGENCY_API || 'http://localhost:4002';

interface Alert {
  id: string;
  userId: string;
  status: 'active' | 'resolved' | 'cancelled';
  latitude: number;
  longitude: number;
  triggeredAt: string;
  resolvedAt?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${EMERGENCY_API}/emergency`);
      if (!res.ok) throw new Error('Failed to load alerts');
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot reach Emergency service. Is it running on port 4002?');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Emergency Alerts</h1>
          <p className="text-ink-soft">
            Live one-tap SOS alerts from the SafeLink Africa app. Data from Emergency service (port 4002).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAlerts}
          disabled={loading}
          className="px-4 py-2 bg-safe-teal text-snow rounded-lg font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-sos-red-light border border-sos-red rounded-lg text-sos-red">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-ink-soft">Run the Emergency service: <code className="bg-sky px-1 rounded">cd services/emergency && npm run dev</code></p>
        </div>
      )}

      {loading && alerts.length === 0 && !error && (
        <div className="p-8 bg-snow rounded-lg shadow-sm border border-cloud text-center text-ink-muted">
          Loading alerts…
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="p-8 bg-snow rounded-lg shadow-sm border border-cloud text-center text-ink-muted">
          <p>No emergency alerts yet.</p>
          <p className="mt-2 text-sm">Trigger an SOS from the mobile app to see alerts here.</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="overflow-x-auto bg-snow rounded-lg shadow-sm border border-cloud">
          <table className="min-w-full divide-y divide-cloud">
            <thead className="bg-sky">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Alert ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-sky/50">
                  <td className="px-4 py-3 text-sm text-ink">{formatTime(alert.triggeredAt)}</td>
                  <td className="px-4 py-3 text-sm text-ink font-mono">{alert.userId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        alert.status === 'active'
                          ? 'bg-sos-red-light text-sos-red'
                          : alert.status === 'resolved'
                            ? 'bg-teal-soft text-safe-teal'
                            : 'bg-cloud text-ink-muted'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft font-mono">
                    {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted font-mono truncate max-w-[180px]" title={alert.id}>
                    {alert.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

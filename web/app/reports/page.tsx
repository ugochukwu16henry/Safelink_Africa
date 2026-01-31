'use client';

import { useState, useEffect, useCallback } from 'react';

const REPORTS_API = process.env.NEXT_PUBLIC_REPORTS_API || 'http://localhost:4003';

interface Report {
  id: string;
  reporterId?: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${REPORTS_API}/reports`);
      if (!res.ok) throw new Error('Failed to load reports');
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot reach Reports service. Is it running on port 4003?');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const statusBadge = (status: Report['status']) => {
    const classes =
      status === 'pending'
        ? 'bg-amber-light text-amber'
        : status === 'reviewed'
          ? 'bg-sky text-ink'
          : 'bg-teal-soft text-safe-teal';
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes}`}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Community Reports</h1>
          <p className="text-ink-soft">
            Review and moderate community safety reports. Data from Reports service (port 4003).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReports}
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
          <p className="text-sm mt-2 text-ink-soft">
            Run the Reports service: <code className="bg-sky px-1 rounded">cd services/reports && npm run dev</code>
          </p>
        </div>
      )}

      {loading && reports.length === 0 && !error && (
        <div className="p-8 bg-snow rounded-lg shadow-sm border border-cloud text-center text-ink-muted">
          Loading reports…
        </div>
      )}

      {!loading && reports.length === 0 && !error && (
        <div className="p-8 bg-snow rounded-lg shadow-sm border border-cloud text-center text-ink-muted">
          <p>No community reports yet.</p>
          <p className="mt-2 text-sm">Reports submitted from the app or API will appear here.</p>
        </div>
      )}

      {reports.length > 0 && (
        <div className="overflow-x-auto bg-snow rounded-lg shadow-sm border border-cloud">
          <table className="min-w-full divide-y divide-cloud">
            <thead className="bg-sky">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Reporter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-sky/50">
                  <td className="px-4 py-3 text-sm text-ink">{formatTime(report.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-ink font-medium">{report.type}</td>
                  <td className="px-4 py-3 text-sm text-ink-soft max-w-[200px] truncate" title={report.description}>
                    {report.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted font-mono">
                    {report.reporterId ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft font-mono">
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(report.status)}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted font-mono truncate max-w-[140px]" title={report.id}>
                    {report.id}
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

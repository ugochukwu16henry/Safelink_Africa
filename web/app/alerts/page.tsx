export default function AlertsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-2">Emergency Alerts</h1>
      <p className="text-ink-soft mb-6">
        View and manage one-tap SOS alerts from the SafeLink Africa app.
      </p>

      <div className="p-8 bg-snow rounded-lg shadow-sm border border-cloud text-center text-ink-muted">
        <p>Alerts list will connect to the Emergency service (GET /emergency) here.</p>
        <p className="mt-2 text-sm">Emergency API: <code className="bg-sky px-1 rounded">http://localhost:4002</code></p>
      </div>
    </div>
  );
}

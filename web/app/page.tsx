export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-safe-teal mb-2">SafeLink Africa</h1>
      <p className="text-xl text-ink-soft mb-1">You&apos;re safe. We&apos;re here.</p>
      <p className="text-ink-soft mb-2">
        Admin dashboard — manage emergency alerts, community reports, and users.
      </p>
      <p className="text-sm text-ink-muted mb-8">
        This app runs at <strong className="text-safe-teal">http://localhost:3000</strong>. The links below are backend APIs (different ports).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Emergency Alerts"
          value="—"
          subtitle="Active alerts"
          href="/alerts"
          accent="sos-red"
        />
        <Card
          title="Community Reports"
          value="—"
          subtitle="Pending review"
          href="/reports"
          accent="amber"
        />
        <Card
          title="Services"
          value="2"
          subtitle="Auth & Emergency"
          accent="safe-teal"
        />
      </div>

      <section className="mt-10 p-6 bg-snow rounded-lg shadow-sm border border-cloud">
        <h2 className="text-lg font-semibold text-ink mb-2">Backend API health (open in new tab)</h2>
        <ul className="space-y-2 text-ink-soft">
          <li>
            <a href="http://localhost:4001/health" target="_blank" rel="noopener noreferrer" className="text-safe-teal hover:underline">
              Auth service — localhost:4001
            </a>
          </li>
          <li>
            <a href="http://localhost:4002/health" target="_blank" rel="noopener noreferrer" className="text-safe-teal hover:underline">
              Emergency service — localhost:4002
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
  href,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  href?: string;
  accent: 'safe-teal' | 'amber' | 'sos-red';
}) {
  const borderClass =
    accent === 'safe-teal'
      ? 'border-l-safe-teal'
      : accent === 'amber'
        ? 'border-l-amber'
        : 'border-l-sos-red';

  const content = (
    <div className={`p-6 bg-snow rounded-lg shadow-sm border border-cloud border-l-4 ${borderClass}`}>
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
      <p className="text-sm text-ink-soft mt-1">{subtitle}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-95 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

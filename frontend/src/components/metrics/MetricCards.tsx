import { CoreMetrics } from '@/lib/types';
import { formatCop, formatNumber, formatRoas } from '@/lib/format';

interface Props {
  metrics: CoreMetrics;
}

export function MetricCards({ metrics }: Props) {
  const cards = [
    { label: 'Ingreso real (POS)', value: formatCop(metrics.realRevenue) },
    { label: 'Inversión total', value: formatCop(metrics.totalSpend) },
    {
      label: 'ROAS real',
      value: formatRoas(metrics.realRoas),
      accent: metrics.realRoas < 1 ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      label: 'ROAS plataforma',
      value: formatRoas(metrics.platformRoas),
      accent: 'text-sky-400',
    },
    { label: 'Conversiones', value: formatNumber(metrics.conversions) },
    { label: 'Ticket promedio', value: formatCop(metrics.averageTicket) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
        >
          <p className="text-xs text-slate-400">{c.label}</p>
          <p className={`mt-2 text-lg font-semibold ${c.accent ?? ''}`}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

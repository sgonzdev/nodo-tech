import { AudienceOriginRow } from '@/lib/types';
import { formatCop, formatRoas } from '@/lib/format';

interface Props {
  rows: AudienceOriginRow[];
}

const LABELS: Record<string, string> = {
  fria: 'Fría',
  warm: 'Warm',
  base_propia: 'Base propia',
};

export function AudienceInsight({ rows }: Props) {
  if (rows.length === 0) return null;
  const best = rows[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-1 text-sm font-medium text-slate-300">
        Origen de audiencia por ROAS real
      </h3>
      <p className="mb-3 text-xs text-emerald-400">
        Mejor origen: {LABELS[best.audienceOrigin]} ({formatRoas(best.realRoas)})
      </p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.audienceOrigin}
            className="flex items-center justify-between text-sm"
          >
            <span>{LABELS[r.audienceOrigin] ?? r.audienceOrigin}</span>
            <span className="text-slate-400">
              {formatCop(r.attributedRevenue)} ·{' '}
              <span
                className={
                  r.realRoas < 1 ? 'text-rose-400' : 'text-emerald-400'
                }
              >
                {formatRoas(r.realRoas)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

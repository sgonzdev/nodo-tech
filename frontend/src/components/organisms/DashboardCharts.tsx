'use client';

import { CampaignRow } from '@/lib/types';
import { formatCop, formatRoas, formatPct } from '@/lib/format';
import { campaignColor, shortName } from '@/lib/campaign-color';
import {
  ChartTooltip,
  TooltipContent,
  useChartTooltip,
} from '@/components/atoms/ChartTooltip';

interface Props {
  rows: CampaignRow[];
}

export function RevenueChart({ rows }: Props) {
  const { tip, show, move, hide } = useChartTooltip();
  const max = Math.max(1, ...rows.map((r) => r.attributedRevenue));
  const total = rows.reduce((s, r) => s + r.attributedRevenue, 0);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Ingreso atribuido por campaña</div>
          <div className="card-sub">
            Ventas reales (POS) repartidas según el modelo activo
          </div>
        </div>
        <div className="chart-total num">{formatCop(total)}</div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-mini">Sin datos en el rango</div>
      ) : (
        rows.map((r, i) => {
          const color = campaignColor(i);
          const share = total > 0 ? (r.attributedRevenue / total) * 100 : 0;
          const content: TooltipContent = {
            title: r.name,
            rows: [
              { label: 'Ingreso atribuido', value: formatCop(r.attributedRevenue), color },
              { label: 'ROAS real', value: formatRoas(r.realRoas) },
              { label: 'Del total', value: `${share.toFixed(1)}%` },
            ],
          };
          return (
            <div
              className="bar-row"
              key={r.campaignId}
              onMouseEnter={(e) => show(content, e)}
              onMouseMove={move}
              onMouseLeave={hide}
            >
              <div className="bl" title={r.name}>
                <span className="bl-dot" style={{ background: color }} />
                {shortName(r.name)}
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(Math.max(0, r.attributedRevenue) / max) * 100}%`,
                    background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  }}
                />
              </div>
              <div className="bv">
                {formatCop(r.attributedRevenue)}
                <span className="bv-share num">{share.toFixed(0)}%</span>
              </div>
            </div>
          );
        })
      )}
      <ChartTooltip tip={tip} />
    </div>
  );
}

export function RoasCompareChart({ rows }: Props) {
  const { tip, show, move, hide } = useChartTooltip();
  const max =
    Math.max(1, ...rows.flatMap((r) => [r.realRoas, r.platformRoas])) * 1.08;
  const onePct = (1 / max) * 100;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">ROAS real vs plataforma</div>
          <div className="card-sub">La línea punteada marca ROAS = 1,0× (equilibrio)</div>
        </div>
        <div className="legend">
          <span>
            <i style={{ background: 'var(--good)' }} />
            Real
          </span>
          <span>
            <i style={{ background: 'var(--plat)' }} />
            Plataforma
          </span>
        </div>
      </div>
      <div className="roas-chart">
        {rows.length === 0 ? (
          <div className="empty-mini">Sin datos en el rango</div>
        ) : (
          rows.map((r) => {
            const content: TooltipContent = {
              title: r.name,
              rows: [
                { label: 'ROAS real', value: formatRoas(r.realRoas), color: 'var(--good)' },
                {
                  label: 'ROAS plataforma',
                  value: formatRoas(r.platformRoas),
                  color: 'var(--plat)',
                },
                { label: 'Diferencia', value: formatPct(r.reconciliationDiffPct) },
              ],
            };
            return (
              <div
                className="roas-grp"
                key={r.campaignId}
                onMouseEnter={(e) => show(content, e)}
                onMouseMove={move}
                onMouseLeave={hide}
              >
                <div className="rg-top">
                  <span className="rg-name">{shortName(r.name)}</span>
                  <span className={'rg-diff ' + (r.flagged ? 'amber' : 'calm')}>
                    {r.flagged ? '⚠ ' : ''}
                    {formatPct(r.reconciliationDiffPct)} vs píxel
                  </span>
                </div>
                <div className="roas-bars">
                  <RoasBar value={r.realRoas} max={max} onePct={onePct} kind="real" />
                  <RoasBar value={r.platformRoas} max={max} onePct={onePct} kind="plat" />
                </div>
              </div>
            );
          })
        )}
      </div>
      <ChartTooltip tip={tip} />
    </div>
  );
}

function RoasBar({
  value,
  max,
  onePct,
  kind,
}: {
  value: number;
  max: number;
  onePct: number;
  kind: 'real' | 'plat';
}) {
  const color =
    kind === 'plat' ? 'var(--plat)' : value >= 1 ? 'var(--good)' : 'var(--alert)';
  return (
    <div className="roas-line">
      <span className="rl-dot" style={{ background: color }} />
      <div className="rl-track">
        <div
          className={'rl-fill ' + kind}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
        <div className="baseline-1" style={{ left: `${onePct}%` }} />
      </div>
      <span className="rl-val" style={{ color }}>
        {formatRoas(value)}
      </span>
    </div>
  );
}

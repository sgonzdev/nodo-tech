import { CoreMetrics } from '@/lib/types';
import { formatCop, formatRoas, formatPct } from '@/lib/format';

interface Props {
  metrics: CoreMetrics;
}

export function ReconHero({ metrics }: Props) {
  const { realRevenue, totalSpend, realRoas, platformRoas } = metrics;
  const platformRevenue = platformRoas * totalSpend;
  const diff = realRevenue > 0 ? ((platformRevenue - realRevenue) / realRevenue) * 100 : 0;
  const gap = Math.abs(platformRevenue - realRevenue);
  const platHigher = platformRevenue > realRevenue;

  return (
    <div className="hero">
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Reconciliación · la diferencia con Meta a la vista
      </div>
      <div className="hero-grid">
        <div className="hero-col real">
          <div className="hc-label">
            <span className="pill" style={{ background: 'var(--good)' }} />
            ROAS Real · POS
          </div>
          <div className="hc-roas num">{formatRoas(realRoas)}</div>
          <div className="hc-rev num">{formatCop(realRevenue)} atribuidos a ventas</div>
        </div>
        <div className="hero-vs">vs</div>
        <div className="hero-col plat">
          <div className="hc-label">
            <span className="pill" style={{ background: 'var(--plat)' }} />
            ROAS Plataforma · Píxel
          </div>
          <div className="hc-roas num">{formatRoas(platformRoas)}</div>
          <div className="hc-rev num">{formatCop(platformRevenue)} reportados por Meta</div>
        </div>
        <div className="hero-delta">
          <div className="hd-eyebrow">
            {platHigher ? '⚠ La plataforma sobre-reporta' : '◆ La plataforma sub-reporta'}
          </div>
          <div className="hd-big num">{formatPct(diff)}</div>
          <div className="hd-text">
            {platHigher ? (
              <span>
                Meta se atribuye <b>{formatCop(platformRevenue)}</b> pero el POS solo
                confirma <b>{formatCop(realRevenue)}</b> en ventas reales. NodoTech revela{' '}
                <b>{formatCop(gap)}</b> de ingreso fantasma.
              </span>
            ) : (
              <span>
                El píxel solo ve <b>{formatCop(platformRevenue)}</b>, pero las ventas reales
                (POS) suman <b>{formatCop(realRevenue)}</b>. NodoTech acredita{' '}
                <b>{formatCop(gap)}</b> que Meta no ve.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

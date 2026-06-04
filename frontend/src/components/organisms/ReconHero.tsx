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
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        {platHigher
          ? 'Cuidado: Meta te muestra más de lo que de verdad vendiste'
          : 'Buenas noticias: vendiste más de lo que Meta te muestra'}
      </div>
      <div className="hero-grid">
        <div className="hero-col real">
          <div className="hc-label">
            <span className="pill" style={{ background: 'var(--good)' }} />
            Lo que de verdad rindió
          </div>
          <div className="hc-roas num">{formatRoas(realRoas)}</div>
          <div className="hc-rev num">{formatCop(realRevenue)} en ventas confirmadas</div>
        </div>
        <div className="hero-vs">frente a</div>
        <div className="hero-col plat">
          <div className="hc-label">
            <span className="pill" style={{ background: 'var(--plat)' }} />
            Lo que Meta te decía
          </div>
          <div className="hc-roas num">{formatRoas(platformRoas)}</div>
          <div className="hc-rev num">{formatCop(platformRevenue)} reportados por Meta</div>
        </div>
        <div className="hero-delta">
          <div className="hd-eyebrow">La diferencia</div>
          <div className="hd-big num">{formatPct(diff)}</div>
          <div className="hd-text">
            {platHigher ? (
              <span>
                Meta exageraba un <b>{formatPct(Math.abs(diff))}</b>: decía haberte
                traído <b>{formatCop(platformRevenue)}</b>, pero en caja solo entraron{' '}
                <b>{formatCop(realRevenue)}</b>. Esa diferencia de <b>{formatCop(gap)}</b>{' '}
                son ventas que nunca ocurrieron.
              </span>
            ) : (
              <span>
                Meta se quedaba corto: solo veía <b>{formatCop(platformRevenue)}</b>, pero
                en caja entraron <b>{formatCop(realRevenue)}</b>. Hay <b>{formatCop(gap)}</b>{' '}
                en ventas reales que Meta no te acreditaba.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

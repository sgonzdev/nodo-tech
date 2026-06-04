import { CoreMetrics } from '@/lib/types';
import { formatCop, formatNumber, formatRoas } from '@/lib/format';

interface Props {
  metrics: CoreMetrics;
}

export function MetricCards({ metrics }: Props) {
  const realTone = metrics.realRoas >= 1 ? 'good' : 'alert';
  const per1000 = formatCop(metrics.realRoas * 1000);

  return (
    <div className="metrics">
      <div className="metric">
        <div className="m-top">
          <span className="m-label">Lo que invertiste</span>
        </div>
        <div className="m-value num">{formatCop(metrics.totalSpend)}</div>
        <div className="m-sub">Dinero que pusiste en publicidad</div>
      </div>

      <div className="metric">
        <div className="m-top">
          <span className="m-label">Lo que vendiste de verdad</span>
        </div>
        <div className="m-value num">{formatCop(metrics.realRevenue)}</div>
        <div className="m-sub">Ventas confirmadas en caja (no estimadas)</div>
      </div>

      <div className={`metric ${realTone} hl`}>
        <div className="m-top">
          <span className="m-label">Retorno real</span>
        </div>
        <div className="m-value num">{formatRoas(metrics.realRoas)}</div>
        <div className="m-help">
          Por cada <b>$1.000</b> invertidos, recuperaste <b>{per1000}</b> en ventas.
        </div>
      </div>

      <div className="metric">
        <div className="m-top">
          <span className="m-label">Ventas logradas</span>
        </div>
        <div className="m-value num">{formatNumber(metrics.conversions)}</div>
        <div className="m-sub">Compras de clientes tras ver tus campañas</div>
      </div>
    </div>
  );
}

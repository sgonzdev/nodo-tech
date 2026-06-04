import { CoreMetrics } from '@/lib/types';
import { formatCop, formatNumber, formatRoas } from '@/lib/format';
import { Icons } from '@/components/atoms/Icons';

interface Props {
  metrics: CoreMetrics;
}

interface Card {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: string;
  sub: React.ReactNode;
}

export function MetricCards({ metrics }: Props) {
  const realTone = metrics.realRoas >= 1 ? 'good' : 'alert';
  const cards: Card[] = [
    {
      label: 'Ingreso real (POS)',
      value: formatCop(metrics.realRevenue),
      icon: <Icons.money />,
      sub: (
        <span>
          <span className="delta neutral">POS · cruzado</span> ventas verificadas
        </span>
      ),
    },
    {
      label: 'Inversión total',
      value: formatCop(metrics.totalSpend),
      icon: <Icons.invest />,
      sub: <span>ad spend en campañas del scope</span>,
    },
    {
      label: 'ROAS real (atribuido)',
      value: formatRoas(metrics.realRoas),
      icon: <Icons.target />,
      tone: realTone,
      sub: (
        <span>
          <span className={'delta ' + (metrics.realRoas >= 1 ? 'up' : 'down')}>
            {metrics.realRoas >= 1 ? 'rentable' : 'bajo umbral'}
          </span>
          ingreso ÷ inversión
        </span>
      ),
    },
    {
      label: 'ROAS plataforma (píxel)',
      value: formatRoas(metrics.platformRoas),
      icon: <Icons.pixel />,
      tone: 'plat',
      sub: (
        <span>
          <span className="delta neutral">reportado por Meta</span> sin verificar
        </span>
      ),
    },
    {
      label: 'Conversiones',
      value: formatNumber(metrics.conversions),
      icon: <Icons.cart />,
      sub: <span>ventas POS atribuidas en el rango</span>,
    },
    {
      label: 'Ticket promedio',
      value: formatCop(metrics.averageTicket),
      icon: <Icons.ticket />,
      sub: <span>{metrics.conversions} ventas reales</span>,
    },
  ];

  return (
    <div className="metrics">
      {cards.map((c) => (
        <div
          key={c.label}
          className={
            'metric' +
            (c.tone ? ' ' + c.tone : '') +
            (c.tone === 'good' || c.tone === 'alert' ? ' hl' : '')
          }
        >
          <div className="m-top">
            <span className="m-label">{c.label}</span>
            <span className="m-ico">{c.icon}</span>
          </div>
          <div className="m-value num">{c.value}</div>
          <div className="m-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

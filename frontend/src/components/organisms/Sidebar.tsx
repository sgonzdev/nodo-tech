'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/queries';
import { CoreMetrics } from '@/lib/types';
import { formatRoas } from '@/lib/format';
import { Icons } from '@/components/atoms/Icons';
import { Logo } from '@/components/atoms/Logo';

export type Section = 'resumen' | 'recon' | 'campanas' | 'acciones';

interface Props {
  section: Section;
  onSection: (s: Section) => void;
  metrics?: CoreMetrics;
  recsCount: number;
}

const NAV: { id: Section; label: string; icon: keyof typeof Icons }[] = [
  { id: 'resumen', label: 'Resumen', icon: 'target' },
  { id: 'recon', label: 'Reconciliación', icon: 'pixel' },
  { id: 'campanas', label: 'Campañas', icon: 'invest' },
  { id: 'acciones', label: 'Acciones', icon: 'bolt' },
];

export function Sidebar({ section, onSection, metrics, recsCount }: Props) {
  const me = useQuery({ queryKey: ['me'], queryFn: authApi.me });
  const roas = metrics?.realRoas ?? 0;
  const health = Math.max(0, Math.min(100, Math.round((roas / 3) * 100)));

  return (
    <aside className="side">
      <div className="side-brand">
        <Logo />
        <div>
          <div className="brand-name">
            Nodo<b>Tech</b>
          </div>
          <div className="brand-sub">Resultados de marketing</div>
        </div>
      </div>

      <div className="tenant">
        <span className="dot" />
        <div>
          <div className="t-name">{me.data?.email ?? 'Cargando…'}</div>
          <div className="t-city">Tienda Aurora · COL</div>
        </div>
        <Icons.chev className="chev" style={{ marginLeft: 'auto' }} />
      </div>

      <nav className="side-nav">
        <div className="nav-label">Tu negocio</div>
        {NAV.map((n) => {
          const Icon = Icons[n.icon];
          return (
            <button
              key={n.id}
              className={'nav-item' + (section === n.id ? ' on' : '')}
              onClick={() => onSection(n.id)}
            >
              <Icon />
              <span>{n.label}</span>
              {n.id === 'acciones' && recsCount > 0 && (
                <span className="nav-badge">{recsCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="health">
          <div className="h-l">Salud de tu inversión</div>
          <div
            className="h-v num"
            style={{ color: roas >= 1 ? 'var(--good)' : 'var(--alert)' }}
          >
            {formatRoas(roas)}
          </div>
          <div className="h-track">
            <div className="h-fill" style={{ width: `${health}%` }} />
          </div>
          <div className="h-cap">
            {roas >= 1
              ? 'Por encima de 1× — tu plata rinde'
              : 'Por debajo de 1× — estás perdiendo'}
          </div>
        </div>
      </div>
    </aside>
  );
}

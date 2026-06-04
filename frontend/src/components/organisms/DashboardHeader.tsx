'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/queries';
import { API_URL, buildQuery } from '@/lib/api';
import { DashboardFilters } from '@/lib/types';
import { Icons } from '@/components/atoms/Icons';
import { Logo } from '@/components/atoms/Logo';

interface Props {
  filters: DashboardFilters;
  onRefresh: () => void;
  refreshing: boolean;
}

export function DashboardHeader({ filters, onRefresh, refreshing }: Props) {
  const router = useRouter();
  const me = useQuery({ queryKey: ['me'], queryFn: authApi.me });
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function logout() {
    await authApi.logout();
    router.replace('/login');
    router.refresh();
  }

  const exportUrl = (format: 'csv' | 'pdf') =>
    `${API_URL}/reports/export${buildQuery({ ...filters, format })}`;
  const businessId = me.data?.businessId ?? '';

  return (
    <header className="hd">
      <div className="brand">
        <Logo />
        <div>
          <div className="brand-name">
            Nodo<b>Tech</b>
          </div>
          <div className="brand-sub">Marketing · Análisis 07</div>
        </div>
      </div>

      <div className="tenant" title="Negocio activo (multi-tenant)">
        <span className="dot" />
        <div>
          <div className="t-name">{me.data?.email ?? 'Cargando…'}</div>
          <div className="t-city">Startup Tech· COL</div>
        </div>
        <Icons.chev className="chev" />
      </div>

      <div className="hd-spacer" />

      {businessId && (
        <span className="hd-id">business: {businessId.slice(0, 8)}…</span>
      )}

      <button
        className="btn btn-icon"
        title="Recalcular"
        onClick={onRefresh}
        style={{ opacity: refreshing ? 0.6 : 1 }}
      >
        <Icons.refresh
          style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
        />
      </button>

      <div className="menu-wrap" ref={exportRef}>
        <button className="btn" onClick={() => setExportOpen((o) => !o)}>
          <Icons.download /> Exportar
          <Icons.chev style={{ width: 12, height: 12 }} />
        </button>
        {exportOpen && (
          <div className="menu">
            <div className="menu-label">Formato</div>
            <a
              className="menu-item"
              href={exportUrl('pdf')}
              onClick={() => setExportOpen(false)}
            >
              <Icons.download style={{ width: 14, height: 14 }} /> PDF para
              stakeholders
            </a>
            <a
              className="menu-item"
              href={exportUrl('csv')}
              onClick={() => setExportOpen(false)}
            >
              <Icons.download style={{ width: 14, height: 14 }} /> CSV (datos)
            </a>
          </div>
        )}
      </div>
      <button className="btn btn-ghost" onClick={logout}>
        <Icons.exit /> Salir
      </button>
    </header>
  );
}

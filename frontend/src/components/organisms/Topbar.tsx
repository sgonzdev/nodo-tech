'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/queries';
import { API_URL, buildQuery } from '@/lib/api';
import { DashboardFilters } from '@/lib/types';
import { Icons } from '@/components/atoms/Icons';

interface Props {
  crumb: string;
  filters: DashboardFilters;
  onRefresh: () => void;
  refreshing: boolean;
}

export function Topbar({ crumb, filters, onRefresh, refreshing }: Props) {
  const router = useRouter();
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

  return (
    <div className="topbar">
      <div className="crumbs">
        Panel <Icons.chevR /> <b>{crumb}</b>
      </div>
      <div className="topbar-actions">
        <button
          className="btn btn-icon"
          title="Actualizar"
          onClick={onRefresh}
          style={{ opacity: refreshing ? 0.6 : 1 }}
        >
          <Icons.refresh
            style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
          />
        </button>
        <div className="menu-wrap" ref={exportRef}>
          <button className="btn" onClick={() => setExportOpen((o) => !o)}>
            <Icons.download /> Descargar
            <Icons.chev style={{ width: 12, height: 12 }} />
          </button>
          {exportOpen && (
            <div className="menu">
              <div className="menu-label">Formato</div>
              <a className="menu-item" href={exportUrl('pdf')} onClick={() => setExportOpen(false)}>
                <Icons.download style={{ width: 14, height: 14 }} /> PDF para stakeholders
              </a>
              <a className="menu-item" href={exportUrl('csv')} onClick={() => setExportOpen(false)}>
                <Icons.download style={{ width: 14, height: 14 }} /> CSV (datos)
              </a>
            </div>
          )}
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          <Icons.exit /> Salir
        </button>
      </div>
    </div>
  );
}

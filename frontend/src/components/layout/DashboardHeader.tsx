'use client';

import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/queries';
import { API_URL, buildQuery } from '@/lib/api';
import { DashboardFilters } from '@/lib/types';

interface Props {
  filters: DashboardFilters;
}

export function DashboardHeader({ filters }: Props) {
  const router = useRouter();

  async function logout() {
    await authApi.logout();
    router.replace('/login');
    router.refresh();
  }

  const csvUrl = `${API_URL}/reports/export.csv${buildQuery({ ...filters })}`;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">Análisis · Marketing</h1>
        <p className="text-sm text-slate-400">
          ROAS reconciliado contra ventas reales (POS)
        </p>
      </div>
      <div className="flex gap-2">
        <a
          href={csvUrl}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Exportar CSV
        </a>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

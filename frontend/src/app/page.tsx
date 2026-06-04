'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/queries';
import { CampaignRow, DashboardFilters } from '@/lib/types';
import { DashboardShell } from '@/components/templates/DashboardShell';
import { DashboardHeader } from '@/components/organisms/DashboardHeader';
import { FilterBar } from '@/components/organisms/FilterBar';
import { MetricCards } from '@/components/molecules/MetricCards';
import { ReconHero } from '@/components/organisms/ReconHero';
import { RevenueChart, RoasCompareChart } from '@/components/organisms/DashboardCharts';
import { CampaignTable } from '@/components/organisms/CampaignTable';
import { ActionCenter } from '@/components/organisms/ActionCenter';
import { DrillDrawer } from '@/components/organisms/DrillDrawer';
import { Toasts, ToastItem } from '@/components/molecules/Toasts';
import {
  DashboardSkeleton,
  EmptyState,
  ErrorState,
} from '@/components/molecules/States';

const DEFAULT_FILTERS: DashboardFilters = { model: 'linear', windowDays: 30 };

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [drill, setDrill] = useState<{ row: CampaignRow; index: number } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const patch = (p: Partial<DashboardFilters>) => setFilters((f) => ({ ...f, ...p }));

  const toast = useCallback((msg: string, sub: string | null, kind: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, msg, sub, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  const metrics = useQuery({
    queryKey: ['metrics', filters],
    queryFn: () => reportsApi.metrics(filters),
  });
  const campaigns = useQuery({
    queryKey: ['by-campaign', filters],
    queryFn: () => reportsApi.byCampaign(filters),
  });

  const onRefresh = () => {
    metrics.refetch();
    campaigns.refetch();
    toast('Reporte recalculado', 'Cruce marketing × POS actualizado', 'ok');
  };

  const rows = campaigns.data ?? [];
  const firstLoad = metrics.isPending || campaigns.isPending;
  const isError = metrics.isError || campaigns.isError;
  const isEmpty = !firstLoad && !isError && rows.length === 0;
  const refetching = metrics.isFetching || campaigns.isFetching;

  return (
    <>
      <DashboardShell
        header={
          <DashboardHeader filters={filters} onRefresh={onRefresh} refreshing={metrics.isFetching} />
        }
        filters={<FilterBar filters={filters} campaigns={rows} onChange={patch} />}
        main={
          <>
            {firstLoad && <DashboardSkeleton />}
            {!firstLoad && isError && <ErrorState onRetry={onRefresh} />}
            {!firstLoad && !isError && isEmpty && (
              <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
            )}
            {!firstLoad && !isError && !isEmpty && (
              <div
                style={{
                  opacity: refetching ? 0.6 : 1,
                  transition: 'opacity 0.18s ease',
                }}
              >
                <div className="eyebrow" style={{ marginBottom: 14 }}>
                  Métricas core · ventana {filters.windowDays}d
                </div>
                {metrics.data && <MetricCards metrics={metrics.data} />}
                {metrics.data && <ReconHero metrics={metrics.data} />}
                <div className="section-head">
                  <div className="section-title">Desempeño por campaña</div>
                  <div className="section-note">
                    Atribución conmutable · totales agregados en servidor
                  </div>
                </div>
                <div className="grid-2">
                  <RevenueChart rows={rows} />
                  <RoasCompareChart rows={rows} />
                </div>
                <div className="section-head">
                  <div className="section-title">Reconciliación por campaña</div>
                  <div className="section-note">
                    Filas en ámbar superan 5% de diferencia · clic para drill-down
                  </div>
                </div>
                <CampaignTable
                  rows={rows}
                  onDrill={(id) => {
                    const index = rows.findIndex((r) => r.campaignId === id);
                    setDrill({ row: rows[index], index });
                  }}
                />
              </div>
            )}
          </>
        }
        rail={<ActionCenter filters={filters} onToast={toast} />}
      />
      {drill && (
        <DrillDrawer campaign={drill.row} index={drill.index} onClose={() => setDrill(null)} />
      )}
      <Toasts items={toasts} />
    </>
  );
}

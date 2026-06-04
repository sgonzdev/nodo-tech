'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, actionCenterApi } from '@/lib/queries';
import { CampaignRow, DashboardFilters } from '@/lib/types';
import { Sidebar, Section } from '@/components/organisms/Sidebar';
import { Topbar } from '@/components/organisms/Topbar';
import { FilterBar } from '@/components/organisms/FilterBar';
import { MetricCards } from '@/components/molecules/MetricCards';
import { ReconHero } from '@/components/organisms/ReconHero';
import {
  SourceDonut,
  RevenueBars,
  RoasBars,
} from '@/components/organisms/CampaignCharts';
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
const SECTION_LABEL: Record<Section, string> = {
  resumen: 'Resumen',
  recon: 'Reconciliación',
  campanas: 'Campañas',
  acciones: 'Acciones',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [section, setSection] = useState<Section>('resumen');
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
  const campaignOptions = useQuery({
    queryKey: ['campaign-options'],
    queryFn: () => reportsApi.byCampaign({ model: 'linear', windowDays: 30 }),
    staleTime: Infinity,
  });
  const recs = useQuery({
    queryKey: ['recommendations', filters],
    queryFn: () => actionCenterApi.recommendations(filters),
  });

  const onRefresh = () => {
    metrics.refetch();
    campaigns.refetch();
    toast('Reporte actualizado', 'Cruce con ventas reales al día', 'ok');
  };

  const rows = campaigns.data ?? [];
  const firstLoad = metrics.isPending || campaigns.isPending;
  const isError = metrics.isError || campaigns.isError;
  const isEmpty = !firstLoad && !isError && rows.length === 0;
  const refetching = metrics.isFetching || campaigns.isFetching;

  const sectionNote =
    filters.campaignId && campaignOptions.data
      ? campaignOptions.data.find((c) => c.campaignId === filters.campaignId)?.name ??
        'todas las campañas'
      : 'todas las campañas';

  return (
    <div className="shell">
      <Sidebar
        section={section}
        onSection={setSection}
        metrics={metrics.data}
        recsCount={recs.data?.length ?? 0}
      />
      <div className="content">
        <Topbar
          crumb={SECTION_LABEL[section]}
          filters={filters}
          onRefresh={onRefresh}
          refreshing={metrics.isFetching}
        />
        <FilterBar
          filters={filters}
          campaigns={campaignOptions.data ?? rows}
          onChange={patch}
        />
        <div className="view">
          {firstLoad && <DashboardSkeleton />}
          {!firstLoad && isError && <ErrorState onRetry={onRefresh} />}
          {!firstLoad && !isError && isEmpty && (
            <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
          )}
          {!firstLoad && !isError && !isEmpty && (
            <div
              className="view-in"
              key={section}
              style={{ opacity: refetching ? 0.6 : 1, transition: 'opacity 0.18s ease' }}
            >
              {section === 'resumen' && (
                <>
                  <ViewHead title="Tu resumen" note={sectionNote} />
                  {metrics.data && <ReconHero metrics={metrics.data} />}
                  {metrics.data && <MetricCards metrics={metrics.data} />}
                </>
              )}
              {section === 'recon' && (
                <>
                  <ViewHead
                    title="Reconciliación con Meta"
                    note="Lo que la plataforma reporta frente a lo que de verdad entró en caja"
                  />
                  {metrics.data && <ReconHero metrics={metrics.data} />}
                  <div style={{ height: 16 }} />
                  <RoasBars rows={rows} />
                </>
              )}
              {section === 'campanas' && (
                <>
                  <ViewHead
                    title="Tus campañas"
                    note="Toca cualquiera para ver de dónde vino cada venta"
                  />
                  <div className="grid-2" style={{ marginBottom: 18 }}>
                    <SourceDonut rows={rows} />
                    <RevenueBars rows={rows} />
                  </div>
                  <CampaignTable
                    rows={rows}
                    onDrill={(id) => {
                      const index = rows.findIndex((r) => r.campaignId === id);
                      setDrill({ row: rows[index], index });
                    }}
                  />
                </>
              )}
              {section === 'acciones' && (
                <>
                  <ViewHead
                    title="Qué hacer ahora"
                    note="Consejos claros basados en tus ventas reales"
                  />
                  <ActionCenter filters={filters} onToast={toast} grid />
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {drill && (
        <DrillDrawer campaign={drill.row} index={drill.index} onClose={() => setDrill(null)} />
      )}
      <Toasts items={toasts} />
    </div>
  );
}

function ViewHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="view-head">
      <div className="section-title">{title}</div>
      <div className="section-note">{note}</div>
    </div>
  );
}

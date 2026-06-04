'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/queries';
import { useIsMobile } from '@/lib/use-media-query';
import { CampaignRow, DashboardFilters } from '@/lib/types';
import { DashboardShell } from '@/components/templates/DashboardShell';
import { DashboardHeader } from '@/components/organisms/DashboardHeader';
import { FilterBar } from '@/components/organisms/FilterBar';
import { DashboardMain } from '@/components/organisms/DashboardMain';
import { ActionCenter } from '@/components/organisms/ActionCenter';
import { DrillDrawer } from '@/components/organisms/DrillDrawer';
import { MobileNav, MobileView } from '@/components/molecules/MobileNav';
import { Toasts, ToastItem } from '@/components/molecules/Toasts';
import { Icons } from '@/components/atoms/Icons';

const DEFAULT_FILTERS: DashboardFilters = { model: 'linear', windowDays: 30 };

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [drill, setDrill] = useState<{ row: CampaignRow; index: number } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileView, setMobileView] = useState<MobileView>('dashboard');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const main = (
    <DashboardMain
      metrics={metrics.data}
      rows={rows}
      filters={filters}
      firstLoad={firstLoad}
      isError={isError}
      isEmpty={isEmpty}
      refetching={refetching}
      onRetry={onRefresh}
      onReset={() => setFilters(DEFAULT_FILTERS)}
      onDrill={(row, index) => setDrill({ row, index })}
    />
  );
  const rail = <ActionCenter filters={filters} onToast={toast} />;
  const header = (
    <DashboardHeader filters={filters} onRefresh={onRefresh} refreshing={metrics.isFetching} />
  );
  const filterBar = (
    <FilterBar filters={filters} campaigns={campaignOptions.data ?? rows} onChange={patch} />
  );

  return (
    <>
      {isMobile ? (
        <div className="app">
          {header}
          <MobileNav
            view={mobileView}
            onView={setMobileView}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          <main className="main">{mobileView === 'dashboard' ? main : rail}</main>
          {filtersOpen && (
            <MobileFilterSheet onClose={() => setFiltersOpen(false)}>
              {filterBar}
            </MobileFilterSheet>
          )}
        </div>
      ) : (
        <DashboardShell
          header={header}
          filters={filterBar}
          main={main}
          rail={rail}
        />
      )}
      {drill && (
        <DrillDrawer campaign={drill.row} index={drill.index} onClose={() => setDrill(null)} />
      )}
      <Toasts items={toasts} />
    </>
  );
}

function MobileFilterSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="filter-sheet">
        <div className="filter-sheet-head">
          <span className="section-title">Filtros</span>
          <button className="btn btn-icon" onClick={onClose}>
            <Icons.close />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

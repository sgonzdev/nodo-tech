import { CampaignRow, CoreMetrics, DashboardFilters } from '@/lib/types';
import { MetricCards } from '@/components/molecules/MetricCards';
import { ReconHero } from '@/components/organisms/ReconHero';
import {
  RevenueChart,
  RoasCompareChart,
} from '@/components/organisms/DashboardCharts';
import { CampaignTable } from '@/components/organisms/CampaignTable';
import {
  DashboardSkeleton,
  EmptyState,
  ErrorState,
} from '@/components/molecules/States';

interface Props {
  metrics?: CoreMetrics;
  rows: CampaignRow[];
  filters: DashboardFilters;
  firstLoad: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetching: boolean;
  onRetry: () => void;
  onReset: () => void;
  onDrill: (row: CampaignRow, index: number) => void;
}

export function DashboardMain({
  metrics,
  rows,
  filters,
  firstLoad,
  isError,
  isEmpty,
  refetching,
  onRetry,
  onReset,
  onDrill,
}: Props) {
  if (firstLoad) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (isEmpty) return <EmptyState onReset={onReset} />;

  return (
    <div style={{ opacity: refetching ? 0.6 : 1, transition: 'opacity 0.18s ease' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        Métricas core · ventana {filters.windowDays}d
      </div>
      {metrics && <MetricCards metrics={metrics} />}
      {metrics && <ReconHero metrics={metrics} />}
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
          onDrill(rows[index], index);
        }}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/queries';
import { DashboardFilters } from '@/lib/types';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { FiltersBar } from '@/components/filters/FiltersBar';
import { ConversationalInput } from '@/components/conversational/ConversationalInput';
import { MetricCards } from '@/components/metrics/MetricCards';
import { DashboardCharts } from '@/components/charts/DashboardCharts';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { AudienceInsight } from '@/components/audience/AudienceInsight';
import { ActionCenter } from '@/components/action-center/ActionCenter';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/states/States';

const DEFAULT_FILTERS: DashboardFilters = {
  model: 'linear',
  windowDays: 30,
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const patch = (p: Partial<DashboardFilters>) =>
    setFilters((f) => ({ ...f, ...p }));

  const metrics = useQuery({
    queryKey: ['metrics', filters],
    queryFn: () => reportsApi.metrics(filters),
  });
  const campaigns = useQuery({
    queryKey: ['by-campaign', filters],
    queryFn: () => reportsApi.byCampaign(filters),
  });
  const audience = useQuery({
    queryKey: ['by-audience', filters],
    queryFn: () => reportsApi.byAudienceOrigin(filters),
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <DashboardHeader filters={filters} />
      <ConversationalInput onApply={patch} />
      <FiltersBar
        filters={filters}
        campaigns={campaigns.data ?? []}
        onChange={patch}
      />

      {metrics.isLoading && <LoadingState label="Calculando métricas…" />}
      {metrics.isError && <ErrorState onRetry={() => metrics.refetch()} />}
      {metrics.data && <MetricCards metrics={metrics.data} />}

      <Section query={campaigns}>
        {(rows) =>
          rows.length === 0 ? (
            <EmptyState label="No hay campañas en el rango" />
          ) : (
            <div className="space-y-6">
              <DashboardCharts rows={rows} />
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <CampaignTable rows={rows} />
                </div>
                {audience.data && <AudienceInsight rows={audience.data} />}
              </div>
            </div>
          )
        }
      </Section>

      <ActionCenter filters={filters} />
    </main>
  );
}

function Section<T>({
  query,
  children,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    data?: T[];
    refetch: () => void;
  };
  children: (data: T[]) => React.ReactNode;
}) {
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  return <>{query.data && children(query.data)}</>;
}

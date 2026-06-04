'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/queries';
import { formatCop } from '@/lib/format';
import {
  ErrorState,
  LoadingState,
} from '@/components/states/States';

export default function CampaignDrilldownPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['drilldown', id],
    queryFn: () => reportsApi.drilldown(id),
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/" className="text-sm text-emerald-400 hover:underline">
        ← Volver al dashboard
      </Link>

      {query.isLoading && <LoadingState />}
      {query.isError && <ErrorState onRetry={() => query.refetch()} />}

      {query.data && (
        <>
          <div>
            <h1 className="text-xl font-semibold">{query.data.campaign.name}</h1>
            <p className="text-sm uppercase text-slate-500">
              {query.data.campaign.channel}
            </p>
          </div>

          <Panel title={`Touchpoints (${query.data.touchpoints.length})`}>
            <ul className="divide-y divide-slate-800 text-sm">
              {query.data.touchpoints.map((t) => (
                <li key={t.id} className="flex justify-between py-2">
                  <span>
                    {t.channel} · {t.audienceOrigin}
                  </span>
                  <span className="text-slate-400">
                    {new Date(t.occurredAt).toLocaleDateString('es-CO')}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={`Ventas atribuidas (${query.data.sales.length})`}>
            <ul className="divide-y divide-slate-800 text-sm">
              {query.data.sales.map((s) => (
                <li key={s.id} className="flex justify-between py-2">
                  <span>{formatCop(Number(s.amount))}</span>
                  <span className="text-slate-400">
                    {new Date(s.occurredAt).toLocaleDateString('es-CO')}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-3 text-sm font-medium text-slate-300">{title}</h2>
      {children}
    </div>
  );
}

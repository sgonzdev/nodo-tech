'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CampaignRow } from '@/lib/types';
import { formatCop } from '@/lib/format';

interface Props {
  rows: CampaignRow[];
}

const shortName = (name: string) =>
  name.length > 16 ? `${name.slice(0, 15)}…` : name;

export function DashboardCharts({ rows }: Props) {
  const data = rows.map((r) => ({
    name: shortName(r.name),
    attributed: r.attributedRevenue,
    realRoas: r.realRoas,
    platformRoas: r.platformRoas,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Ingreso atribuido por campaña (POS)">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => `${v / 1_000_000}M`}
          />
          <Tooltip
            formatter={(v) => formatCop(Number(v))}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="attributed" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="ROAS real vs ROAS plataforma">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip
            formatter={(v) => `${Number(v).toFixed(2)}x`}
            contentStyle={tooltipStyle}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="realRoas" name="ROAS real" fill="#34d399" radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="platformRoas"
            name="ROAS plataforma"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartCard>
    </div>
  );
}

const tooltipStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 8,
  fontSize: 12,
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

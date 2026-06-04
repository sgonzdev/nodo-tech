'use client';

import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { CampaignRow } from '@/lib/types';
import { formatCop, formatRoas } from '@/lib/format';
import { campaignColor, shortName } from '@/lib/campaign-color';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const GRID = 'rgba(150,165,200,0.08)';
const TICK = '#98a1b5';

const tooltipStyle = {
  backgroundColor: '#11141b',
  borderColor: 'rgba(150,165,200,0.18)',
  borderWidth: 1,
  titleColor: '#eef1f7',
  bodyColor: '#98a1b5',
  padding: 10,
  cornerRadius: 8,
};

export function SourceDonut({ rows }: { rows: CampaignRow[] }) {
  const segs = rows.filter((r) => r.attributedRevenue > 0);
  const data = {
    labels: segs.map((r) => r.name),
    datasets: [
      {
        data: segs.map((r) => r.attributedRevenue),
        backgroundColor: segs.map((_, i) => campaignColor(i)),
        borderColor: '#0d0f15',
        borderWidth: 2,
      },
    ],
  };
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="card-title">¿De dónde vienen tus ventas?</div>
          <div className="card-sub">Parte de las ventas reales que aportó cada campaña</div>
        </div>
      </div>
      {segs.length === 0 ? (
        <div className="empty-mini">Sin datos en el rango</div>
      ) : (
        <div style={{ height: 240 }}>
          <Doughnut
            data={data}
            options={{
              maintainAspectRatio: false,
              cutout: '62%',
              plugins: {
                legend: { position: 'right', labels: { color: TICK, boxWidth: 12, padding: 12 } },
                tooltip: {
                  ...tooltipStyle,
                  callbacks: {
                    label: (c) => ` ${formatCop(c.parsed)}`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export function RevenueBars({ rows }: { rows: CampaignRow[] }) {
  const data = {
    labels: rows.map((r) => shortName(r.name, 14)),
    datasets: [
      {
        label: 'Ventas reales',
        data: rows.map((r) => r.attributedRevenue),
        backgroundColor: rows.map((_, i) => campaignColor(i)),
        borderRadius: 6,
        maxBarThickness: 46,
      },
    ],
  };
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="card-title">¿Cuánto vendió cada campaña?</div>
          <div className="card-sub">Ventas confirmadas en caja, no estimaciones</div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-mini">Sin datos en el rango</div>
      ) : (
        <div style={{ height: 240 }}>
          <Bar
            data={data}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipStyle,
                  callbacks: { label: (c) => ` ${formatCop(Number(c.parsed.y))}` },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: TICK, font: { size: 11 } } },
                y: {
                  grid: { color: GRID },
                  ticks: {
                    color: TICK,
                    font: { size: 11 },
                    callback: (v) => `${Number(v) / 1_000_000}M`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export function RoasBars({ rows }: { rows: CampaignRow[] }) {
  const data = {
    labels: rows.map((r) => shortName(r.name, 14)),
    datasets: [
      {
        label: 'Retorno real',
        data: rows.map((r) => r.realRoas),
        backgroundColor: '#38d088',
        borderRadius: 5,
        maxBarThickness: 22,
      },
      {
        label: 'Lo que decía Meta',
        data: rows.map((r) => r.platformRoas),
        backgroundColor: '#5b9dff',
        borderRadius: 5,
        maxBarThickness: 22,
      },
    ],
  };
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="card-title">Retorno real vs lo que dice Meta</div>
          <div className="card-sub">La barra verde es lo que de verdad entró en caja</div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-mini">Sin datos en el rango</div>
      ) : (
        <div style={{ height: 260 }}>
          <Bar
            data={data}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: TICK, boxWidth: 12, padding: 14 } },
                tooltip: {
                  ...tooltipStyle,
                  callbacks: { label: (c) => ` ${formatRoas(Number(c.parsed.y))}` },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: TICK, font: { size: 11 } } },
                y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 11 } } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

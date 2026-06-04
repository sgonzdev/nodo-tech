'use client';

import { useState } from 'react';

export interface TooltipContent {
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

export function useChartTooltip() {
  const [tip, setTip] = useState<{
    content: TooltipContent;
    x: number;
    y: number;
  } | null>(null);

  const show = (content: TooltipContent, e: React.MouseEvent) => {
    setTip({ content, x: e.clientX, y: e.clientY });
  };
  const move = (e: React.MouseEvent) => {
    setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  };
  const hide = () => setTip(null);

  return { tip, show, move, hide };
}

export function ChartTooltip({
  tip,
}: {
  tip: { content: TooltipContent; x: number; y: number } | null;
}) {
  if (!tip) return null;
  return (
    <div
      className="chart-tip"
      style={{ left: tip.x + 14, top: tip.y + 14 }}
    >
      <div className="chart-tip-title">{tip.content.title}</div>
      {tip.content.rows.map((r) => (
        <div className="chart-tip-row" key={r.label}>
          <span className="chart-tip-label">
            {r.color && (
              <span className="chart-tip-dot" style={{ background: r.color }} />
            )}
            {r.label}
          </span>
          <span className="chart-tip-val num">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

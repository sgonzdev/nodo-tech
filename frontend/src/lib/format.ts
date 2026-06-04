const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CO');

export function formatCop(value: number): string {
  return copFormatter.format(value ?? 0);
}

export function formatCopShort(value: number): string {
  const v = value ?? 0;
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${Math.round(v)}`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value ?? 0);
}

export function formatRoas(value: number): string {
  return `${(value ?? 0).toFixed(2)}×`;
}

export function formatPct(value: number): string {
  const v = value ?? 0;
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });
}

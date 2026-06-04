const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CO');

export function formatCop(value: number): string {
  return copFormatter.format(value ?? 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value ?? 0);
}

export function formatRoas(value: number): string {
  return `${(value ?? 0).toFixed(2)}x`;
}

export function formatPct(value: number): string {
  const v = value ?? 0;
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}

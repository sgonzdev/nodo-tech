import { AttributedCredit } from './reports.types';

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roas(revenue: number, spend: number): number {
  return spend > 0 ? round2(revenue / spend) : 0;
}

export function diffPct(platform: number, real: number): number {
  if (real <= 0) return platform > 0 ? 100 : 0;
  return round2(((platform - real) / real) * 100);
}

export function sumCredits(credits: AttributedCredit[]): number {
  return round2(credits.reduce((s, c) => s + c.amount, 0));
}

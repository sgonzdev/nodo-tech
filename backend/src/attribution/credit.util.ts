import { CreditedTouchpoint, PathTouchpoint } from './attribution.types';

const CENTS = 100;

export function roundMoney(value: number): number {
  return Math.round(value * CENTS) / CENTS;
}

export function distributeByWeights(
  path: PathTouchpoint[],
  saleAmount: number,
  weights: number[],
): CreditedTouchpoint[] {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (path.length === 0 || totalWeight <= 0) {
    return [];
  }

  const credited = path.map((tp, i) => ({
    ...tp,
    credit: roundMoney((weights[i] / totalWeight) * saleAmount),
  }));

  const assigned = credited.reduce((sum, tp) => sum + tp.credit, 0);
  const residual = roundMoney(saleAmount - assigned);
  credited[credited.length - 1].credit = roundMoney(
    credited[credited.length - 1].credit + residual,
  );

  return credited;
}

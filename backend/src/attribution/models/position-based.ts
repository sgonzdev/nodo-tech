import { AttributionFn } from '../types/attribution.types';
import { distributeByWeights } from '../utils/credit.util';

const FIRST_WEIGHT = 0.4;
const LAST_WEIGHT = 0.4;
const MIDDLE_WEIGHT = 0.2;

export const positionBased: AttributionFn = (path, saleAmount) => {
  const n = path.length;

  if (n === 1) {
    return distributeByWeights(path, saleAmount, [1]);
  }
  if (n === 2) {
    return distributeByWeights(path, saleAmount, [0.5, 0.5]);
  }

  const middleCount = n - 2;
  const weights = path.map((_, i) => {
    if (i === 0) return FIRST_WEIGHT;
    if (i === n - 1) return LAST_WEIGHT;
    return MIDDLE_WEIGHT / middleCount;
  });

  return distributeByWeights(path, saleAmount, weights);
};

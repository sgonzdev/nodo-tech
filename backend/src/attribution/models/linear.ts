import { AttributionFn } from '../types/attribution.types';
import { distributeByWeights } from '../utils/credit.util';

export const linear: AttributionFn = (path, saleAmount) =>
  distributeByWeights(
    path,
    saleAmount,
    path.map(() => 1),
  );

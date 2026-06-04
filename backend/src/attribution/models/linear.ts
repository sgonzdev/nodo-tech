import { AttributionFn } from '../attribution.types';
import { distributeByWeights } from '../credit.util';

export const linear: AttributionFn = (path, saleAmount) =>
  distributeByWeights(
    path,
    saleAmount,
    path.map(() => 1),
  );

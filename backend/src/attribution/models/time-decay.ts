import { AttributionFn } from '../attribution.types';
import { distributeByWeights } from '../credit.util';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const timeDecay: AttributionFn = (path, saleAmount, context) => {
  const halfLife = context.halfLifeDays > 0 ? context.halfLifeDays : 1;
  const weights = path.map((tp) => {
    const daysBefore =
      (context.saleOccurredAt.getTime() - tp.occurredAt.getTime()) / MS_PER_DAY;
    return Math.pow(2, -daysBefore / halfLife);
  });

  return distributeByWeights(path, saleAmount, weights);
};

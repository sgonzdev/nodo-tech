import { AttributionFn } from '../types/attribution.types';
import { distributeByWeights } from '../utils/credit.util';
import { MS_PER_DAY } from '../../domain/constants';

export const timeDecay: AttributionFn = (path, saleAmount, context) => {
  const halfLife = context.halfLifeDays > 0 ? context.halfLifeDays : 1;
  const weights = path.map((tp) => {
    const daysBefore =
      (context.saleOccurredAt.getTime() - tp.occurredAt.getTime()) / MS_PER_DAY;
    //decaimiento exponencial
    return Math.pow(2, -daysBefore / halfLife);
  });

  return distributeByWeights(path, saleAmount, weights);
};

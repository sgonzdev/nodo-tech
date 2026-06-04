import { AttributionModel } from '../../domain/enums';
import {
  AttributionContext,
  CreditedTouchpoint,
  PathTouchpoint,
} from '../types/attribution.types';
import { linear } from '../models/linear';
import { timeDecay } from '../models/time-decay';
import { positionBased } from '../models/position-based';

export const DEFAULT_HALF_LIFE_DAYS = 7;
export const DEFAULT_ATTRIBUTION_WINDOW_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MODELS = {
  [AttributionModel.LINEAR]: linear,
  [AttributionModel.TIME_DECAY]: timeDecay,
  [AttributionModel.POSITION_BASED]: positionBased,
};

export function buildPath(
  touchpoints: PathTouchpoint[],
  saleOccurredAt: Date,
  windowDays: number,
): PathTouchpoint[] {
  const windowStart = saleOccurredAt.getTime() - windowDays * MS_PER_DAY;

  return touchpoints
    .filter((tp) => {
      const t = tp.occurredAt.getTime();
      return t < saleOccurredAt.getTime() && t >= windowStart;
    })
    .sort((a, b) => {
      const diff = a.occurredAt.getTime() - b.occurredAt.getTime();
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });
}

export function attribute(
  model: AttributionModel,
  path: PathTouchpoint[],
  saleAmount: number,
  context: AttributionContext,
): CreditedTouchpoint[] {
  return MODELS[model](path, saleAmount, context);
}

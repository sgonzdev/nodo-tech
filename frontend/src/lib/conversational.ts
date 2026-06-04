import { AttributionModel, AudienceOrigin, DashboardFilters } from './types';

const MODEL_KEYWORDS: [RegExp, AttributionModel][] = [
  [/time.?decay|decaimiento|reciente/i, 'time_decay'],
  [/position|u.?shaped|forma de u/i, 'position_based'],
  [/lineal|linear/i, 'linear'],
];

const ORIGIN_KEYWORDS: [RegExp, AudienceOrigin][] = [
  [/base propia|reactivaci/i, 'base_propia'],
  [/warm|tibia/i, 'warm'],
  [/fr[íi]a|fria|prospect/i, 'fria'],
];

export function parseConversational(
  text: string,
): Partial<DashboardFilters> {
  const patch: Partial<DashboardFilters> = {};

  for (const [re, model] of MODEL_KEYWORDS) {
    if (re.test(text)) {
      patch.model = model;
      break;
    }
  }
  for (const [re, origin] of ORIGIN_KEYWORDS) {
    if (re.test(text)) {
      patch.audienceOrigin = origin;
      break;
    }
  }

  const days = text.match(/(\d+)\s*d[íi]as/i);
  if (days) {
    const n = Number(days[1]);
    patch.windowDays = n;
    const to = new Date();
    const from = new Date(to.getTime() - n * 86_400_000);
    patch.from = from.toISOString().slice(0, 10);
    patch.to = to.toISOString().slice(0, 10);
  }

  return patch;
}

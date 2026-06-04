import { AttributionModel, AudienceOrigin, Channel } from '../../domain/enums';
import {
  attribute,
  buildPath,
  DEFAULT_HALF_LIFE_DAYS,
} from '../utils/attribution';
import { PathTouchpoint } from '../types/attribution.types';

const SALE_DATE = new Date('2026-01-31T12:00:00Z');

function tp(daysBefore: number, id = `tp-${daysBefore}`): PathTouchpoint {
  return {
    id,
    campaignId: 'c1',
    channel: Channel.META,
    audienceOrigin: AudienceOrigin.FRIA,
    occurredAt: new Date(SALE_DATE.getTime() - daysBefore * 86_400_000),
  };
}

const ctx = { saleOccurredAt: SALE_DATE, halfLifeDays: DEFAULT_HALF_LIFE_DAYS };

function totalCredit(credited: { credit: number }[]): number {
  return Math.round(credited.reduce((s, c) => s + c.credit, 0) * 100) / 100;
}

describe('attribution models', () => {
  const path = [tp(20), tp(10), tp(2)];
  const amount = 1000;

  const models = [
    AttributionModel.LINEAR,
    AttributionModel.TIME_DECAY,
    AttributionModel.POSITION_BASED,
  ];

  it.each(models)('credit sums to the sale amount (%s)', (model) => {
    const credited = attribute(model, path, amount, ctx);
    expect(totalCredit(credited)).toBe(amount);
  });

  it('linear splits credit equally', () => {
    const credited = attribute(AttributionModel.LINEAR, path, 900, ctx);
    expect(credited.map((c) => c.credit)).toEqual([300, 300, 300]);
  });

  it('time-decay gives more credit to recent touchpoints', () => {
    const credited = attribute(AttributionModel.TIME_DECAY, path, amount, ctx);
    expect(credited[2].credit).toBeGreaterThan(credited[1].credit);
    expect(credited[1].credit).toBeGreaterThan(credited[0].credit);
  });

  it('position-based gives 40/40 to first and last', () => {
    const credited = attribute(
      AttributionModel.POSITION_BASED,
      path,
      amount,
      ctx,
    );
    expect(credited[0].credit).toBe(400);
    expect(credited[2].credit).toBe(400);
    expect(credited[1].credit).toBe(200);
  });

  it('position-based with 1 touchpoint gives 100%', () => {
    const credited = attribute(
      AttributionModel.POSITION_BASED,
      [tp(5)],
      500,
      ctx,
    );
    expect(credited[0].credit).toBe(500);
  });

  it('position-based with 2 touchpoints splits 50/50', () => {
    const credited = attribute(
      AttributionModel.POSITION_BASED,
      [tp(8), tp(3)],
      500,
      ctx,
    );
    expect(credited.map((c) => c.credit)).toEqual([250, 250]);
  });

  it('handles amounts that do not divide evenly (no lost cents)', () => {
    const credited = attribute(AttributionModel.LINEAR, path, 100.01, ctx);
    expect(totalCredit(credited)).toBe(100.01);
  });
});

describe('buildPath', () => {
  it('keeps only touchpoints before the sale within the window', () => {
    const all = [tp(40), tp(20), tp(5), tp(0.5)];
    const path = buildPath(all, SALE_DATE, 30);
    expect(path.map((p) => p.id)).toEqual(['tp-20', 'tp-5', 'tp-0.5']);
  });

  it('returns empty when no touchpoint falls in the window', () => {
    expect(buildPath([tp(40), tp(35)], SALE_DATE, 30)).toEqual([]);
  });

  it('orders touchpoints chronologically', () => {
    const path = buildPath([tp(2), tp(15), tp(8)], SALE_DATE, 30);
    expect(path.map((p) => p.id)).toEqual(['tp-15', 'tp-8', 'tp-2']);
  });
});

import { AttributionModel, AudienceOrigin, Channel } from '../../domain/enums';
import { attribute, buildPath } from '../utils/attribution';
import { PathTouchpoint } from '../types/attribution.types';

const SALE = new Date('2026-01-31T12:00:00Z');

function tp(daysBefore: number, id = `tp-${daysBefore}`): PathTouchpoint {
  return {
    id,
    campaignId: 'c1',
    channel: Channel.META,
    audienceOrigin: AudienceOrigin.FRIA,
    occurredAt: new Date(SALE.getTime() - daysBefore * 86_400_000),
  };
}

const ctx = (halfLifeDays: number) => ({
  saleOccurredAt: SALE,
  halfLifeDays,
});

function total(credited: { credit: number }[]): number {
  return Math.round(credited.reduce((s, c) => s + c.credit, 0) * 100) / 100;
}

const ALL = [
  AttributionModel.LINEAR,
  AttributionModel.TIME_DECAY,
  AttributionModel.POSITION_BASED,
];

describe('attribution edge cases', () => {
  const path = [tp(20), tp(10), tp(2)];

  it.each(ALL)('sale amount of 0 yields all-zero credit (%s)', (model) => {
    const credited = attribute(model, path, 0, ctx(7));
    expect(total(credited)).toBe(0);
    expect(credited.every((c) => c.credit === 0)).toBe(true);
  });

  it.each(ALL)('empty path yields no credit (%s)', (model) => {
    expect(attribute(model, [], 1000, ctx(7))).toEqual([]);
  });

  it('time-decay with halfLife=0 still distributes the full amount', () => {
    const credited = attribute(AttributionModel.TIME_DECAY, path, 1000, ctx(0));
    expect(total(credited)).toBe(1000);
    expect(credited.some((c) => c.credit > 0)).toBe(true);
  });

  it('time-decay with negative halfLife does not produce NaN', () => {
    const credited = attribute(
      AttributionModel.TIME_DECAY,
      path,
      1000,
      ctx(-5),
    );
    expect(total(credited)).toBe(1000);
    expect(credited.some((c) => Number.isNaN(c.credit))).toBe(false);
  });

  it.each(ALL)('never loses cents on awkward decimal amounts (%s)', (model) => {
    for (const amount of [0.01, 0.07, 33.33, 100.01, 999999.99]) {
      expect(total(attribute(model, path, amount, ctx(7)))).toBe(amount);
    }
  });

  it('position-based splits the 20% middle across several middles', () => {
    const five = [tp(30), tp(20), tp(15), tp(10), tp(2)];
    const credited = attribute(
      AttributionModel.POSITION_BASED,
      five,
      1000,
      ctx(7),
    );
    expect(total(credited)).toBe(1000);
    expect(credited[0].credit).toBe(400);
    const middles = credited.slice(1, 4).reduce((s, c) => s + c.credit, 0);
    expect(Math.round(middles)).toBe(200);
  });

  it('long path of 100 touchpoints still sums exactly', () => {
    const long = Array.from({ length: 100 }, (_, i) => tp(i + 1, `t${i}`));
    for (const model of ALL) {
      expect(total(attribute(model, long, 50_000, ctx(7)))).toBe(50_000);
    }
  });

  it('buildPath breaks ties deterministically by id', () => {
    const sameTime: PathTouchpoint[] = [
      { ...tp(5, 'zzz') },
      { ...tp(5, 'aaa') },
      { ...tp(5, 'mmm') },
    ];
    const ordered = buildPath(sameTime, SALE, 30).map((t) => t.id);
    expect(ordered).toEqual(['aaa', 'mmm', 'zzz']);
  });

  it('buildPath excludes touchpoints at the exact sale instant', () => {
    const atSale: PathTouchpoint = { ...tp(0, 'same') };
    expect(buildPath([atSale, tp(3)], SALE, 30).map((t) => t.id)).toEqual([
      'tp-3',
    ]);
  });
});

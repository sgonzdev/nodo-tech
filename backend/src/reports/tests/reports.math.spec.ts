import { diffPct, roas, round2, sumCredits } from '../utils/reports.math';
import { AudienceOrigin } from '../../domain/enums';

describe('reports.math', () => {
  describe('roas', () => {
    it('divides revenue by spend rounded to 2 decimals', () => {
      expect(roas(9000, 3000)).toBe(3);
      expect(roas(1000, 3000)).toBe(0.33);
    });

    it('returns 0 when spend is zero', () => {
      expect(roas(5000, 0)).toBe(0);
    });

    it('never returns NaN or Infinity', () => {
      expect(Number.isFinite(roas(0, 0))).toBe(true);
      expect(Number.isFinite(roas(1000, -500))).toBe(true);
    });
  });

  describe('diffPct', () => {
    it('computes platform vs real difference percentage', () => {
      expect(diffPct(2000, 1000)).toBe(100);
      expect(diffPct(1050, 1000)).toBe(5);
    });

    it('handles real revenue of zero', () => {
      expect(diffPct(1000, 0)).toBe(100);
      expect(diffPct(0, 0)).toBe(0);
    });

    it('never returns NaN or Infinity', () => {
      expect(Number.isFinite(diffPct(0, 0))).toBe(true);
      expect(Number.isFinite(diffPct(1000, 0))).toBe(true);
    });
  });

  describe('round2', () => {
    it('rounds to two decimals', () => {
      expect(round2(1.005)).toBe(1.0);
      expect(round2(2.677)).toBe(2.68);
    });
  });

  describe('sumCredits', () => {
    it('sums credit amounts rounded', () => {
      const credits = [
        { campaignId: 'a', audienceOrigin: AudienceOrigin.FRIA, amount: 10.1 },
        { campaignId: 'b', audienceOrigin: AudienceOrigin.WARM, amount: 20.2 },
      ];
      expect(sumCredits(credits)).toBe(30.3);
    });
  });
});

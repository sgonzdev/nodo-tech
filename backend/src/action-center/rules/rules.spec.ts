import { runRules } from './index';
import { AudienceOrigin } from '../../domain/enums';
import { CampaignRow } from '../../reports/types/reports.types';

function campaign(over: Partial<CampaignRow>): CampaignRow {
  return {
    campaignId: 'c1',
    name: 'Campaña X',
    channel: 'meta',
    adSpend: 1_000_000,
    attributedRevenue: 500_000,
    realRoas: 0.5,
    platformRevenue: 2_000_000,
    platformRoas: 2,
    reconciliationDiffPct: 300,
    flagged: true,
    ...over,
  };
}

describe('action-center rules', () => {
  it('flags campaigns with real ROAS below 1', () => {
    const recs = runRules({
      campaigns: [campaign({ realRoas: 0.5 })],
      audienceOrigins: [],
    });
    expect(recs.some((r) => r.rule === 'roas_below_one')).toBe(true);
  });

  it('does not flag profitable campaigns for the roas rule', () => {
    const recs = runRules({
      campaigns: [
        campaign({ realRoas: 2.5, flagged: false, reconciliationDiffPct: 1 }),
      ],
      audienceOrigins: [],
    });
    expect(recs.some((r) => r.rule === 'roas_below_one')).toBe(false);
  });

  it('recommends scaling the best audience origin when profitable', () => {
    const recs = runRules({
      campaigns: [],
      audienceOrigins: [
        {
          audienceOrigin: AudienceOrigin.BASE_PROPIA,
          attributedRevenue: 3_000_000,
          realRoas: 1.8,
        },
      ],
    });
    expect(recs.some((r) => r.rule === 'best_audience_origin')).toBe(true);
  });

  it('raises a reconciliation gap when platform overreports', () => {
    const recs = runRules({
      campaigns: [campaign({ flagged: true, platformRevenue: 2_000_000 })],
      audienceOrigins: [],
    });
    expect(recs.some((r) => r.rule === 'reconciliation_gap')).toBe(true);
  });
});

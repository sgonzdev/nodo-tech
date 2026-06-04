import { AudienceOrigin, Channel } from '../domain/enums';

export const SEED_SEED = 42;
export const CONTACT_COUNT = 32;
export const TARGET_SALES = 42;

export const DEMO_USER = {
  businessName: 'Startup Tech',
  email: 'demo@nodotech.io',
  password: 'demo12345',
};

export interface CampaignSpec {
  name: string;
  channel: Channel;
  adSpend: number;
  platformReportedRevenue: number;
  startOffsetDays: number;
  durationDays: number;
  originMix: [AudienceOrigin, number][];
  saleConversionWeight: number;
  avgTicket: number;
}

export const CAMPAIGN_SPECS: CampaignSpec[] = [
  {
    name: 'Meta - Prospecting Frio',
    channel: Channel.META,
    adSpend: 6_000_000,
    platformReportedRevenue: 21_000_000,
    startOffsetDays: 90,
    durationDays: 60,
    originMix: [
      [AudienceOrigin.FRIA, 7],
      [AudienceOrigin.WARM, 2],
      [AudienceOrigin.BASE_PROPIA, 1],
    ],
    saleConversionWeight: 2,
    avgTicket: 180_000,
  },
  {
    name: 'Google - Branded Search',
    channel: Channel.GOOGLE,
    adSpend: 3_500_000,
    platformReportedRevenue: 9_000_000,
    startOffsetDays: 75,
    durationDays: 60,
    originMix: [
      [AudienceOrigin.WARM, 6],
      [AudienceOrigin.FRIA, 3],
      [AudienceOrigin.BASE_PROPIA, 1],
    ],
    saleConversionWeight: 3,
    avgTicket: 240_000,
  },
  {
    name: 'TikTok - Awareness',
    channel: Channel.TIKTOK,
    adSpend: 5_000_000,
    platformReportedRevenue: 8_500_000,
    startOffsetDays: 50,
    durationDays: 45,
    originMix: [
      [AudienceOrigin.FRIA, 8],
      [AudienceOrigin.WARM, 2],
    ],
    saleConversionWeight: 1,
    avgTicket: 150_000,
  },
  {
    name: 'Email - Reactivacion Base',
    channel: Channel.EMAIL,
    adSpend: 1_200_000,
    platformReportedRevenue: 4_000_000,
    startOffsetDays: 40,
    durationDays: 40,
    originMix: [[AudienceOrigin.BASE_PROPIA, 10]],
    saleConversionWeight: 5,
    avgTicket: 320_000,
  },
];

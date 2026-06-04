import { AudienceOrigin } from '../../domain/enums';

export interface AttributedCredit {
  campaignId: string;
  audienceOrigin: AudienceOrigin;
  amount: number;
}

export interface CoreMetrics {
  realRevenue: number;
  totalSpend: number;
  realRoas: number;
  platformRoas: number;
  conversions: number;
  averageTicket: number;
}

export interface CampaignRow {
  campaignId: string;
  name: string;
  channel: string;
  adSpend: number;
  attributedRevenue: number;
  realRoas: number;
  platformRevenue: number;
  platformRoas: number;
  reconciliationDiffPct: number;
  flagged: boolean;
}

export interface AudienceOriginRow {
  audienceOrigin: AudienceOrigin;
  attributedRevenue: number;
  realRoas: number;
}

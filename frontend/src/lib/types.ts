export type AttributionModel = 'linear' | 'time_decay' | 'position_based';
export type AudienceOrigin = 'fria' | 'warm' | 'base_propia';

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

export interface Recommendation {
  rule: string;
  title: string;
  context: string;
  owner: string;
  cta: string;
}

export interface Task {
  id: string;
  title: string;
  context: string;
  owner: string;
  cta: string;
  suggestedDate: string;
  status: 'accepted' | 'done' | 'dismissed';
  sourceRule: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardFilters {
  from?: string;
  to?: string;
  campaignId?: string;
  audienceOrigin?: AudienceOrigin;
  model: AttributionModel;
  windowDays: number;
}

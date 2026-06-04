import { CampaignRow, AudienceOriginRow } from '../reports/types/reports.types';

export interface Recommendation {
  rule: string;
  title: string;
  context: string;
  owner: string;
  cta: string;
}

export interface RuleInput {
  campaigns: CampaignRow[];
  audienceOrigins: AudienceOriginRow[];
}

export type Rule = (input: RuleInput) => Recommendation[];

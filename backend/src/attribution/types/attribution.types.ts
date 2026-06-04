import { AudienceOrigin, Channel } from '../../domain/enums';

export interface PathTouchpoint {
  id: string;
  campaignId: string;
  channel: Channel;
  audienceOrigin: AudienceOrigin;
  occurredAt: Date;
}

export interface CreditedTouchpoint extends PathTouchpoint {
  credit: number;
}

export interface AttributionContext {
  saleOccurredAt: Date;
  halfLifeDays: number;
}

export type AttributionFn = (
  path: PathTouchpoint[],
  saleAmount: number,
  context: AttributionContext,
) => CreditedTouchpoint[];

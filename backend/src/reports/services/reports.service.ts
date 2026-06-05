import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../domain/entities/campaign.entity';
import { AttributionRunnerService } from './attribution-runner.service';
import { ReportQueryDto } from '../dto/report-query.dto';
import {
  AttributedCredit,
  AudienceOriginRow,
  CampaignRow,
  CoreMetrics,
} from '../types/reports.types';
import { roas, diffPct, sumCredits } from '../utils/reports.math';
import { RECONCILIATION_THRESHOLD_PCT } from '../../domain/constants';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaigns: Repository<Campaign>,
    private readonly runner: AttributionRunnerService,
  ) {}

  private async creditsAndCampaigns(businessId: string, query: ReportQueryDto) {
    const [rawCredits, campaigns] = await Promise.all([
      this.runner.run(businessId, query),
      this.loadCampaigns(businessId, query.campaignId),
    ]);
    const credits = this.applyFilters(rawCredits, query);
    return { credits, campaigns };
  }

  async metrics(
    businessId: string,
    query: ReportQueryDto,
  ): Promise<CoreMetrics> {
    const { credits, campaigns } = await this.creditsAndCampaigns(
      businessId,
      query,
    );
    const realRevenue = sumCredits(credits);
    const totalSpend = campaigns.reduce((s, c) => s + Number(c.adSpend), 0);
    const platformRevenue = campaigns.reduce(
      (s, c) => s + Number(c.platformReportedRevenue),
      0,
    );
    const conversions = await this.countSales(businessId, query);

    return {
      realRevenue,
      totalSpend,
      realRoas: roas(realRevenue, totalSpend),
      platformRoas: roas(platformRevenue, totalSpend),
      conversions,
      averageTicket: conversions ? realRevenue / conversions : 0,
    };
  }

  async byCampaign(
    businessId: string,
    query: ReportQueryDto,
  ): Promise<CampaignRow[]> {
    const { credits, campaigns } = await this.creditsAndCampaigns(
      businessId,
      query,
    );
    const byCampaign = new Map<string, number>();
    for (const c of credits) {
      byCampaign.set(
        c.campaignId,
        (byCampaign.get(c.campaignId) ?? 0) + c.amount,
      );
    }

    return campaigns.map((c) => {
      const attributedRevenue = byCampaign.get(c.id) ?? 0;
      const adSpend = Number(c.adSpend);
      const platformRevenue = Number(c.platformReportedRevenue);
      const realRoas = roas(attributedRevenue, adSpend);
      const platformRoas = roas(platformRevenue, adSpend);
      const reconciliationDiffPct = diffPct(platformRevenue, attributedRevenue);
      return {
        campaignId: c.id,
        name: c.name,
        channel: c.channel,
        adSpend,
        attributedRevenue,
        realRoas,
        platformRevenue,
        platformRoas,
        reconciliationDiffPct,
        flagged: Math.abs(reconciliationDiffPct) > RECONCILIATION_THRESHOLD_PCT,
      };
    });
  }

  async byAudienceOrigin(
    businessId: string,
    query: ReportQueryDto,
  ): Promise<AudienceOriginRow[]> {
    const { credits, campaigns } = await this.creditsAndCampaigns(
      businessId,
      query,
    );
    const spendByCampaign = new Map(
      campaigns.map((c) => [c.id, Number(c.adSpend)]),
    );
    const creditByCampaign = new Map<string, number>();
    for (const c of credits) {
      creditByCampaign.set(
        c.campaignId,
        (creditByCampaign.get(c.campaignId) ?? 0) + c.amount,
      );
    }

    const revenueByOrigin = new Map<string, number>();
    const spendByOrigin = new Map<string, number>();
    for (const c of credits) {
      revenueByOrigin.set(
        c.audienceOrigin,
        (revenueByOrigin.get(c.audienceOrigin) ?? 0) + c.amount,
      );
      const campaignCredit = creditByCampaign.get(c.campaignId) || 1;
      const campaignSpend = spendByCampaign.get(c.campaignId) ?? 0;
      const spendShare = (c.amount / campaignCredit) * campaignSpend;
      spendByOrigin.set(
        c.audienceOrigin,
        (spendByOrigin.get(c.audienceOrigin) ?? 0) + spendShare,
      );
    }

    return [...revenueByOrigin.entries()]
      .map(([audienceOrigin, attributedRevenue]) => ({
        audienceOrigin: audienceOrigin as AudienceOriginRow['audienceOrigin'],
        attributedRevenue,
        realRoas: roas(
          attributedRevenue,
          spendByOrigin.get(audienceOrigin) ?? 0,
        ),
      }))
      .sort((a, b) => b.realRoas - a.realRoas);
  }

  private applyFilters(
    credits: AttributedCredit[],
    query: ReportQueryDto,
  ): AttributedCredit[] {
    return credits.filter(
      (c) =>
        (!query.campaignId || c.campaignId === query.campaignId) &&
        (!query.audienceOrigin || c.audienceOrigin === query.audienceOrigin),
    );
  }

  private loadCampaigns(businessId: string, campaignId?: string) {
    const where: Record<string, string> = { businessId };
    if (campaignId) where.id = campaignId;
    return this.campaigns.find({ where });
  }

  private countSales(businessId: string, query: ReportQueryDto) {
    const qb = this.campaigns.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('sale', 's')
      .where('s.business_id = :businessId', { businessId });
    if (query.from) qb.andWhere('s.occurred_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('s.occurred_at <= :to', { to: query.to });
    return qb.getRawOne<{ count: string }>().then((r) => Number(r?.count ?? 0));
  }
}

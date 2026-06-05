import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../../domain/entities/sale.entity';
import { Touchpoint } from '../../domain/entities/touchpoint.entity';
import { attribute, buildPath } from '../../attribution/utils/attribution';
import { PathTouchpoint } from '../../attribution/types/attribution.types';
import { ReportQueryDto } from '../dto/report-query.dto';
import { AttributedCredit } from '../types/reports.types';
import { DEFAULT_HALF_LIFE_DAYS } from '../../domain/constants';

@Injectable()
export class AttributionRunnerService {
  constructor(
    @InjectRepository(Sale) private readonly sales: Repository<Sale>,
    @InjectRepository(Touchpoint)
    private readonly touchpoints: Repository<Touchpoint>,
  ) {}

  async run(
    businessId: string,
    query: ReportQueryDto,
  ): Promise<AttributedCredit[]> {
    const sales = await this.loadSales(businessId, query);
    if (sales.length === 0) return [];

    const contactIds = [...new Set(sales.map((s) => s.contactId))];
    const pathsByContact = await this.loadPaths(businessId, contactIds);

    const credits: AttributedCredit[] = [];
    for (const sale of sales) {
      const path = buildPath(
        pathsByContact.get(sale.contactId) ?? [],
        sale.occurredAt,
        query.windowDays,
      );
      const credited = attribute(query.model, path, Number(sale.amount), {
        saleOccurredAt: sale.occurredAt,
        halfLifeDays: DEFAULT_HALF_LIFE_DAYS,
      });
      for (const tp of credited) {
        credits.push({
          campaignId: tp.campaignId,
          audienceOrigin: tp.audienceOrigin,
          amount: tp.credit,
        });
      }
    }
    return credits;
  }

  private loadSales(businessId: string, query: ReportQueryDto) {
    const qb = this.sales
      .createQueryBuilder('s')
      .where('s.business_id = :businessId', { businessId });
    if (query.from) qb.andWhere('s.occurred_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('s.occurred_at <= :to', { to: query.to });
    return qb.getMany();
  }

  private async loadPaths(
    businessId: string,
    contactIds: string[],
  ): Promise<Map<string, PathTouchpoint[]>> {
    const rows = await this.touchpoints
      .createQueryBuilder('t')
      .where('t.business_id = :businessId', { businessId })
      .andWhere('t.contact_id IN (:...contactIds)', { contactIds })
      .getMany();

    const map = new Map<string, PathTouchpoint[]>();
    for (const r of rows) {
      const list = map.get(r.contactId) ?? [];
      list.push({
        id: r.id,
        campaignId: r.campaignId,
        channel: r.channel,
        audienceOrigin: r.audienceOrigin,
        occurredAt: r.occurredAt,
      });
      map.set(r.contactId, list);
    }
    return map;
  }
}

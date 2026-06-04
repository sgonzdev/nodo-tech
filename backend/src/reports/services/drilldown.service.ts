import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../domain/entities/campaign.entity';
import { Touchpoint } from '../../domain/entities/touchpoint.entity';
import { Sale } from '../../domain/entities/sale.entity';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DrilldownService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaigns: Repository<Campaign>,
    @InjectRepository(Touchpoint)
    private readonly touchpoints: Repository<Touchpoint>,
    @InjectRepository(Sale) private readonly sales: Repository<Sale>,
  ) {}

  async forCampaign(
    businessId: string,
    campaignId: string,
    pagination: PaginationDto,
  ) {
    const campaign = await this.campaigns.findOne({
      where: { id: campaignId, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaña no encontrada');

    const [touchpoints, total] = await this.touchpoints.findAndCount({
      where: { businessId, campaignId },
      order: { occurredAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const sales = await this.salesForTouchpoints(businessId, touchpoints);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
      },
      touchpoints: paginate(touchpoints, total, pagination),
      sales,
    };
  }

  private salesForTouchpoints(businessId: string, touchpoints: Touchpoint[]) {
    const contactIds = [...new Set(touchpoints.map((t) => t.contactId))];
    if (contactIds.length === 0) return Promise.resolve([]);
    return this.sales
      .createQueryBuilder('s')
      .where('s.business_id = :businessId', { businessId })
      .andWhere('s.contact_id IN (:...contactIds)', { contactIds })
      .orderBy('s.occurred_at', 'DESC')
      .getMany();
  }
}

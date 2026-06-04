import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../campaigns/campaign.entity';
import { Touchpoint } from '../../touchpoints/touchpoint.entity';
import { Sale } from '../../sales/sale.entity';

@Injectable()
export class DrilldownService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaigns: Repository<Campaign>,
    @InjectRepository(Touchpoint)
    private readonly touchpoints: Repository<Touchpoint>,
    @InjectRepository(Sale) private readonly sales: Repository<Sale>,
  ) {}

  async forCampaign(businessId: string, campaignId: string) {
    const campaign = await this.campaigns.findOne({
      where: { id: campaignId, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaña no encontrada');

    const touchpoints = await this.touchpoints.find({
      where: { businessId, campaignId },
      order: { occurredAt: 'DESC' },
      take: 100,
    });

    const contactIds = [...new Set(touchpoints.map((t) => t.contactId))];
    const sales = contactIds.length
      ? await this.sales
          .createQueryBuilder('s')
          .where('s.business_id = :businessId', { businessId })
          .andWhere('s.contact_id IN (:...contactIds)', { contactIds })
          .orderBy('s.occurred_at', 'DESC')
          .getMany()
      : [];

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
      },
      touchpoints,
      sales,
    };
  }
}

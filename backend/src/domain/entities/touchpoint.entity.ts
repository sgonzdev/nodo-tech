import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AudienceOrigin, Channel } from '../enums';

@Entity('touchpoint')
@Index(['businessId', 'contactId', 'occurredAt'])
export class Touchpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'audience_origin', type: 'enum', enum: AudienceOrigin })
  audienceOrigin: AudienceOrigin;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}

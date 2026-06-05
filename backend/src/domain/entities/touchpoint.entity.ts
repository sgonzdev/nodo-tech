import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AudienceOrigin, Channel } from '../enums';
import { Business } from './business.entity';
import { Campaign } from './campaign.entity';
import { Contact } from './contact.entity';

@Entity('touchpoint')
@Index(['businessId', 'contactId', 'occurredAt'])
export class Touchpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'audience_origin', type: 'enum', enum: AudienceOrigin })
  audienceOrigin: AudienceOrigin;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}

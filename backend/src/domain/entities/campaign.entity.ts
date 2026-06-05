import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from '../enums';
import { Business } from './business.entity';

@Entity('campaign')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'ad_spend', type: 'numeric', precision: 14, scale: 2 })
  adSpend: string;

  @Column({
    name: 'platform_reported_revenue',
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  platformReportedRevenue: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;
}

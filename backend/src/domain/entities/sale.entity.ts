import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sale')
@Index(['businessId', 'occurredAt'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}

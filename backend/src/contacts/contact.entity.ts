import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contact')
@Index(['businessId', 'externalId'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;
}

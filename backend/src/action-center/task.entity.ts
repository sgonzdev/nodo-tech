import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskStatus } from '../domain/enums';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  context: string;

  @Column()
  owner: string;

  @Column({ name: 'suggested_date', type: 'date' })
  suggestedDate: string;

  @Column()
  cta: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.ACCEPTED })
  status: TaskStatus;

  @Column({ name: 'source_rule' })
  sourceRule: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

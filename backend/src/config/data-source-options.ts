import { DataSourceOptions } from 'typeorm';
import { Business } from '../domain/entities/business.entity';
import { User } from '../domain/entities/user.entity';
import { Contact } from '../domain/entities/contact.entity';
import { Campaign } from '../domain/entities/campaign.entity';
import { Touchpoint } from '../domain/entities/touchpoint.entity';
import { Sale } from '../domain/entities/sale.entity';
import { Task } from '../domain/entities/task.entity';

export const ENTITIES = [
  Business,
  User,
  Contact,
  Campaign,
  Touchpoint,
  Sale,
  Task,
];

export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USER ?? 'nodotech',
    password: env.DB_PASSWORD ?? 'nodotech',
    database: env.DB_NAME ?? 'nodotech_marketing',
    entities: ENTITIES,
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    synchronize: false,
    logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  };
}

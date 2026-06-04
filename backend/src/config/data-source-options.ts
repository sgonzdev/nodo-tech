import { DataSourceOptions } from 'typeorm';
import { Business } from '../business/business.entity';
import { User } from '../auth/user.entity';
import { Contact } from '../contacts/contact.entity';
import { Campaign } from '../campaigns/campaign.entity';
import { Touchpoint } from '../touchpoints/touchpoint.entity';
import { Sale } from '../sales/sale.entity';
import { Task } from '../action-center/task.entity';

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

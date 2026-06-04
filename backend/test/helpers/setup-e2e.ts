import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { buildDataSourceOptions } from '../../src/config/data-source-options';
import { generateData } from '../../src/seed/data-generator';
import { Business } from '../../src/domain/entities/business.entity';
import { User } from '../../src/domain/entities/user.entity';
import { Contact } from '../../src/domain/entities/contact.entity';
import { Campaign } from '../../src/domain/entities/campaign.entity';
import { Touchpoint } from '../../src/domain/entities/touchpoint.entity';
import { Sale } from '../../src/domain/entities/sale.entity';
import * as bcrypt from 'bcrypt';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

const BASE_DB = process.env.DB_NAME_TEST ?? 'nodotech_test';

export interface E2EContext {
  app: INestApplication;
  ds: DataSource;
  primaryBusinessId: string;
  otherBusinessId: string;
}

async function ensureDatabase(name: string) {
  const admin = new DataSource({
    ...buildDataSourceOptions({ ...process.env, DB_NAME: 'postgres' }),
    migrations: [],
  });
  await admin.initialize();
  const exists = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [name],
  );
  if (exists.length === 0) {
    await admin.query(`CREATE DATABASE "${name}"`);
  }
  await admin.destroy();
}

export async function createE2EApp(suffix: string): Promise<E2EContext> {
  const dbName = `${BASE_DB}_${suffix}`;
  await ensureDatabase(dbName);
  process.env.DB_NAME = dbName;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const ds = app.get(DataSource);
  await ds.runMigrations();

  const { primaryBusinessId, otherBusinessId } = await seedTwoTenants(ds);
  return { app, ds, primaryBusinessId, otherBusinessId };
}

async function seedTwoTenants(ds: DataSource) {
  await ds.query(
    'TRUNCATE "task","sale","touchpoint","campaign","contact","user","business" RESTART IDENTITY CASCADE',
  );

  const primary = await createTenant(ds, 'Demo Primary', 'demo@nodotech.io');
  const other = await createTenant(ds, 'Otro Negocio', 'otro@nodotech.io');

  return { primaryBusinessId: primary, otherBusinessId: other };
}

async function createTenant(ds: DataSource, name: string, email: string) {
  const business = await ds.getRepository(Business).save({ name });
  await ds.getRepository(User).save({
    email,
    passwordHash: await bcrypt.hash('demo12345', 10),
    businessId: business.id,
  });

  const data = generateData(new Date(), 42);
  await ds
    .getRepository(Contact)
    .save(data.contacts.map((c) => ({ ...c, businessId: business.id })));
  await ds
    .getRepository(Campaign)
    .save(data.campaigns.map((c) => ({ ...c, businessId: business.id })));
  await ds.getRepository(Touchpoint).save(
    data.touchpoints.map((t) => ({
      ...t,
      businessId: business.id,
    })) as Touchpoint[],
  );
  await ds
    .getRepository(Sale)
    .save(data.sales.map((s) => ({ ...s, businessId: business.id })));

  return business.id;
}

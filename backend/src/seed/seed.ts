import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../config/data-source-options';
import { Business } from '../domain/entities/business.entity';
import { User } from '../domain/entities/user.entity';
import { Contact } from '../domain/entities/contact.entity';
import { Campaign } from '../domain/entities/campaign.entity';
import { Touchpoint } from '../domain/entities/touchpoint.entity';
import { Sale } from '../domain/entities/sale.entity';
import { Task } from '../domain/entities/task.entity';
import { generateData } from './data-generator';
import { DEMO_USER, SEED_SEED } from './seed.config';

async function run() {
  const ds = new DataSource(buildDataSourceOptions());
  await ds.initialize();

  await ds.query(
    'TRUNCATE "task","sale","touchpoint","campaign","contact","user","business" RESTART IDENTITY CASCADE',
  );

  const business = await ds
    .getRepository(Business)
    .save({ name: DEMO_USER.businessName, currency: 'COP' });

  await ds.getRepository(User).save({
    email: DEMO_USER.email,
    passwordHash: await bcrypt.hash(DEMO_USER.password, 10),
    businessId: business.id,
  });

  const data = generateData(new Date(), SEED_SEED);

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
  await ds.getRepository(Task).clear();

  console.log(
    `Seed OK · business=${business.id} · ${data.contacts.length} contactos · ` +
      `${data.campaigns.length} campañas · ${data.touchpoints.length} touchpoints · ` +
      `${data.sales.length} ventas`,
  );
  console.log(`Login demo: ${DEMO_USER.email} / ${DEMO_USER.password}`);

  await ds.destroy();
}

run().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});

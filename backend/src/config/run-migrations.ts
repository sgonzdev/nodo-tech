import 'dotenv/config';
import dataSource from './data-source';

async function run() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Migrations fallaron:', err);
  process.exit(1);
});

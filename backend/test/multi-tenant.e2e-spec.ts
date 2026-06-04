import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from './setup-e2e';

describe('Multi-tenant isolation (e2e)', () => {
  let ctx: E2EContext;
  let app: INestApplication;
  let primary: ReturnType<typeof request.agent>;
  let other: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    ctx = await createE2EApp('tenant');
    app = ctx.app;

    primary = request.agent(app.getHttpServer());
    await primary
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' });

    other = request.agent(app.getHttpServer());
    await other
      .post('/api/auth/login')
      .send({ email: 'otro@nodotech.io', password: 'demo12345' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('each tenant only sees its own businessId', async () => {
    const a = await primary.get('/api/auth/me');
    const b = await other.get('/api/auth/me');
    expect(a.body.businessId).toBe(ctx.primaryBusinessId);
    expect(b.body.businessId).toBe(ctx.otherBusinessId);
    expect(a.body.businessId).not.toBe(b.body.businessId);
  });

  it('cannot drill down into another tenant campaign (404)', async () => {
    const campaigns = await primary.get('/api/reports/by-campaign');
    const foreignId = campaigns.body[0].campaignId;
    await other.get(`/api/reports/campaign/${foreignId}/drilldown`).expect(404);
  });

  it('a tenant task is invisible to another tenant', async () => {
    const created = await primary
      .post('/api/action-center/tasks')
      .send({
        title: 'Tenant A task',
        context: 'x',
        owner: 'A',
        cta: 'go',
        sourceRule: 'manual',
      })
      .expect(201);

    const otherList = await other.get('/api/action-center/tasks');
    expect(
      otherList.body.find((t: any) => t.id === created.body.id),
    ).toBeUndefined();

    await other
      .patch(`/api/action-center/tasks/${created.body.id}`)
      .send({ status: 'done' })
      .expect(404);
  });
});

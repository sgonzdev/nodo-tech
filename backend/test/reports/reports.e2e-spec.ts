import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../helpers/setup-e2e';

describe('Reports (e2e)', () => {
  let ctx: E2EContext;
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    ctx = await createE2EApp('reports');
    app = ctx.app;
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires authentication (401)', async () => {
    await request(app.getHttpServer()).get('/api/reports/metrics').expect(401);
  });

  it('returns six core metrics with real != platform ROAS', async () => {
    const res = await agent.get('/api/reports/metrics').expect(200);
    expect(res.body).toHaveProperty('realRevenue');
    expect(res.body).toHaveProperty('platformRoas');
    expect(res.body.conversions).toBeGreaterThan(0);
    expect(res.body.realRoas).not.toBe(res.body.platformRoas);
  });

  it('keeps total attributed revenue stable across models', async () => {
    const sum = async (model: string) => {
      const res = await agent
        .get(`/api/reports/by-campaign?model=${model}`)
        .expect(200);
      return Math.round(
        res.body.reduce((s: number, r: any) => s + r.attributedRevenue, 0),
      );
    };
    const linear = await sum('linear');
    const decay = await sum('time_decay');
    const position = await sum('position_based');
    expect(decay).toBe(linear);
    expect(position).toBe(linear);
  });

  it('redistributes credit differently per model', async () => {
    const first = async (model: string) => {
      const res = await agent.get(`/api/reports/by-campaign?model=${model}`);
      return res.body[0].attributedRevenue;
    };
    expect(await first('linear')).not.toBe(await first('time_decay'));
  });

  it('flags campaigns with reconciliation gap > 5%', async () => {
    const res = await agent.get('/api/reports/by-campaign').expect(200);
    expect(res.body.some((r: any) => r.flagged)).toBe(true);
  });

  it('rejects unknown attribution model (400)', async () => {
    await agent.get('/api/reports/metrics?model=nope').expect(400);
  });

  it('rejects invalid date (400)', async () => {
    await agent.get('/api/reports/metrics?from=not-a-date').expect(400);
  });

  it('returns 404 for an unknown campaign drilldown', async () => {
    await agent
      .get(
        '/api/reports/campaign/00000000-0000-0000-0000-000000000000/drilldown',
      )
      .expect(404);
  });

  it('exports a CSV report (default format)', async () => {
    const res = await agent.get('/api/reports/export').expect(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text.split('\n')[0]).toContain('attributedRevenue');
  });

  it('exports a PDF report when format=pdf', async () => {
    const res = await agent
      .get('/api/reports/export?format=pdf')
      .buffer(true)
      .parse((r, cb) => {
        const data: Buffer[] = [];
        r.on('data', (c: Buffer) => data.push(c));
        r.on('end', () => cb(null, Buffer.concat(data)));
      })
      .expect(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });

  it('rejects an unknown export format (400)', async () => {
    await agent.get('/api/reports/export?format=xml').expect(400);
  });

  it('paginates drilldown touchpoints', async () => {
    const campaigns = await agent.get('/api/reports/by-campaign');
    const id = campaigns.body[0].campaignId;
    const res = await agent
      .get(`/api/reports/campaign/${id}/drilldown?page=1&limit=5`)
      .expect(200);
    expect(res.body.touchpoints).toHaveProperty('items');
    expect(res.body.touchpoints).toHaveProperty('total');
    expect(res.body.touchpoints.items.length).toBeLessThanOrEqual(5);
  });
});

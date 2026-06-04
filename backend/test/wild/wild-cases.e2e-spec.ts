import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../helpers/setup-e2e';

describe('Wild user inputs (e2e)', () => {
  let ctx: E2EContext;
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    ctx = await createE2EApp('wild');
    app = ctx.app;
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('malformed query params', () => {
    it('rejects a garbage UUID in drilldown (400)', async () => {
      await agent.get('/api/reports/campaign/not-a-uuid/drilldown').expect(400);
    });

    it('rejects model in uppercase (enum is case-sensitive) (400)', async () => {
      await agent.get('/api/reports/metrics?model=LINEAR').expect(400);
    });

    it('rejects windowDays = 0 (400)', async () => {
      await agent.get('/api/reports/metrics?windowDays=0').expect(400);
    });

    it('rejects negative windowDays (400)', async () => {
      await agent.get('/api/reports/metrics?windowDays=-5').expect(400);
    });

    it('rejects absurdly large windowDays (400)', async () => {
      await agent.get('/api/reports/metrics?windowDays=999999').expect(400);
    });

    it('rejects windowDays as a float (400)', async () => {
      await agent.get('/api/reports/metrics?windowDays=30.5').expect(400);
    });

    it('rejects an unknown audienceOrigin (400)', async () => {
      await agent
        .get('/api/reports/metrics?audienceOrigin=tibia_caliente')
        .expect(400);
    });

    it('survives an inverted date range (from > to) without crashing', async () => {
      const res = await agent
        .get('/api/reports/metrics?from=2026-12-31&to=2020-01-01')
        .expect(200);
      expect(res.body.realRevenue).toBe(0);
      expect(res.body.conversions).toBe(0);
    });

    it('ignores a SQL-injection attempt in a filter param (400, not 500)', async () => {
      await agent
        .get("/api/reports/metrics?campaignId=1';DROP TABLE sale;--")
        .expect(400);
      const ok = await agent.get('/api/reports/metrics').expect(200);
      expect(ok.body.conversions).toBeGreaterThan(0);
    });
  });

  describe('hostile request bodies', () => {
    it('rejects extra non-whitelisted fields on task create (400)', async () => {
      await agent
        .post('/api/action-center/tasks')
        .send({
          title: 'X',
          context: 'y',
          owner: 'A',
          cta: 'go',
          sourceRule: 'manual',
          isAdmin: true,
          __proto__: { polluted: true },
        })
        .expect(400);
    });

    it('rejects an empty task title (400)', async () => {
      await agent
        .post('/api/action-center/tasks')
        .send({
          title: '',
          context: 'y',
          owner: 'A',
          cta: 'go',
          sourceRule: 'm',
        })
        .expect(400);
    });

    it('accepts a very long task title without crashing', async () => {
      const title = 'A'.repeat(5000);
      const res = await agent
        .post('/api/action-center/tasks')
        .send({ title, context: 'y', owner: 'A', cta: 'go', sourceRule: 'm' });
      expect([201, 400]).toContain(res.status);
    });

    it('rejects an unknown task status on update (400)', async () => {
      const created = await agent.post('/api/action-center/tasks').send({
        title: 'Wild status',
        context: 'y',
        owner: 'A',
        cta: 'go',
        sourceRule: 'm',
      });
      await agent
        .patch(`/api/action-center/tasks/${created.body.id}`)
        .send({ status: 'YOLO' })
        .expect(400);
    });

    it('returns 404 patching a valid-but-missing task id', async () => {
      await agent
        .patch('/api/action-center/tasks/11111111-1111-1111-1111-111111111111')
        .send({ status: 'done' })
        .expect(404);
    });

    it('returns 404 deleting a task twice', async () => {
      const created = await agent.post('/api/action-center/tasks').send({
        title: 'Delete twice',
        context: 'y',
        owner: 'A',
        cta: 'go',
        sourceRule: 'm',
      });
      await agent
        .delete(`/api/action-center/tasks/${created.body.id}`)
        .expect(200);
      await agent
        .delete(`/api/action-center/tasks/${created.body.id}`)
        .expect(404);
    });
  });

  describe('session abuse', () => {
    it('blocks requests after logout', async () => {
      const session = request.agent(app.getHttpServer());
      await session
        .post('/api/auth/login')
        .send({ email: 'demo@nodotech.io', password: 'demo12345' });
      await session.get('/api/auth/me').expect(200);
      await session.post('/api/auth/logout').expect(200);
      await session.get('/api/auth/me').expect(401);
    });

    it('rejects a forged/garbage cookie', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', 'nodotech_token=eyJ.garbage.value')
        .expect(401);
    });
  });
});

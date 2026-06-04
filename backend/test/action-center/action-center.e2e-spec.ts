import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../helpers/setup-e2e';

describe('Action Center (e2e)', () => {
  let ctx: E2EContext;
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    ctx = await createE2EApp('action');
    app = ctx.app;
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('derives recommendations from the real data', async () => {
    const res = await agent
      .get('/api/action-center/recommendations')
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((r: any) => r.rule === 'roas_below_one')).toBe(true);
  });

  it('dismissing a recommendation removes it from the list and persists', async () => {
    const before = await agent.get('/api/action-center/recommendations');
    const target = before.body[0];

    await agent
      .post('/api/action-center/recommendations/dismiss')
      .send({
        title: target.title,
        context: target.context,
        owner: target.owner,
        cta: target.cta,
        sourceRule: target.rule,
      })
      .expect(201);

    const after = await agent.get('/api/action-center/recommendations');
    expect(after.body.some((r: any) => r.title === target.title)).toBe(false);

    const tasks = await agent.get('/api/action-center/tasks');
    expect(tasks.body.items.some((t: any) => t.title === target.title)).toBe(false);
  });

  it('returns tasks in a paginated envelope', async () => {
    const res = await agent
      .get('/api/action-center/tasks?page=1&limit=5')
      .expect(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('rejects an invalid pagination limit (400)', async () => {
    await agent.get('/api/action-center/tasks?limit=9999').expect(400);
  });

  it('accepts a recommendation as a task and is idempotent', async () => {
    const payload = {
      title: 'Pausar campaña X',
      context: 'ROAS 0.3',
      owner: 'Performance',
      cta: 'Reasignar',
      sourceRule: 'roas_below_one',
    };
    const first = await agent
      .post('/api/action-center/tasks')
      .send(payload)
      .expect(201);
    const second = await agent
      .post('/api/action-center/tasks')
      .send(payload)
      .expect(201);

    expect(second.body.id).toBe(first.body.id);

    const list = await agent.get('/api/action-center/tasks');
    expect(
      list.body.items.filter((t: any) => t.title === payload.title),
    ).toHaveLength(1);
  });

  it('completes and dismisses a task', async () => {
    const created = await agent.post('/api/action-center/tasks').send({
      title: 'Task ciclo',
      context: 'x',
      owner: 'A',
      cta: 'go',
      sourceRule: 'manual',
    });
    const id = created.body.id;

    const done = await agent
      .patch(`/api/action-center/tasks/${id}`)
      .send({ status: 'done' })
      .expect(200);
    expect(done.body.status).toBe('done');

    await agent.delete(`/api/action-center/tasks/${id}`).expect(200);
    await agent
      .patch(`/api/action-center/tasks/${id}`)
      .send({ status: 'done' })
      .expect(404);
  });

  it('rejects an invalid task status (400)', async () => {
    const created = await agent.post('/api/action-center/tasks').send({
      title: 'Task validacion',
      context: 'x',
      owner: 'A',
      cta: 'go',
      sourceRule: 'manual',
    });
    await agent
      .patch(`/api/action-center/tasks/${created.body.id}`)
      .send({ status: 'invalid' })
      .expect(400);
  });
});

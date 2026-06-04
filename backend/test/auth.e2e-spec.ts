import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from './setup-e2e';

describe('Auth (e2e)', () => {
  let ctx: E2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createE2EApp('auth');
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects /me without a cookie (401)', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('logs in and sets an httpOnly cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' })
      .expect(200);

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('nodotech_token=');
    expect(cookie.toLowerCase()).toContain('httponly');
  });

  it('rejects invalid credentials (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'wrong' })
      .expect(401);
  });

  it('rejects malformed register payload (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('returns the authenticated user on /me with cookie', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .send({ email: 'demo@nodotech.io', password: 'demo12345' });
    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body.email).toBe('demo@nodotech.io');
  });
});

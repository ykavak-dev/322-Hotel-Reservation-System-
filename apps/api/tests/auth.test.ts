import supertest from 'supertest';
import app from './helpers/testApp';

describe('Auth - Register', () => {
  it('POST /api/auth/register - registers a new customer successfully', async () => {
    const email = `customer-${Date.now()}@test.com`;
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'StrongPass123!',
        firstName: 'Customer',
        lastName: 'Test',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  it('POST /api/auth/register - rejects missing email', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        password: 'StrongPass123!',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register - registers hotel admin with HOTEL_ADMIN role', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        email: `admin-${Date.now()}@test.com`,
        password: 'StrongPass123!',
        firstName: 'Hotel',
        lastName: 'Admin',
        role: 'HOTEL_ADMIN',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('HOTEL_ADMIN');
  });
});

describe('Auth - Login', () => {
  it('POST /api/auth/login - returns tokens on valid credentials', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'anypassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /api/auth/login - returns 401 on wrong password', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login - returns 400 for missing credentials', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Auth - JWT Protection', () => {
  it('GET /api/hotels - allows public access', async () => {
    const res = await supertest(app).get('/api/hotels');
    expect(res.status).toBe(200);
  });

  it('GET /api/auth/me - rejects request without token', async () => {
    const res = await supertest(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me - returns user on valid token', async () => {
    const token = 'mock-token';
    const res = await supertest(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('Auth - Refresh Token Rotation', () => {
  it('POST /api/auth/refresh - issues new tokens on valid refresh token', async () => {
    const res = await supertest(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /api/auth/refresh - rejects missing refresh token', async () => {
    const res = await supertest(app)
      .post('/api/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
  });
});

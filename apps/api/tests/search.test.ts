import supertest from 'supertest';
import app from './helpers/testApp';

describe('Search - Basic', () => {
  it('GET /api/search/hotels - requires checkIn and checkOut', async () => {
    const res = await supertest(app).get('/api/search/hotels');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('checkIn');
  });

  it('GET /api/search/hotels - returns hotel list with valid dates', async () => {
    const res = await supertest(app)
      .get('/api/search/hotels')
      .query({ checkIn: '2026-06-01', checkOut: '2026-06-05' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hotels');
  });
});

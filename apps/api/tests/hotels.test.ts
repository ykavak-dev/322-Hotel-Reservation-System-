import supertest from 'supertest';
import app from './helpers/testApp';

describe('Hotels', () => {
  it('GET /api/hotels - returns list of hotels', async () => {
    const res = await supertest(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hotels');
  });

  it('GET /api/hotels/:id - returns hotel details', async () => {
    const res = await supertest(app).get('/api/hotels/test-hotel-id');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Hotel');
  });
});

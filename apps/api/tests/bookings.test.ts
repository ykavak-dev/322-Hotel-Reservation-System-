import supertest from 'supertest';
import app from './helpers/testApp';

describe('Bookings', () => {
  it('POST /api/bookings - rejects unauthenticated request', async () => {
    const res = await supertest(app)
      .post('/api/bookings')
      .send({ roomId: 'room-1', checkIn: '2026-06-01', checkOut: '2026-06-05' });

    expect(res.status).toBe(401);
  });

  it('POST /api/bookings - creates booking with valid token', async () => {
    const res = await supertest(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer mock-token')
      .send({ roomId: 'room-1', checkIn: '2026-06-01', checkOut: '2026-06-05', numberOfGuests: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('PENDING');
  });
});

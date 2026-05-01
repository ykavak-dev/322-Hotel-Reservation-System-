import supertest from 'supertest';
import app from './helpers/testApp';

describe('Reviews', () => {
  it('POST /api/reviews - creates a review', async () => {
    const res = await supertest(app)
      .post('/api/reviews')
      .set('Authorization', 'Bearer mock-token')
      .send({
        hotelId: 'hotel-1',
        bookingId: 'booking-1',
        rating: 4,
        comment: 'Great stay!',
      });

    expect(res.status).toBe(201);
  });
});

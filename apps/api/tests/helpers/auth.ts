import supertest from 'supertest';
import { Express } from 'express';

export async function registerUser(
  app: Express,
  email: string,
  password: string,
  firstName = 'Test',
  lastName = 'User',
  role: 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN' = 'CUSTOMER'
) {
  return supertest(app)
    .post('/api/auth/register')
    .send({ email, password, firstName, lastName, role });
}

export async function loginUser(app: Express, email: string, password: string) {
  return supertest(app)
    .post('/api/auth/login')
    .send({ email, password });
}

export function getAuthHeader(token: string): string {
  return `Bearer ${token}`;
}
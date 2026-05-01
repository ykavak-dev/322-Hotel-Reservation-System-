// Minimal Express test app — no database, no Prisma
// For shallow smoke tests only

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Mock auth endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  return res.status(201).json({
    user: { id: 'test-id', email, firstName: firstName ?? 'Test', lastName: lastName ?? 'User', role: role ?? 'CUSTOMER' },
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh',
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password === 'wrong') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  return res.json({
    user: { id: 'test-id', email, firstName: 'Test', lastName: 'User', role: 'CUSTOMER' },
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh',
  });
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ id: 'test-id', email: 'test@example.com', role: 'CUSTOMER' });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  return res.json({
    accessToken: 'new-mock-token',
    refreshToken: 'new-mock-refresh',
  });
});

// Mock hotel endpoints
app.get('/api/hotels', (_req, res) => {
  res.json({ hotels: [], total: 0, page: 1, limit: 10 });
});

app.get('/api/hotels/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Test Hotel',
    city: 'Istanbul',
    country: 'Turkey',
    rooms: [],
  });
});

// Mock search
app.get('/api/search/hotels', (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut are required' });
  }
  res.json({ hotels: [], total: 0 });
});

// Mock booking
app.post('/api/bookings', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(201).json({
    id: 'booking-test-id',
    status: 'PENDING',
    totalPrice: 200,
  });
});

// Mock review
app.post('/api/reviews', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(201).json({
    id: 'review-test-id',
    rating: req.body.rating,
    comment: req.body.comment,
    isApproved: false,
  });
});

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

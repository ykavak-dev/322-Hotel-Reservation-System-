# Hotel Reservation System - Comprehensive Testing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement end-to-end test suites for backend (Jest + Supertest + SQLite) and frontend (Vitest + RTL + MSW) covering all critical paths, achieving 70%+ coverage.

**Architecture:**
- Backend tests use a separate SQLite database (`hotel_test.db`) initialized via Prisma, transactions rollback after each test for isolation. Supertest provides HTTP integration testing without needing a live server process.
- Frontend tests use MSW v2 to intercept API calls at the service worker level, ensuring fetch/axios calls are mocked consistently. Vitest runs in watch mode by default with coverage reports generated on demand.
- A root `test:ci` script runs backend tests first, then frontend tests sequentially.

**Tech Stack:** Jest, Supertest, ts-jest, Prisma, SQLite (backend) | Vitest, React Testing Library, MSW v2, v8-coverage (frontend)

---

## File Map

### Backend - New Files
```
apps/api/
├── tests/
│   ├── setup.ts              # Prisma test client + SQLite DB init/teardown
│   ├── helpers/
│   │   ├── auth.ts           # registerUser, loginUser, getAuthHeader helpers
│   │   └── seed.ts           # createTestHotel, createTestRoom, createTestBooking
│   ├── auth.test.ts          # Auth routes
│   ├── hotels.test.ts        # Hotel CRUD + access control
│   ├── search.test.ts        # Search filters + availability
│   ├── bookings.test.ts      # Booking flow + overbooking + cancellation
│   └── reviews.test.ts       # Review blocking + rating recalc
├── jest.config.ts
├── tsconfig.test.json
└── .env.test
```

### Frontend - New Files
```
apps/web/src/__tests__/
├── setup.ts                  # MSW server init/teardown + mock reset
├── mocks/
│   ├── handlers.ts           # All API route handlers (auth, hotels, search, bookings)
│   └── browser.ts            # MSW browser worker setup
├── auth.test.tsx             # Login/Register form validation + submit
├── search.test.tsx          # Filter application + hotel card render + empty state
├── booking-flow.test.tsx    # Price calculation + form validation + confirmation
├── dashboard.test.tsx       # Table render + action button states
└── vitest.config.ts
```

### Root - New/Modified Files
```
hotel-reservation-system/
├── package.json              # Add test:ci, test:backend, test:frontend scripts
├── apps/
│   ├── api/jest.config.ts
│   ├── api/.env.test
│   └── web/vitest.config.ts
└── package.json
```

---

## Task 1: Backend Test Infrastructure

**Files:**
- Create: `apps/api/tests/setup.ts`
- Create: `apps/api/tests/helpers/auth.ts`
- Create: `apps/api/tests/helpers/seed.ts`
- Create: `apps/api/jest.config.ts`
- Create: `apps/api/tsconfig.test.json`
- Create: `apps/api/.env.test`
- Modify: `apps/api/package.json` (add test scripts + jest packages)

- [ ] **Step 1: Create `apps/api/.env.test`**

```env
DATABASE_URL="file:./hotel_test.db"
JWT_SECRET="test-jwt-secret-for-testing-only"
REFRESH_TOKEN_SECRET="test-refresh-secret-for-testing-only"
NODE_ENV="test"
```

- [ ] **Step 2: Create `apps/api/tsconfig.test.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "rootDir": ".",
    "outDir": "./dist-test",
    "types": ["jest", "node"],
    "esModuleInterop": true,
    "strict": false
  },
  "include": ["tests/**/*", "src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `apps/api/jest.config.ts`**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/routes/**/*.ts',
    'src/middleware/**/*.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 60, lines: 70, statements: 70 },
  },
  forceExit: true,
  detectOpenHandles: true,
};

export default config;
```

- [ ] **Step 4: Create `apps/api/tests/setup.ts`**

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);

export const testDbPath = path.join(__dirname, '../hotel_test.db');
export const testDbUrl = `file:${testDbPath}`;

export const prisma = new PrismaClient({
  datasources: { db: { url: testDbUrl } },
});

export async function resetTestDb(): Promise<void> {
  // Delete and recreate the SQLite DB fresh for each test suite run
  const fs = await import('fs');
  const dbPath = path.join(__dirname, '../../hotel_test.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  // Run prisma migrate to create schema
  process.env.DATABASE_URL = testDbUrl;
  await execAsync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });
}

beforeAll(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

- [ ] **Step 5: Create `apps/api/tests/helpers/auth.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { hash } from 'bcryptjs';

export async function registerUser(
  app: Express,
  email: string,
  password: string,
  firstName = 'Test',
  lastName = 'User',
  role: 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN' = 'CUSTOMER'
) {
  const res = await supertest(app)
    .post('/api/auth/register')
    .send({ email, password, firstName, lastName, role });

  return res;
}

export async function loginUser(app: Express, email: string, password: string) {
  const res = await supertest(app)
    .post('/api/auth/login')
    .send({ email, password });

  return res;
}

export function getAuthHeader(token: string): string {
  return `Bearer ${token}`;
}
```

- [ ] **Step 6: Create `apps/api/tests/helpers/seed.ts`**

```typescript
import { PrismaClient, UserRole, RoomType, BookingStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { addDays } from 'date-fns';

export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<{
    email: string; password: string; firstName: string; lastName: string; role: UserRole;
  }> = {}
) {
  const email = overrides.email ?? `test-${Date.now()}@example.com`;
  const password = overrides.password ?? 'TestPassword123!';
  const passwordHash = await hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      role: overrides.role ?? 'CUSTOMER',
      isActive: true,
    },
  });
}

export async function createTestHotel(
  prisma: PrismaClient,
  ownerId: string,
  overrides: Partial<{
    name: string; city: string; country: string; isVerified: boolean;
  }> = {}
) {
  return prisma.hotel.create({
    data: {
      name: overrides.name ?? 'Test Hotel',
      address: '123 Test Street',
      city: overrides.city ?? 'Istanbul',
      country: overrides.country ?? 'Turkey',
      amenities: ['wifi', 'pool'],
      images: ['https://example.com/hotel.jpg'],
      isVerified: overrides.isVerified ?? false,
      ownerId,
    },
  });
}

export async function createTestRoom(
  prisma: PrismaClient,
  hotelId: string,
  overrides: Partial<{
    type: RoomType; pricePerNight: number; totalQuantity: number;
  }> = {}
) {
  return prisma.room.create({
    data: {
      hotelId,
      type: overrides.type ?? 'SINGLE',
      description: 'A nice test room',
      pricePerNight: overrides.pricePerNight ?? 100,
      capacity: 2,
      bedType: 'Queen',
      amenities: ['wifi', 'ac'],
      images: ['https://example.com/room.jpg'],
      totalQuantity: overrides.totalQuantity ?? 5,
      isActive: true,
    },
  });
}

export async function createTestBooking(
  prisma: PrismaClient,
  userId: string,
  roomId: string,
  overrides: Partial<{
    checkIn: Date; checkOut: Date; status: BookingStatus; numberOfGuests: number;
  }> = {}
) {
  const checkIn = overrides.checkIn ?? addDays(new Date(), 1);
  const checkOut = overrides.checkOut ?? addDays(new Date(), 3);

  return prisma.booking.create({
    data: {
      userId,
      roomId,
      checkIn,
      checkOut,
      numberOfGuests: overrides.numberOfGuests ?? 2,
      totalPrice: 200,
      status: overrides.status ?? 'CONFIRMED',
    },
  });
}
```

- [ ] **Step 7: Update `apps/api/package.json` scripts and devDependencies**

Add to devDependencies:
```
"jest": "^29.7.0",
"ts-jest": "^29.1.0",
"@types/jest": "^29.5.0",
"supertest": "^6.3.0",
"@types/supertest": "^6.0.0",
"@types/bcryptjs": "^2.4.6",
"date-fns": "^4.1.0"
```

Replace/Add scripts:
```json
"test": "jest",
"test:coverage": "jest --coverage",
"test:ci": "jest --coverage --coverageThreshold"
```

---

## Task 2: Auth Test Suite

**Files:**
- Create: `apps/api/tests/auth.test.ts`

- [ ] **Step 1: Write `apps/api/tests/auth.test.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { prisma } from '../setup';
import { createTestUser } from '../helpers/seed';

let app: Express;

beforeAll(async () => {
  // Import app after setup initializes env
  const server = (await import('../../src/server')).default;
  app = server;
});

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
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  it('POST /api/auth/register - rejects duplicate email', async () => {
    const email = `dup-${Date.now()}@test.com`;
    await createTestUser(prisma, { email });

    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'StrongPass123!',
        firstName: 'Dup',
        lastName: 'User',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/auth/register - rejects weak password', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        email: `weak-${Date.now()}@test.com`,
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('password');
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
    const email = `login-${Date.now()}@test.com`;
    const password = 'StrongPass123!';
    await createTestUser(prisma, { email, password });

    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /api/auth/login - returns 401 on wrong password', async () => {
    const email = `wrongpass-${Date.now()}@test.com`;
    await createTestUser(prisma, { email, password: 'CorrectPass123!' });

    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass123!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid');
  });

  it('POST /api/auth/login - returns 401 for non-existent user', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'AnyPass123!' });

    expect(res.status).toBe(401);
  });
});

describe('Auth - JWT Protection', () => {
  it('GET /api/hotels - allows public access to verified hotels', async () => {
    const res = await supertest(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/hotels/:id - denies access to unverified hotels for non-admins', async () => {
    const owner = await createTestUser(prisma, {}, 'HOTEL_ADMIN');
    const hotel = await prisma.hotel.create({
      data: {
        name: 'Unverified Hotel',
        address: '123 Test',
        city: 'Istanbul',
        country: 'Turkey',
        ownerId: owner.id,
        isVerified: false,
      },
    });

    const res = await supertest(app).get(`/api/hotels/${hotel.id}`);
    expect(res.status).toBe(403);
  });

  it('POST /api/hotels - rejects unauthenticated request', async () => {
    const res = await supertest(app)
      .post('/api/hotels')
      .send({ name: 'My Hotel', address: '123', city: 'Istanbul', country: 'Turkey' });

    expect(res.status).toBe(401);
  });
});

describe('Auth - Refresh Token Rotation', () => {
  it('POST /api/auth/refresh - issues new tokens on valid refresh token', async () => {
    const email = `refresh-${Date.now()}@test.com`;
    await createTestUser(prisma, { email });

    const loginRes = await supertest(app)
      .post('/api/auth/login')
      .send({ email, password: 'StrongPass123!' });

    const { refreshToken } = loginRes.body;

    const res = await supertest(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.refreshToken).not.toBe(refreshToken); // rotated
  });
});
```

---

## Task 3: Hotels Test Suite

**Files:**
- Create: `apps/api/tests/hotels.test.ts`

- [ ] **Step 1: Write `apps/api/tests/hotels.test.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { prisma } from '../setup';
import { createTestUser, createTestHotel, createTestRoom } from '../helpers/seed';

let app: Express;
let customerToken: string;
let hotelAdminToken: string;
let systemAdminToken: string;
let customerId: string;
let hotelAdminId: string;
let systemAdminId: string;

beforeAll(async () => {
  const server = (await import('../../src/server')).default;
  app = server;

  // Create users and login
  const customerRes = await createTestUser(prisma, {}, 'CUSTOMER');
  customerId = customerRes.id;
  const customerLogin = await supertest(app)
    .post('/api/auth/login')
    .send({ email: customerRes.email, password: 'TestPassword123!' });
  customerToken = customerLogin.body.token;

  const adminRes = await createTestUser(prisma, {}, 'HOTEL_ADMIN');
  hotelAdminId = adminRes.id;
  const adminLogin = await supertest(app)
    .post('/api/auth/login')
    .send({ email: adminRes.email, password: 'TestPassword123!' });
  hotelAdminToken = adminLogin.body.token;

  const sysAdminRes = await createTestUser(prisma, {}, 'SYSTEM_ADMIN');
  systemAdminId = sysAdminRes.id;
  const sysLogin = await supertest(app)
    .post('/api/auth/login')
    .send({ email: sysAdminRes.email, password: 'TestPassword123!' });
  systemAdminToken = sysLogin.body.token;
});

describe('Hotels - Public Access', () => {
  it('GET /api/hotels - returns only verified hotels', async () => {
    const res = await supertest(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((hotel: any) => expect(hotel.isVerified).toBe(true));
  });

  it('GET /api/hotels/:id - returns verified hotel details', async () => {
    const verifiedHotel = await prisma.hotel.create({
      data: {
        name: 'Verified Hotel',
        address: '123 Verified',
        city: 'Istanbul',
        country: 'Turkey',
        ownerId: hotelAdminId,
        isVerified: true,
      },
    });

    const res = await supertest(app).get(`/api/hotels/${verifiedHotel.id}`);
    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(true);
  });
});

describe('Hotels - Hotel Admin CRUD', () => {
  it('POST /api/hotels - creates hotel for HOTEL_ADMIN', async () => {
    const res = await supertest(app)
      .post('/api/hotels')
      .set('Authorization', `Bearer ${hotelAdminToken}`)
      .send({
        name: 'My Hotel',
        address: '456 Admin St',
        city: 'Ankara',
        country: 'Turkey',
        description: 'A nice place',
        amenities: ['wifi', 'pool'],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Hotel');
    expect(res.body.isVerified).toBe(false); // pending approval
  });

  it('POST /api/hotels - rejects CUSTOMER trying to create hotel', async () => {
    const res = await supertest(app)
      .post('/api/hotels')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Not Allowed Hotel',
        address: '789 Customer St',
        city: 'Istanbul',
        country: 'Turkey',
      });

    expect(res.status).toBe(403);
  });

  it('PUT /api/hotels/:id - updates own hotel', async () => {
    const hotel = await createTestHotel(prisma, hotelAdminId, { name: 'Old Name' });

    const res = await supertest(app)
      .put(`/api/hotels/${hotel.id}`)
      .set('Authorization', `Bearer ${hotelAdminToken}`)
      .send({ name: 'Updated Name', description: 'New description' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('PUT /api/hotels/:id - rejects update of another admin hotel', async () => {
    const otherAdmin = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@test.com`,
        passwordHash: 'dummy',
        firstName: 'Other',
        lastName: 'Admin',
        role: 'HOTEL_ADMIN',
        isActive: true,
      },
    });
    const otherHotel = await createTestHotel(prisma, otherAdmin.id, { name: 'Other Hotel' });

    const res = await supertest(app)
      .put(`/api/hotels/${otherHotel.id}`)
      .set('Authorization', `Bearer ${hotelAdminToken}`)
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(403);
  });

  it('DELETE /api/hotels/:id - deletes own hotel', async () => {
    const hotel = await createTestHotel(prisma, hotelAdminId, { name: 'To Delete' });

    const res = await supertest(app)
      .delete(`/api/hotels/${hotel.id}`)
      .set('Authorization', `Bearer ${hotelAdminToken}`);

    expect(res.status).toBe(204);
  });
});

describe('Hotels - System Admin Verify/Reject', () => {
  it('PATCH /api/admin/hotels/:id/verify - system admin can verify a hotel', async () => {
    const hotel = await createTestHotel(prisma, hotelAdminId, { isVerified: false });

    const res = await supertest(app)
      .patch(`/api/admin/hotels/${hotel.id}/verify`)
      .set('Authorization', `Bearer ${systemAdminToken}`)
      .send({ verified: true });

    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(true);
  });

  it('PATCH /api/admin/hotels/:id/verify - hotel admin cannot verify hotels', async () => {
    const hotel = await createTestHotel(prisma, hotelAdminId, { isVerified: false });

    const res = await supertest(app)
      .patch(`/api/admin/hotels/${hotel.id}/verify`)
      .set('Authorization', `Bearer ${hotelAdminToken}`)
      .send({ verified: true });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/admin/hotels/:id/reject - system admin can reject with reason', async () => {
    const hotel = await createTestHotel(prisma, hotelAdminId, { isVerified: false });

    const res = await supertest(app)
      .patch(`/api/admin/hotels/${hotel.id}/reject`)
      .set('Authorization', `Bearer ${systemAdminToken}`)
      .send({ reason: 'Invalid documents provided' });

    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(false);
    expect(res.body.rejectionReason).toBe('Invalid documents provided');
  });
});
```

---

## Task 4: Search Test Suite

**Files:**
- Create: `apps/api/tests/search.test.ts`

- [ ] **Step 1: Write `apps/api/tests/search.test.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { prisma } from '../setup';
import { createTestUser, createTestHotel, createTestRoom } from '../helpers/seed';
import { addDays } from 'date-fns';

let app: Express;
let customerToken: string;
let customerId: string;

beforeAll(async () => {
  const server = (await import('../../src/server')).default;
  app = server;

  const customerRes = await createTestUser(prisma, {}, 'CUSTOMER');
  customerId = customerRes.id;
  const loginRes = await supertest(app)
    .post('/api/auth/login')
    .send({ email: customerRes.email, password: 'TestPassword123!' });
  customerToken = loginRes.body.token;
});

describe('Search - Filter Combinations', () => {
  let hotelId: string;

  beforeAll(async () => {
    const hotel = await createTestHotel(prisma, customerId, { city: 'Istanbul' });
    hotelId = hotel.id;
    await createTestRoom(prisma, hotelId, { type: 'SINGLE', pricePerNight: 100 });
    await createTestRoom(prisma, hotelId, { type: 'SUITE', pricePerNight: 300 });
  });

  it('GET /api/search - filters by city', async () => {
    const res = await supertest(app).get('/api/search?city=Istanbul');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
    res.body.hotels.forEach((h: any) => expect(h.city).toBe('Istanbul'));
  });

  it('GET /api/search - filters by price range', async () => {
    const res = await supertest(app).get('/api/search?minPrice=50&maxPrice=200');
    expect(res.status).toBe(200);
    res.body.hotels.forEach((h: any) => {
      const minRoomPrice = Math.min(...h.rooms.map((r: any) => r.pricePerNight));
      expect(minRoomPrice).toBeGreaterThanOrEqual(50);
      expect(minRoomPrice).toBeLessThanOrEqual(200);
    });
  });

  it('GET /api/search - filters by amenities', async () => {
    await prisma.hotel.update({ where: { id: hotelId }, data: { amenities: ['wifi', 'pool', 'gym'] } });

    const res = await supertest(app).get('/api/search?amenities=wifi,pool');
    expect(res.status).toBe(200);
    res.body.hotels.forEach((h: any) => {
      const hasAllAmenities = ['wifi', 'pool'].every(a => h.amenities.includes(a));
      expect(hasAllAmenities).toBe(true);
    });
  });

  it('GET /api/search - combines city + price + amenities', async () => {
    const res = await supertest(app)
      .get('/api/search?city=Istanbul&minPrice=50&maxPrice=350&amenities=wifi');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
  });
});

describe('Search - Availability Logic', () => {
  let roomId: string;

  beforeAll(async () => {
    const hotel = await createTestHotel(prisma, customerId, { city: 'Paris' });
    const room = await createTestRoom(prisma, hotel.id, { totalQuantity: 2, pricePerNight: 150 });
    roomId = room.id;

    // Book 2 of 2 rooms (make them COMPLETED so they count toward availability)
    for (let i = 0; i < 2; i++) {
      const user = await prisma.user.create({
        data: {
          email: `booked-${i}-${Date.now()}@test.com`,
          passwordHash: 'dummy',
          firstName: 'Booked',
          lastName: 'User',
          isActive: true,
        },
      });
      await prisma.booking.create({
        data: {
          userId: user.id,
          roomId,
          checkIn: addDays(new Date(), 5),
          checkOut: addDays(new Date(), 7),
          numberOfGuests: 1,
          totalPrice: 300,
          status: 'CONFIRMED',
        },
      });
    }
  });

  it('GET /api/search - shows 0 availability when all rooms are booked', async () => {
    const res = await supertest(app)
      .get(`/api/search?roomType=SINGLE&checkIn=${addDays(new Date(), 5).toISOString()}&checkOut=${addDays(new Date(), 7).toISOString()}`);

    expect(res.status).toBe(200);
    // The room should show 0 available
    const room = res.body.hotels?.[0]?.rooms?.[0];
    if (room) expect(room.availableQuantity).toBe(0);
  });

  it('GET /api/search - same day checkout returns availability', async () => {
    const res = await supertest(app)
      .get(`/api/search?checkIn=${new Date().toISOString()}&checkOut=${addDays(new Date(), 1).toISOString()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
  });

  it('GET /api/search - rejects past check-in dates', async () => {
    const res = await supertest(app)
      .get(`/api/search?checkIn=${addDays(new Date(), -5).toISOString()}&checkOut=${new Date().toISOString()}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('past');
  });
});
```

---

## Task 5: Bookings Test Suite

**Files:**
- Create: `apps/api/tests/bookings.test.ts`

- [ ] **Step 1: Write `apps/api/tests/bookings.test.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { prisma } from '../setup';
import { createTestUser, createTestHotel, createTestRoom, createTestBooking } from '../helpers/seed';
import { addDays, subHours } from 'date-fns';

let app: Express;
let customerToken: string;
let customerId: string;
let hotelAdminId: string;
let roomId: string;

beforeAll(async () => {
  const server = (await import('../../src/server')).default;
  app = server;

  const customerRes = await createTestUser(prisma, {}, 'CUSTOMER');
  customerId = customerRes.id;
  const loginRes = await supertest(app)
    .post('/api/auth/login')
    .send({ email: customerRes.email, password: 'TestPassword123!' });
  customerToken = loginRes.body.token;

  const adminRes = await createTestUser(prisma, {}, 'HOTEL_ADMIN');
  hotelAdminId = adminRes.id;

  const hotel = await createTestHotel(prisma, hotelAdminId);
  const room = await createTestRoom(prisma, hotel.id, { totalQuantity: 1, pricePerNight: 100 });
  roomId = room.id;
});

describe('Bookings - Overbooking Prevention', () => {
  it('POST /api/bookings - second simultaneous booking on last room fails', async () => {
    const checkIn = addDays(new Date(), 10);
    const checkOut = addDays(new Date(), 12);

    // Customer 1 books the only room
    const res1 = await supertest(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        roomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        numberOfGuests: 1,
      });

    expect(res1.status).toBe(201);

    // Customer 2 (different user) tries to book the same room - should fail
    const customer2Res = await createTestUser(prisma, { email: `cust2-${Date.now()}@test.com` }, 'CUSTOMER');
    const login2 = await supertest(app)
      .post('/api/auth/login')
      .send({ email: customer2Res.email, password: 'TestPassword123!' });
    const token2 = login2.body.token;

    const res2 = await supertest(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        roomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        numberOfGuests: 1,
      });

    expect(res2.status).toBe(409); // conflict - no availability
  });
});

describe('Bookings - Cancellation Refund Calculation', () => {
  it('DELETE /api/bookings/:id - full refund when cancelled > 48 hours before check-in', async () => {
    const futureBooking = await createTestBooking(prisma, customerId, roomId, {
      checkIn: addDays(new Date(), 72), // 72h from now
      checkOut: addDays(new Date(), 74),
      status: 'CONFIRMED',
    });

    const res = await supertest(app)
      .delete(`/api/bookings/${futureBooking.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.refundAmount).toBe(100); // full refund

    // Verify payment refunded
    const payment = await prisma.payment.findFirst({ where: { bookingId: futureBooking.id } });
    expect(payment?.status).toBe('REFUNDED');
  });

  it('DELETE /api/bookings/:id - 50% refund when cancelled 24-48 hours before check-in', async () => {
    const nearBooking = await createTestBooking(prisma, customerId, roomId, {
      checkIn: addDays(new Date(), 36), // 36h from now (within 24-48h window)
      checkOut: addDays(new Date(), 38),
      status: 'CONFIRMED',
    });

    // Update payment to PAID
    await prisma.payment.create({
      data: {
        bookingId: nearBooking.id,
        amount: 200,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    const res = await supertest(app)
      .delete(`/api/bookings/${nearBooking.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.refundAmount).toBe(100); // 50% of 200
  });

  it('DELETE /api/bookings/:id - no refund when cancelled < 24 hours before check-in', async () => {
    const veryNearBooking = await createTestBooking(prisma, customerId, roomId, {
      checkIn: addDays(new Date(), 12), // 12h from now (< 24h window)
      checkOut: addDays(new Date(), 14),
      status: 'CONFIRMED',
    });

    await prisma.payment.create({
      data: {
        bookingId: veryNearBooking.id,
        amount: 200,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    const res = await supertest(app)
      .delete(`/api/bookings/${veryNearBooking.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.refundAmount).toBe(0); // no refund
  });
});

describe('Bookings - Payment Flow', () => {
  it('POST /api/payments - creates payment on booking creation', async () => {
    const freshUser = await createTestUser(prisma, { email: `pay-${Date.now()}@test.com` });
    const loginRes = await supertest(app)
      .post('/api/auth/login')
      .send({ email: freshUser.email, password: 'TestPassword123!' });
    const token = loginRes.body.token;

    // Create a room with 1 quantity for this test
    const hotel = await createTestHotel(prisma, hotelAdminId);
    const room = await createTestRoom(prisma, hotel.id, { totalQuantity: 1 });

    const res = await supertest(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId: room.id,
        checkIn: addDays(new Date(), 5).toISOString(),
        checkOut: addDays(new Date(), 7).toISOString(),
        numberOfGuests: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.payment).toBeDefined();
    expect(res.body.payment.status).toBe('PENDING');
  });
});
```

---

## Task 6: Reviews Test Suite

**Files:**
- Create: `apps/api/tests/reviews.test.ts`

- [ ] **Step 1: Write `apps/api/tests/reviews.test.ts`**

```typescript
import supertest from 'supertest';
import { Express } from 'express';
import { prisma } from '../setup';
import { createTestUser, createTestHotel, createTestRoom } from '../helpers/seed';
import { addDays } from 'date-fns';

let app: Express;
let customerToken: string;
let customerId: string;
let hotelAdminId: string;
let verifiedHotelId: string;

beforeAll(async () => {
  const server = (await import('../../src/server')).default;
  app = server;

  const customerRes = await createTestUser(prisma, {}, 'CUSTOMER');
  customerId = customerRes.id;
  const loginRes = await supertest(app)
    .post('/api/auth/login')
    .send({ email: customerRes.email, password: 'TestPassword123!' });
  customerToken = loginRes.body.token;

  const adminRes = await createTestUser(prisma, {}, 'HOTEL_ADMIN');
  hotelAdminId = adminRes.id;

  const hotel = await createTestHotel(prisma, hotelAdminId, { isVerified: true });
  verifiedHotelId = hotel.id;
  await createTestRoom(prisma, hotel.id);
});

describe('Reviews - Booking Requirement', () => {
  it('POST /api/reviews - blocks review without completed booking', async () => {
    const res = await supertest(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        hotelId: verifiedHotelId,
        rating: 5,
        comment: 'Great hotel!',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('booking');
  });

  it('POST /api/reviews - allows review with completed booking', async () => {
    // Create a COMPLETED booking for the customer
    const room = await prisma.room.findFirst({ where: { hotelId: verifiedHotelId } });
    const booking = await prisma.booking.create({
      data: {
        userId: customerId,
        roomId: room!.id,
        checkIn: subDays(new Date(), 5),
        checkOut: subDays(new Date(), 3),
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'COMPLETED',
      },
    });

    const res = await supertest(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        hotelId: verifiedHotelId,
        bookingId: booking.id,
        rating: 5,
        comment: 'Amazing stay!',
      });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  it('POST /api/reviews - blocks duplicate review on same booking', async () => {
    const room = await prisma.room.findFirst({ where: { hotelId: verifiedHotelId } });
    const booking = await prisma.booking.create({
      data: {
        userId: customerId,
        roomId: room!.id,
        checkIn: subDays(new Date(), 10),
        checkOut: subDays(new Date(), 8),
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'COMPLETED',
      },
    });

    // First review succeeds
    await supertest(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ hotelId: verifiedHotelId, bookingId: booking.id, rating: 4, comment: 'Good' });

    // Second review on same booking should fail
    const res = await supertest(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ hotelId: verifiedHotelId, bookingId: booking.id, rating: 5, comment: 'Again' });

    expect(res.status).toBe(409);
  });
});

describe('Reviews - Average Rating Recalculation', () => {
  it('PATCH /api/admin/reviews/:id/approve - system admin approval updates hotel average rating', async () => {
    const sysAdmin = await createTestUser(prisma, { email: `sys-${Date.now()}@test.com` }, 'SYSTEM_ADMIN');
    const sysLogin = await supertest(app)
      .post('/api/auth/login')
      .send({ email: sysAdmin.email, password: 'TestPassword123!' });
    const sysToken = sysLogin.body.token;

    const hotel = await createTestHotel(prisma, hotelAdminId, { isVerified: true, averageRating: null });
    const room = await createTestRoom(prisma, hotel.id);
    const booking = await prisma.booking.create({
      data: {
        userId: customerId,
        roomId: room.id,
        checkIn: subDays(new Date(), 3),
        checkOut: subDays(new Date(), 1),
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'COMPLETED',
      },
    });

    // Create a pending review
    const review = await prisma.review.create({
      data: {
        userId: customerId,
        hotelId: hotel.id,
        bookingId: booking.id,
        rating: 4,
        comment: 'Nice hotel',
        isApproved: false,
      },
    });

    const res = await supertest(app)
      .patch(`/api/admin/reviews/${review.id}/approve`)
      .set('Authorization', `Bearer ${sysToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isApproved).toBe(true);

    // Verify hotel averageRating was recalculated
    const updatedHotel = await prisma.hotel.findUnique({ where: { id: hotel.id } });
    expect(updatedHotel?.averageRating).toBe(4);
  });
});

// Helper to get days in the past
function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
```

---

## Task 7: Frontend Test Infrastructure

**Files:**
- Create: `apps/web/src/__tests__/setup.ts`
- Create: `apps/web/src/__tests__/mocks/handlers.ts`
- Create: `apps/web/src/__tests__/mocks/browser.ts`
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/package.json` (add vitest, @testing-library, msw)

- [ ] **Step 1: Update `apps/web/package.json` devDependencies**

Add:
```
"vitest": "^1.5.0",
"@testing-library/react": "^15.0.0",
"@testing-library/jest-dom": "^6.4.0",
"@testing-library/user-event": "^14.5.0",
"msw": "^2.3.0",
"@vitejs/plugin-react": "same version already in deps"
```

Add scripts:
```json
"test": "vitest",
"test:coverage": "vitest run --coverage",
"test:ci": "vitest run --coverage"
```

- [ ] **Step 2: Create `apps/web/src/__tests__/mocks/handlers.ts`**

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth handlers
  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' },
    }, { status: 201 });
  }),

  http.post('/api/auth/login', ({ request }) => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' },
    });
  }),

  // Hotels handlers
  http.get('/api/hotels', () => {
    return HttpResponse.json([
      {
        id: 'hotel-1',
        name: 'Test Hotel Istanbul',
        city: 'Istanbul',
        country: 'Turkey',
        isVerified: true,
        averageRating: 4.2,
        amenities: ['wifi', 'pool'],
        images: ['https://example.com/hotel.jpg'],
        rooms: [
          { id: 'room-1', type: 'SINGLE', pricePerNight: 100, availableQuantity: 3 },
          { id: 'room-2', type: 'SUITE', pricePerNight: 250, availableQuantity: 1 },
        ],
      },
    ]);
  }),

  http.get('/api/hotels/:id', () => {
    return HttpResponse.json({
      id: 'hotel-1',
      name: 'Test Hotel Istanbul',
      city: 'Istanbul',
      country: 'Turkey',
      isVerified: true,
      averageRating: 4.2,
      amenities: ['wifi', 'pool'],
      images: ['https://example.com/hotel.jpg'],
      description: 'A lovely test hotel',
    });
  }),

  // Search handler
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');

    return HttpResponse.json({
      hotels: [
        {
          id: 'hotel-1',
          name: city ? `Hotel in ${city}` : 'Test Hotel',
          city: city ?? 'Istanbul',
          country: 'Turkey',
          isVerified: true,
          averageRating: 4.0,
          amenities: ['wifi', 'pool', 'gym'],
          images: ['https://example.com/hotel.jpg'],
          rooms: [
            { id: 'room-1', type: 'SINGLE', pricePerNight: 120, availableQuantity: 5 },
          ],
        },
      ],
    });
  }),

  // Bookings handlers
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'booking-new',
      roomId: body.roomId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      numberOfGuests: body.numberOfGuests,
      status: 'PENDING',
      totalPrice: 240,
      payment: { id: 'pay-1', status: 'PENDING' },
    }, { status: 201 });
  }),

  http.get('/api/bookings', () => {
    return HttpResponse.json([
      {
        id: 'booking-1',
        room: { hotel: { name: 'Test Hotel' }, type: 'SINGLE' },
        checkIn: '2026-05-10',
        checkOut: '2026-05-12',
        status: 'CONFIRMED',
        totalPrice: 200,
      },
    ]);
  }),

  http.delete('/api/bookings/:id', () => {
    return HttpResponse.json({ refundAmount: 200 });
  }),

  // Hotel admin dashboard
  http.get('/api/hotel-admin/dashboard', () => {
    return HttpResponse.json({
      stats: { totalBookings: 12, totalRevenue: 5400, occupancyRate: 72 },
      recentBookings: [],
    });
  }),
];
```

- [ ] **Step 3: Create `apps/web/src/__tests__/mocks/browser.ts`**

```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

- [ ] **Step 4: Create `apps/web/src/__tests__/setup.ts`**

```typescript
import { afterAll, beforeAll, afterEach } from 'vitest';
import { worker } from './mocks/browser';

// Start MSW server before all tests
beforeAll(() => worker.start({ onUnhandledRequest: 'bypass' }));

// Reset handlers after each test
afterEach(() => worker.resetHandlers());

// Clean up after all tests
afterAll(() => worker.stop());
```

- [ ] **Step 5: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 50,
        functions: 60,
        lines: 70,
        statements: 70,
      },
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/__tests__/**',
        '**/*.d.ts',
      ],
    },
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hotel/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
```

---

## Task 8: Frontend Auth Tests

**Files:**
- Create: `apps/web/src/__tests__/auth.test.tsx`

- [ ] **Step 1: Write `apps/web/src/__tests__/auth.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

const renderWithRouter = (ui: React.ReactElement) => {
  render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('LoginPage - Form Validation', () => {
  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be/i)).toBeInTheDocument();
    });
  });

  it('submits successfully with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});

describe('RegisterPage - Form Validation', () => {
  it('validates all required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for password mismatch', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'StrongPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass123!');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error message from failed registration', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'duplicate@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'StrongPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');

    // Override MSW handler for this specific test
    const { worker } = await import('../mocks/browser');
    worker.use(
      rest.post('/api/auth/register', (req, res, ctx) => {
        return res(ctx.status(409), ctx.json({ message: 'Email already exists' }));
      })
    );

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });
});
```

---

## Task 9: Frontend Search Tests

**Files:**
- Create: `apps/web/src/__tests__/search.test.tsx`

- [ ] **Step 1: Write `apps/web/src/__tests__/search.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { SearchPage } from '../pages/hotels/SearchPage';

describe('SearchPage - Filter Application', () => {
  it('renders hotel cards after search', async () => {
    render(
      <MemoryRouter initialEntries={['/search?city=Istanbul']}>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Hotel Istanbul')).toBeInTheDocument();
    });
  });

  it('updates URL when city filter changes', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    const cityInput = container.querySelector('input[placeholder*="city" i]') as HTMLInputElement;
    if (cityInput) {
      await user.clear(cityInput);
      await user.type(cityInput, 'Ankara');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(window.location.search).toContain('city=Ankara');
      });
    }
  });

  it('renders price range filter controls', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/price/i)).toBeInTheDocument();
  });

  it('renders amenities filter checkboxes', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('checkbox', { name: /wifi/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /pool/i })).toBeInTheDocument();
  });
});

describe('SearchPage - Empty State', () => {
  it('shows empty state when no hotels match filters', async () => {
    const { worker } = await import('../mocks/browser');
    worker.use(
      http.get('/api/search', () => {
        return HttpResponse.json({ hotels: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/search?city=NonExistentCity']}>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no hotels found/i)).toBeInTheDocument();
    });
  });
});
```

---

## Task 10: Frontend Booking Flow Tests

**Files:**
- Create: `apps/web/src/__tests__/booking-flow.test.tsx`

- [ ] **Step 1: Write `apps/web/src/__tests__/booking-flow.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { BookingPage } from '../pages/bookings/BookingPage';
import { ConfirmationPage } from '../pages/bookings/ConfirmationPage';

const renderBookingPage = () => {
  render(
    <MemoryRouter initialEntries={['/book/hotel-1/room-1']}>
      <Routes>
        <Route path="/book/:hotelId/:roomId" element={<BookingPage />} />
        <Route path="/booking/confirmation/:id" element={<ConfirmationPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('BookingPage - Price Calculation Display', () => {
  it('displays price per night and total price', async () => {
    renderBookingPage();

    await waitFor(() => {
      const priceElements = screen.getAllByText(/\$\d+/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  it('calculates total for multi-night stay', async () => {
    renderBookingPage();

    await waitFor(() => {
      const totalElement = screen.getByText(/total/i);
      expect(totalElement).toBeInTheDocument();
    });
  });
});

describe('BookingPage - Form Validation', () => {
  it('validates required guest count', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    const submitBtn = screen.getByRole('button', { name: /book now/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/number of guests is required/i)).toBeInTheDocument();
    });
  });

  it('validates guest count does not exceed room capacity', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    const guestInput = screen.getByLabelText(/guests/i);
    await user.clear(guestInput);
    await user.type(guestInput, '10'); // exceeds typical room capacity

    await user.click(screen.getByRole('button', { name: /book now/i }));

    await waitFor(() => {
      expect(screen.getByText(/exceeds maximum/i)).toBeInTheDocument();
    });
  });

  it('shows error when check-out is before check-in', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    // This would require date picker interaction - test the validation trigger
    const submitBtn = screen.getByRole('button', { name: /book now/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/check-out must be after check-in/i)).toBeInTheDocument();
    });
  });
});

describe('BookingPage - Confirmation Redirect', () => {
  it('redirects to confirmation page on successful booking', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    // Fill required fields
    const guestInput = screen.getByLabelText(/guests/i);
    await user.clear(guestInput);
    await user.type(guestInput, '2');

    // Submit
    await user.click(screen.getByRole('button', { name: /book now/i }));

    await waitFor(() => {
      expect(window.location.pathname).toMatch(/\/booking\/confirmation\//);
    }, { timeout: 3000 });
  });
});

describe('ConfirmationPage - Render', () => {
  it('displays booking reference number', async () => {
    render(
      <MemoryRouter initialEntries={['/booking/confirmation/booking-abc123']}>
        <ConfirmationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/booking.*abc123/i)).toBeInTheDocument();
    });
  });

  it('displays booking summary with dates and total', async () => {
    render(
      <MemoryRouter initialEntries={['/booking/confirmation/booking-abc123']}>
        <ConfirmationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/check-in/i)).toBeInTheDocument();
      expect(screen.getByText(/check-out/i)).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });
  });
});
```

---

## Task 11: Frontend Dashboard Tests

**Files:**
- Create: `apps/web/src/__tests__/dashboard.test.tsx`

- [ ] **Step 1: Write `apps/web/src/__tests__/dashboard.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { HotelAdminDashboard } from '../pages/hotel-admin/DashboardPage';
import { SystemAdminDashboard } from '../pages/admin/AdminDashboardPage';
import { BookingsTable } from '../components/bookings/BookingsTable';

const mockBookings = [
  { id: 'book-1', room: { hotel: { name: 'Hotel A' } }, checkIn: '2026-05-10', checkOut: '2026-05-12', status: 'CONFIRMED', totalPrice: 200 },
  { id: 'book-2', room: { hotel: { name: 'Hotel B' } }, checkIn: '2026-05-15', checkOut: '2026-05-17', status: 'PENDING', totalPrice: 150 },
];

describe('HotelAdminDashboard - Stats Rendering', () => {
  it('renders KPI cards with stats', async () => {
    render(
      <MemoryRouter>
        <HotelAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/total bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/revenue/i)).toBeInTheDocument();
    });
  });

  it('renders occupancy chart', async () => {
    render(
      <MemoryRouter>
        <HotelAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /chart/i })).toBeInTheDocument();
    });
  });
});

describe('BookingsTable - Render and Actions', () => {
  it('renders booking rows correctly', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    expect(screen.getByText('Hotel A')).toBeInTheDocument();
    expect(screen.getByText('Hotel B')).toBeInTheDocument();
  });

  it('shows status badge for each booking', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    expect(screen.getAllByText('CONFIRMED')).toHaveLength(1);
    expect(screen.getAllByText('PENDING')).toHaveLength(1);
  });

  it('disables cancel button for past bookings', async () => {
    const pastBookings = [
      { ...mockBookings[0], checkIn: '2024-01-01', checkOut: '2024-01-03' },
    ];
    render(<BookingsTable bookings={pastBookings} />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeDisabled();
  });

  it('enables cancel button for future bookings', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    const cancelBtn = screen.getAllByRole('button', { name: /cancel/i })[0];
    expect(cancelBtn).not.toBeDisabled();
  });
});

describe('SystemAdminDashboard - User Management', () => {
  it('renders users table', async () => {
    render(
      <MemoryRouter>
        <SystemAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/users/i)).toBeInTheDocument();
    });
  });
});
```

---

## Task 12: CI Script and Root Config

**Files:**
- Modify: `hotel-reservation-system/package.json`
- Create: `apps/api/tests/teardown.ts`

- [ ] **Step 1: Create `apps/api/tests/teardown.ts`**

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

afterAll(async () => {
  // Clean up test database file
  const fs = await import('fs');
  const dbPath = require('path').join(__dirname, '../hotel_test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
```

- [ ] **Step 2: Update `hotel-reservation-system/package.json`**

Add to scripts:
```json
"test:backend": "cd apps/api && npm test",
"test:frontend": "cd apps/web && npm test",
"test:ci": "npm run test:backend && npm run test:frontend",
"test:coverage": "npm run test:backend -- --coverage && npm run test:frontend -- --coverage"
```

- [ ] **Step 3: Verify all test dependencies resolve**

Run: `cd hotel-reservation-system && npm install --legacy-peer-deps`
Run: `cd apps/api && npm install jest ts-jest supertest @types/supertest @types/jest date-fns --save-dev --legacy-peer-deps`
Run: `cd apps/web && npm install vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw --save-dev --legacy-peer-deps`

---

## Task 13: Coverage Verification and Fixes

- [ ] **Step 1: Run backend coverage**

Run: `cd hotel-reservation-system/apps/api && npm run test:coverage 2>&1`
Expected output shows coverage table with lines/branches/functions

- [ ] **Step 2: Run frontend coverage**

Run: `cd hotel-reservation-system/apps/web && npm run test:coverage 2>&1`
Expected output shows coverage table

- [ ] **Step 3: Fix any uncovered lines below threshold**

Identify: `coverage/lcov-report/index.html` for frontend, `coverage/index.html` for backend
Fix: Add tests for any uncovered branches below 70%

---

## Spec Coverage Checklist

- [ ] Auth register customer/hotel admin validation → `auth.test.ts`
- [ ] Login success/failure → `auth.test.ts`
- [ ] JWT protected route access → `auth.test.ts`
- [ ] Refresh token rotation → `auth.test.ts`
- [ ] Public access to verified hotels only → `hotels.test.ts`
- [ ] Hotel admin CRUD with ownership restrictions → `hotels.test.ts`
- [ ] System admin verify/reject → `hotels.test.ts`
- [ ] Filter combinations (location + price + amenities) → `search.test.ts`
- [ ] Availability: book last room, verify 0 availability → `search.test.ts`
- [ ] Date edge cases: same day checkout, past dates → `search.test.ts`
- [ ] Overbooking prevention → `bookings.test.ts`
- [ ] Cancellation refund (>48h, 24-48h, <24h) → `bookings.test.ts`
- [ ] Payment success/failure flow → `bookings.test.ts`
- [ ] Block review without completed booking → `reviews.test.ts`
- [ ] Average rating recalculation → `reviews.test.ts`
- [ ] Auth pages form validation + error messages → `auth.test.tsx`
- [ ] Search filter application + hotel card render + empty state → `search.test.tsx`
- [ ] Booking price calculation + form validation + confirmation redirect → `booking-flow.test.tsx`
- [ ] Dashboards table render + action button disabled states → `dashboard.test.tsx`
- [ ] MSW mock all API calls → `mocks/handlers.ts`
- [ ] 70% coverage threshold configured → `jest.config.ts` + `vitest.config.ts`
- [ ] CI test script sequential → `package.json` scripts
- [ ] Separate test environment configs → `.env.test` + `vitest.config.ts`

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-hotel-testing.md`.**
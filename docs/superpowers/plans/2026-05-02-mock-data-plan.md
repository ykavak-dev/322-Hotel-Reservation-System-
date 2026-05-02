# Mock Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mock data mode so the frontend works without backend API - enabling Vercel deployment.

**Architecture:** Mock system intercepts API calls at the service layer. When `VITE_USE_MOCK=true`, functions in `api.ts` return mock data directly instead of making HTTP calls via axios.

**Tech Stack:** React, TypeScript, Vite, @tanstack/react-query, existing types in `src/types/`

---

## File Map

### New Files
- `apps/web/src/mocks/data.ts` - Static mock data (hotels, rooms, reviews, users, bookings)
- `apps/web/src/mocks/handlers.ts` - Mock handler functions matching api.ts signatures

### Modified Files
- `apps/web/src/services/api.ts` - Add mock mode branching at top of each function

### No Changes Required
- Pages and components use existing `api.ts` imports - mock mode transparent to them

---

## Task 1: Create Mock Data File

**Files:**
- Create: `apps/web/src/mocks/data.ts`

```typescript
// Mock hotels data
export const mockHotels = [
  {
    id: 'h1',
    name: 'Sunset Beach Resort',
    description: 'Luxurious beachfront property with stunning ocean views',
    address: '123 Beach Boulevard',
    city: 'Maui',
    country: 'USA',
    starRating: 5,
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    ],
    averageRating: 4.8,
    totalReviews: 342,
    cheapestRoomPrice: 299,
    availableRoomTypes: ['standard', 'deluxe', 'suite'],
  },
  // ... 7 more hotels with varied data
];

// Mock rooms per hotel
export const mockRooms = {
  h1: [
    {
      id: 'r1',
      type: 'standard',
      description: 'Comfortable room with garden view',
      pricePerNight: 299,
      capacity: 2,
      bedType: 'king',
      roomSize: 35,
      amenities: ['wifi', 'tv', 'minibar'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
      totalQuantity: 10,
      availableQuantity: 5,
    },
    // ... more rooms
  ],
  // ... rooms for each hotel
};

// Mock reviews
export const mockReviews = {
  h1: [
    {
      id: 'rev1',
      userId: 'u1',
      hotelId: 'h1',
      bookingId: 'b1',
      rating: 5,
      comment: 'Amazing stay! The views were breathtaking.',
      isApproved: true,
      createdAt: '2026-04-15',
      user: { firstName: 'John', lastName: 'Doe' },
    },
    // ... more reviews
  ],
  // ... reviews for each hotel
};

// Mock users
export const mockUsers = [
  {
    id: 'u1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
  },
  // ... hotel admins and system admin
];

// Mock bookings
export const mockBookings = [
  {
    id: 'b1',
    hotelId: 'h1',
    hotelName: 'Sunset Beach Resort',
    roomType: 'deluxe',
    checkIn: '2026-05-10',
    checkOut: '2026-05-15',
    guests: 2,
    totalPrice: 1495,
    status: 'confirmed',
  },
  // ... more bookings
];
```

- [ ] **Step 1: Create `apps/web/src/mocks/data.ts` with all mock data structures**

---

## Task 2: Create Mock Handlers

**Files:**
- Create: `apps/web/src/mocks/handlers.ts`

```typescript
import type { SearchResponse, AvailabilityResponse, ReviewListResponse } from '../types/hotel';
import type { BookingDetail, BookingResponse } from '../types/booking';
import type { AdminDashboardData, AdminBookingListResponse, RoomManagementItem } from '../types/admin';
import { mockHotels, mockRooms, mockReviews, mockUsers, mockBookings } from './data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockSearchHotels(params: Record<string, unknown>): Promise<SearchResponse> {
  await delay(300);
  return {
    hotels: mockHotels,
    total: mockHotels.length,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  };
}

export async function mockCheckAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<AvailabilityResponse> {
  await delay(200);
  return {
    hotelId,
    hotelName: mockHotels.find(h => h.id === hotelId)?.name ?? '',
    checkIn,
    checkOut,
    guests,
    availableRooms: mockRooms[hotelId as keyof typeof mockRooms] ?? [],
  };
}

export async function mockGetHotelReviews(hotelId: string): Promise<ReviewListResponse> {
  await delay(250);
  return {
    reviews: mockReviews[hotelId as keyof typeof mockReviews] ?? [],
    total: (mockReviews[hotelId as keyof typeof mockReviews] ?? []).length,
    page: 1,
    totalPages: 1,
  };
}

// Continue with all 30+ handlers...
```

- [ ] **Step 1: Create `apps/web/src/mocks/handlers.ts` with all mock handlers**

---

## Task 3: Add Mock Mode to API Service

**Files:**
- Modify: `apps/web/src/services/api.ts:1-10` (add import)
- Modify: `apps/web/src/services/api.ts:51-54` (add mock branching for searchHotels)
- Modify: All other API functions similarly

```typescript
// Add at top of file
import * as mockHandlers from './mocks/handlers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Modify searchHotels
export async function searchHotels(params: Record<string, unknown>): Promise<SearchResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockSearchHotels(params);
  }
  const { data } = await api.get<SearchResponse>('/search/hotels', { params });
  return data;
}

// Apply same pattern to all 30+ functions...
```

- [ ] **Step 1: Add mock import and USE_MOCK constant**
- [ ] **Step 2: Add mock branching to searchHotels**
- [ ] **Step 3: Add mock branching to remaining functions**

---

## Task 4: Create .env.example Entry

**Files:**
- Modify: `apps/web/.env.example`

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

- [ ] **Step 1: Add VITE_USE_MOCK to .env.example**

---

## Task 5: Build and Verify

**Commands:**
```bash
cd apps/web && npm run build
```

- [ ] **Step 1: Run build to verify no errors**
- [ ] **Step 2: Fix any TypeScript errors if they occur**

---

## Task 6: Commit Changes

```bash
git add -A && git commit -m "feat: add mock data mode for frontend-only deployment"
git push
```

- [ ] **Step 1: Commit and push**

---

## Verification Checklist

After deployment, verify these pages work:

1. [ ] Home page - hotel cards displayed
2. [ ] Search page - hotel list with filters
3. [ ] Hotel detail - rooms and reviews
4. [ ] Login - UI works, stores mock token
5. [ ] My Bookings - booking list shown
6. [ ] Admin pages - mock data displays

## Spec Coverage Check

- [x] Mock data file created
- [x] Mock handlers created
- [x] API service updated with mock branching
- [x] Environment variable added
- [x] Build verification
- [x] All 30+ API functions covered

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-mock-data-plan.md`.**

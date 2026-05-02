# Mock Data Implementation Plan
**Date:** 2026-05-02
**Project:** Hotel Reservation System - Frontend with Mock Data

## Overview

Add mock data mode to the frontend so all pages work without a backend API. This allows the Vercel deployment to be functional immediately.

## Architecture

### Environment Variable
- `VITE_USE_MOCK` - When set to `true`, API calls return mock data instead of hitting the real backend
- Default: `false` (real API mode)

### File Structure
```
src/mocks/
  data.ts        # All mock data (hotels, reviews, bookings, users)
  handlers.ts   # Mock API handler functions matching api.ts signatures
  index.ts      # Re-exports for easy imports
```

### Implementation Strategy

The mock system intercepts API calls at the service layer. When `VITE_USE_MOCK=true`, the `api.ts` functions return mock data directly, bypassing axios HTTP calls.

**Key files to modify:**
1. `src/services/api.ts` - Add mock mode branching
2. `src/services/api.ts` - All 30+ API functions need mock counterparts

**New files to create:**
1. `src/mocks/data.ts` - Static mock data
2. `src/mocks/handlers.ts` - Mock handler functions

## Mock Data Specifications

### Hotels (8 hotels)
```typescript
{
  id: string,
  name: string,
  description: string,
  address: string,
  city: string,
  country: string,
  starRating: number (3-5),
  amenities: string[],
  images: string[] (Unsplash URLs),
  averageRating: number (3.5-5.0),
  totalReviews: number (10-500),
  cheapestRoomPrice: number (50-500),
  availableRoomTypes: string[]
}
```

### Rooms per Hotel (2-4 room types)
```typescript
{
  id: string,
  type: 'standard' | 'deluxe' | 'suite' | 'presidential',
  description: string,
  pricePerNight: number,
  capacity: number (1-6),
  bedType: 'single' | 'double' | 'king' | 'queen',
  roomSize: number (20-100),
  amenities: string[],
  images: string[],
  totalQuantity: number,
  availableQuantity: number
}
```

### Reviews (5-15 per hotel)
```typescript
{
  id: string,
  userId: string,
  hotelId: string,
  bookingId: string,
  rating: number (1-5),
  comment: string,
  isApproved: boolean,
  createdAt: string,
  user: { firstName: string, lastName: string }
}
```

### Users (3 types)
- Regular users (for bookings, reviews)
- Hotel admins (for hotel management)
- System admin (for platform management)

### Bookings (for My Bookings page)
```typescript
{
  id: string,
  hotelId: string,
  hotelName: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  totalPrice: number,
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
}
```

### Dashboard Stats
- Admin dashboard: pending hotels count, total users, total bookings, revenue
- Hotel admin: today's bookings, occupancy rate, revenue, pending requests

## Pages to Cover

| Page | Mock Data Needed |
|------|-----------------|
| Home | Hotel cards with ratings, destination grid |
| Search | Hotel list with filters |
| Hotel Detail | Hotel info, rooms, reviews |
| Login | UI only (store mock token) |
| Register | UI only |
| My Bookings | Booking list |
| User Profile | User data |
| Admin Dashboard | Pending hotels, stats |
| Admin Hotels | All hotels list |
| Admin Users | Users list |
| Admin Bookings | All bookings |
| Admin Reviews | Reviews list |
| Hotel Admin Dashboard | Stats |
| Hotel Admin Bookings | Hotel bookings |
| Hotel Admin Rooms | Rooms management |
| Hotel Admin Profile | Hotel data |

## Error Handling

Mock functions simulate realistic delays (200-500ms) to match real API behavior. Error states are also simulated for testing purposes (e.g., occasional "network error").

## Testing Checklist

1. Home page displays hotel cards
2. Search page filters work
3. Hotel detail page shows rooms and reviews
4. Login/Register flow works (stores token in localStorage)
5. My Bookings shows booking list
6. Admin pages show mock data
7. Hotel admin pages show mock data
8. Build succeeds with `npm run build`
9. Vercel deployment works

## Dependencies

No new npm packages needed. Uses existing type definitions in `src/types/`.

# Booking Flow Implementation Plan

## Context

The hotel reservation system has a working backend (Express + Prisma) with booking and payment services already implemented. The frontend (React + Vite + shadcn/ui) has auth pages and hotel search/detail pages but is missing the complete booking flow. This plan covers the customer-facing booking checkout, payment, confirmation, and my-bookings pages.

## Backend Gaps

### 1. Missing `GET /bookings/:id` should return room with hotel info
**Currently:** `getBookingById` in booking.service.ts already includes room + hotel + payments.

### 2. Missing `POST /payments/process` card token handling
**Currently:** Payment service accepts `cardToken` but no frontend API function generates one. The payment form is mock (card number, expiry, CVV) so we'll accept a mock token approach.

### 3. Missing refund policy calculation on cancellation response
**Currently:** `cancelBooking` returns `refundAmount` and `refundPolicy` strings correctly.

## Frontend Implementation

### Task 1: Booking Checkout Page — `/booking/:roomId`

**Page:** `apps/web/src/pages/bookings/CheckoutPage.tsx`

**URL Params:** `?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=N&roomId=...&price=N&hotelName=...&roomType=...&hotelImage=...`

**Components to create:**
- `BookingSummaryCard` — left column: hotel image, name, room type, dates, nights count, price breakdown
- `GuestDetailsForm` — first name, last name, email, phone, special requests textarea
- `"I'm booking for someone else" checkbox + conditional extra guest fields (firstName, lastName, email, phone)
- `PriceSummaryCard` — sticky right column: room price × nights, taxes (estimated 12%), total
- `CheckoutPage` — breadcrumb `Search > Hotel > Room > Booking`, two-column layout

**Validation:**
```typescript
// booking checkout schema
firstName, lastName, email, phone: required strings
specialRequests: optional string max 500
bookingForSomeoneElse: boolean
if true: guestFirstName, guestLastName, guestEmail, guestPhone
```

**Behavior:**
- On mount: read URL params to pre-populate room/hotel info
- On "Confirm Booking" click: POST `/bookings` with roomId, checkIn, checkOut, numberOfGuests, specialRequests
- Creates PENDING booking
- Redirect to `/payment/:bookingId` on success
- Show loading state + disable button during mutation

### Task 2: Payment Page — `/payment/:bookingId`

**Page:** `apps/web/src/pages/bookings/PaymentPage.tsx`

**Components to create:**
- `SecurePaymentHeader` — lock icon + "Secure Payment"
- `CreditCardForm` — card number (formatted as `XXXX XXXX XXXX XXXX`), expiry (MM/YY), CVV, cardholder name
- `BillingAddressForm` — street, city, state, zip, country
- `OrderSummary` — hotel name, dates, total
- `PaymentPage` — combines all above

**Validation:**
```typescript
// payment schema
cardNumber: string pattern /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
cardExpiry: string pattern /^(0[1-9]|1[0-2])\/([0-9]{2})$/
cvv: string pattern /^\d{3,4}$/
cardholderName: string min 2
billingAddress: { street, city, state, zip, country } all required
```

**Behavior:**
- On mount: GET `/bookings/:id` to show order summary
- On "Pay Now" click:
  - Generate mock card token (base64 random)
  - POST `/payments/process` with bookingId, paymentMethod: CREDIT_CARD, cardToken
  - Show loading state with 3-second simulated delay
  - On success: redirect to `/booking-confirmation/:bookingId`
  - On failure: show error message + "Try Again" button

**States:**
- Default: forms
- Loading: button disabled with spinner, "Processing..."
- Success: checkmark animation, redirect after 1.5s
- Failure: red alert, retry button

### Task 3: Booking Confirmation Page — `/booking-confirmation/:id`

**Page:** `apps/web/src/pages/bookings/ConfirmationPage.tsx`

**Components to create:**
- `SuccessBanner` — green banner with checkmark animation, booking reference `HR-{YEAR}-{number}`
- `HotelInfoCard` — hotel name, address, check-in time (default 3:00 PM), contact phone
- `BookingDetailsCard` — check-in/check-out dates, room type, guests, total price
- `ConfirmationPage` — assembles all

**Behavior:**
- On mount: GET `/bookings/:id`
- "Add to Calendar" button: generates and downloads a mock .ics file
- "View My Bookings" button: navigate to `/my-bookings`

### Task 4: My Bookings Page — `/my-bookings`

**Page:** `apps/web/src/pages/bookings/MyBookingsPage.tsx`

**Components to create:**
- `BookingCard` — hotel image, name, dates (formatted), status badge (PENDING/CONFIRMED/CANCELLED/COMPLETED), price
- `CancellationModal` — warning about refund policy, confirm/cancel buttons
- `MyBookingsPage` — tabs (Upcoming/Past/Cancelled), booking cards list, empty states

**Status badge colors:**
- PENDING: yellow/warning
- CONFIRMED: green/success
- CANCELLED: red/destructive
- COMPLETED: blue/info

**Tabs filtering logic:**
- Upcoming: checkOut date > today AND status IN (PENDING, CONFIRMED)
- Past: checkOut date <= today OR status = COMPLETED
- Cancelled: status = CANCELLED

**Actions per card:**
- "View Details" → `/booking-confirmation/:id`
- "Cancel" button: visible only if status is CONFIRMED and >24h before check-in, opens CancellationModal
- "Book Again" → navigate to hotel detail page

**Cancellation modal:**
- Shows refund policy warning
- On confirm: DELETE/PUT `/bookings/:id/cancel`, refresh list

### Task 5: API Functions for Booking Flow

**File:** `apps/web/src/services/api.ts`

Add:
```typescript
export async function createBooking(data: CreateBookingData): Promise<BookingResponse>
export async function getBooking(bookingId: string): Promise<BookingDetail>
export async function cancelBooking(bookingId: string): Promise<CancellationResult>
export async function processPayment(data: ProcessPaymentData): Promise<PaymentResult>
```

### Task 6: Validation Schemas

**File:** `apps/web/src/lib/validations/bookingSchemas.ts`

Create Zod schemas:
- `checkoutSchema` — guest details + conditional guest fields
- `paymentSchema` — card + billing form validation
- Export from `validations/index.ts` or inline in components

### Task 7: App.tsx Route Registration

Update `apps/web/src/App.tsx`:
- Add `CheckoutPage` import
- Add `PaymentPage` import
- Add `ConfirmationPage` import
- Add `MyBookingsPage` import
- Register routes under protected customer route:
  - `/booking/:roomId` → `CheckoutPage`
  - `/payment/:bookingId` → `PaymentPage`
  - `/booking-confirmation/:id` → `ConfirmationPage`
  - `/my-bookings` → `MyBookingsPage`

### Task 8: Type Definitions

**File:** `apps/web/src/types/booking.ts`

```typescript
export interface BookingDetail {
  id, checkIn, checkOut, numberOfGuests, totalPrice, status, specialRequests, createdAt,
  room: { id, type, description, pricePerNight, capacity, bedType, amenities, images,
    hotel: { id, name, address, city, country, starRating, amenities, images } },
  payments: Payment[]
}

export interface PaymentDetail { ... }

export interface CreateBookingData { roomId, checkIn, checkOut, numberOfGuests, specialRequests }

export interface ProcessPaymentData { bookingId, paymentMethod, cardToken, idempotencyKey? }
```

## File Structure

```
apps/web/src/
├── pages/bookings/
│   ├── CheckoutPage.tsx
│   ├── PaymentPage.tsx
│   ├── ConfirmationPage.tsx
│   └── MyBookingsPage.tsx
├── components/bookings/
│   ├── BookingSummaryCard.tsx
│   ├── GuestDetailsForm.tsx
│   ├── PriceSummaryCard.tsx
│   ├── CreditCardForm.tsx
│   ├── OrderSummary.tsx
│   ├── BookingCard.tsx
│   ├── CancellationModal.tsx
│   └── StatusBadge.tsx
├── types/
│   └── booking.ts
└── lib/validations/
    └── bookingSchemas.ts

apps/api/src/
└── (no new files needed — backend already complete)
```

## Execution Order

1. Task 5 (API functions) — others depend on this
2. Task 6 (validation schemas)
3. Task 8 (type definitions)
4. Task 1 (CheckoutPage) — uses types + API + schemas
5. Task 2 (PaymentPage)
6. Task 3 (ConfirmationPage)
7. Task 4 (MyBookingsPage)
8. Task 7 (Route registration)

## Key Requirements

- All forms: react-hook-form + Zod resolver
- TanStack Query for data fetching
- Double-submit prevention: disable button during mutation
- Mobile responsive: single column + sticky bottom CTA
- Breadcrumb navigation on checkout page
- URL-param based state for checkout page (refresh-safe)
- Toast notifications on success/error (use `sonner` which is already installed)

# Hotel Admin Dashboard — Implementation Spec

## Status
Approved for implementation.

## Route Structure

| Route | Component | Description |
|---|---|---|
| `/hotel-admin/dashboard` | `DashboardPage` | Stats, charts, recent bookings |
| `/hotel-admin/rooms` | `RoomsPage` | Room management table + Add Room sheet |
| `/hotel-admin/bookings` | `BookingsPage` | Bookings table with filters, actions, CSV export |
| `/hotel-admin/hotel-profile` | `HotelProfilePage` | Hotel profile form + image gallery |

**Route migration:** Update `App.tsx` paths from `/admin/hotels/*` to `/hotel-admin/*`. Update `HotelAdminLayout` sidebar `href` values accordingly.

## Layout Architecture

### Desktop (lg+)
- Sidebar (64px wide collapsed icon-only, or 256px expanded) with nav links
- Top header: dynamic page title, dark mode toggle, notification bell (icon only), user name
- Content area via React Router `Outlet`

### Mobile (<lg)
- Bottom tab bar with 4 tabs: Dashboard, Rooms, Bookings, Profile
- Fixed position bottom, 4 equal-width tabs with icon + label
- Sidebar hidden completely

### Responsive Breakpoints
- `<lg`: Bottom navigation visible, sidebar hidden
- `lg+`: Sidebar visible, bottom nav hidden

## Dashboard Page (`/hotel-admin/dashboard`)

### Stats Row
4 cards in a responsive grid (2×2 on mobile, 4×1 on desktop):

| Card | Icon | Metric | Label |
|---|---|---|---|
| Today's Bookings | `CalendarCheck` | Count | "Bookings today" |
| Occupancy Rate | `Building` | `XX%` | "Occupancy rate" |
| Monthly Revenue | `DollarSign` | `$$$` | "Revenue this month" |
| Pending Check-ins | `UserCheck` | Count | "Pending check-ins" |

### Charts Section
1. **Bookings Line Chart** — Recharts `LineChart`, last 7 days, x=date, y=booking count
2. **Revenue Bar Chart** — Recharts `BarChart`, revenue by room type, x=type, y=revenue
3. **Occupancy Heatmap** — Pure mock UI: 7-column grid (days) × N rows (weeks in month), color-coded cells (green/yellow/red based on occupancy %)

### Recent Bookings Table
Last 5 bookings regardless of status:
- Columns: Booking Ref, Guest Name, Room Type, Check-in, Check-out, Status Badge
- Status badge colors: PENDING=yellow, CONFIRMED=blue, COMPLETED=green, CANCELLED=red, NO_SHOW=gray

### Data
- `refetchInterval: 30000` on all dashboard queries
- Fall back to mock data if API call fails (graceful degradation)

## Rooms Page (`/hotel-admin/rooms`)

### Data Table
Columns: Room Type | Price/night | Capacity | Total Rooms | Available Today | Actions

- **Total Rooms**: `totalQuantity` from API
- **Available Today**: computed from `availableQuantity` (show in green if >0, red if 0)
- **Actions**: Edit (opens Add Room sheet in edit mode) + Delete (AlertDialog confirmation)

### Add Room Sheet
Triggered by "+ Add Room" button (top-right of toolbar).

**Sheet**: shadcn `Sheet` component, slides from right, width 480px.

**Form fields**:
- Room Type (select: SINGLE, DOUBLE, SUITE, DELUXE, FAMILY)
- Description (textarea)
- Price per Night (number input, $ prefix)
- Capacity (number input)
- Bed Type (text input)
- Room Size (number input, sqm)
- Total Quantity (number input)
- Amenities (checkbox list: WiFi, Pool, Parking, Air Conditioning, TV, Mini Bar, Safe, Balcony, Ocean View, Smoking Allowed)
- Images (URL input + Add button → shows thumbnail grid below; each image has × remove button)

**Submission**: POST to `/hotels/:hotelId/rooms`
**Edit mode**: same sheet, pre-filled, PUT to `/hotels/:hotelId/rooms/:roomId`

### Inline Price Editing
- Click the price cell in the table → transforms to an input field with current value pre-filled
- Save (✓) / Cancel (✗) buttons appear inline next to the input
- On save: optimistic update → PUT mutation → rollback on error with toast
- On cancel: revert to original value

## Bookings Page (`/hotel-admin/bookings`)

### Filters Bar
- **Status** (Select): All, Pending, Confirmed, Cancelled, Completed, No-show
- **Date Range** (from/to date inputs)
- **Room Type** (Select): All, Single, Double, Suite, Deluxe, Family
- **Guest Name** (text input, searches by guest first/last name)
- **Export CSV** (button, right-aligned)
- **Bulk Actions** dropdown (appears when rows selected)

### Table Columns
Checkbox | Booking Ref | Guest | Room | Dates | Nights | Total ($) | Status | Actions

### Row Actions (contextual by status)
| Status | Actions shown |
|---|---|
| PENDING | Confirm, Cancel |
| CONFIRMED | Check-in, Cancel |
| COMPLETED | (none) |
| CANCELLED | (none) |
| NO_SHOW | (none) |

### Bulk Actions
When ≥1 row selected via checkboxes:
- "Bulk Confirm" button appears — confirms all selected PENDING bookings
- "Bulk Cancel" button appears — cancels all selected PENDING bookings
- Selection cleared after bulk action completes

### Export CSV
Client-side only:
```
Booking Ref,Guest Name,Email,Room Type,Check-in,Check-out,Nights,Total,Status
BK-001,John Doe,john@email.com,Suite,2026-05-01,2026-05-05,4,796,CONFIRMED
```
- Uses `Blob` + `URL.createObjectURL` + programmatic `<a>` click to trigger download
- Filename: `hotel-bookings-{date}.csv`

### Data
- `refetchInterval: 30000`
- Filters applied via query params to GET `/hotel-admin/bookings`

## Hotel Profile Page (`/hotel-admin/hotel-profile`)

### Form Fields
- Hotel Name (text input)
- Description (textarea, 4 rows)
- Address (text input)
- City (text input)
- Country (text input)
- Star Rating (clickable 1-5 stars, filled/empty states)
- Amenities (checkbox grid with labels + icons)

### Image Gallery (simulation)
- URL text input + "Add Image" button
- Images render as a responsive thumbnail grid (3-4 per row)
- Each image has × remove button
- No actual file upload — URLs stored in DB

### Verification Badge
- Read-only badge: green "✓ Verified" or red "✗ Not Verified"
- Reflects `hotel.isVerified` from API

### Save
- PUT to `/hotels/:hotelId`
- Toast feedback: success or error

## Shared UI Patterns

### Confirmation Dialogs
All destructive / critical actions use shadcn `AlertDialog`:
- Trigger: button with destructive variant or warning color
- Title: action name (e.g., "Confirm Booking")
- Description: consequence text (e.g., "This will confirm booking BK-001. The guest will be notified.")
- Footer: Cancel (outline) + Confirm (destructive/primary)
- On confirm: executes the mutation, closes dialog

### Toast Feedback
Every action produces a toast (via `sonner`):
- Success: "Room updated successfully"
- Error: "Failed to update room. Please try again."
- Loading: shown during mutation, auto-dismissed on completion

### Role Guard
- `ProtectedRoute` in `App.tsx` uses `allowedRoles={['hotel_owner', 'admin']}` for hotel admin routes
- Backend `hotel-admin.routes.ts` uses `requireRole('HOTEL_ADMIN', 'SYSTEM_ADMIN')`
- Non-matching users redirected to `/unauthorized`

## Mobile Bottom Navigation

### Implementation
- shadcn `BottomNavigation` pattern: fixed div at bottom, `lg:hidden`
- 4 tabs: Dashboard (LayoutDashboard), Rooms (DoorOpen), Bookings (CalendarCheck), Profile (User)
- Active state: filled icon + highlighted label, using `useLocation` to match pathname
- Uses React Router `Link` for navigation

## Component Inventory

| Component | File | Notes |
|---|---|---|
| `HotelAdminLayout` | `components/layout/HotelAdminLayout.tsx` | Update routes |
| `BottomNav` | `components/layout/BottomNav.tsx` | New, mobile only |
| `DashboardPage` | `pages/hotel-admin/DashboardPage.tsx` | New |
| `RoomsPage` | `pages/hotel-admin/RoomsPage.tsx` | New |
| `BookingsPage` | `pages/hotel-admin/BookingsPage.tsx` | New |
| `HotelProfilePage` | `pages/hotel-admin/HotelProfilePage.tsx` | New |
| `StatsCard` | `components/hotel-admin/StatsCard.tsx` | New |
| `BookingsLineChart` | `components/hotel-admin/charts/BookingsLineChart.tsx` | New |
| `RevenueBarChart` | `components/hotel-admin/charts/RevenueBarChart.tsx` | New |
| `OccupancyHeatmap` | `components/hotel-admin/charts/OccupancyHeatmap.tsx` | New |
| `RecentBookingsTable` | `components/hotel-admin/RecentBookingsTable.tsx` | New |
| `RoomsTable` | `components/hotel-admin/RoomsTable.tsx` | New |
| `AddRoomSheet` | `components/hotel-admin/AddRoomSheet.tsx` | New |
| `InlinePriceEdit` | `components/hotel-admin/InlinePriceEdit.tsx` | New |
| `ImageGalleryManager` | `components/hotel-admin/ImageGalleryManager.tsx` | New |
| `BookingsTable` | `components/hotel-admin/BookingsTable.tsx` | New |
| `StatusBadge` | `components/hotel-admin/StatusBadge.tsx` | New |
| `ConfirmationAlert` | `components/hotel-admin/ConfirmationAlert.tsx` | New, AlertDialog wrapper |
| `useAdminToast` | `hooks/useAdminToast.ts` | New, wraps sonner for admin actions |

## API Additions (`services/api.ts`)

```typescript
// Dashboard
export async function getAdminDashboard(): Promise<AdminDashboardData>

// Bookings (hotel-admin)
export async function getHotelAdminBookings(filters: BookingFilters): Promise<BookingListResponse>
export async function confirmBooking(id: string): Promise<Booking>
export async function checkInBooking(id: string): Promise<Booking>
export async function checkOutBooking(id: string): Promise<Booking>
export async function cancelBookingAdmin(id: string): Promise<Booking>

// Rooms
export async function getHotelRooms(hotelId: string): Promise<Room[]>
export async function createRoom(hotelId: string, data: CreateRoomData): Promise<Room>
export async function updateRoom(hotelId: string, roomId: string, data: UpdateRoomData): Promise<Room>
export async function deleteRoom(hotelId: string, roomId: string): Promise<void>

// Hotel
export async function getHotelProfile(hotelId: string): Promise<Hotel>
export async function updateHotelProfile(hotelId: string, data: UpdateHotelData): Promise<Hotel>
```

## Dashboard API Gap

The existing `/admin/dashboard` endpoint requires `SYSTEM_ADMIN` role. A new endpoint is needed for `HOTEL_ADMIN`:

**Proposed**: Create `/hotel-admin/dashboard` in `hotel-admin.routes.ts` with role `HOTEL_ADMIN` + `SYSTEM_ADMIN`. Handler fetches hotel-specific stats: today's bookings count, occupancy %, monthly revenue, pending check-ins, last 7 days booking counts, revenue by room type. Reuses `dashboard.service.ts` logic where possible.

## Dependencies

- `recharts` — charts library (add to `apps/web/package.json`)
- `date-fns` — date formatting for heatmap and date ranges (already may be installed)

## Implementation Order

1. Update App.tsx routes + HotelAdminLayout sidebar links
2. Create BottomNav component (mobile nav)
3. Add recharts dependency
4. Create type definitions for admin data
5. Add API functions to api.ts
6. Create DashboardPage (stats cards + 3 charts + recent table)
7. Create RoomsPage (table + AddRoomSheet + inline edit)
8. Create BookingsPage (filters + table + bulk actions + CSV export)
9. Create HotelProfilePage (form + images + badge)
10. Integration testing + TypeScript fixes

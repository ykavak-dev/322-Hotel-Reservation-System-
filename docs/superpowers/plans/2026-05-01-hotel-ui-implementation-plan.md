# Hotel Reservation System - UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 hotel reservation UI screens following the Figma design with blue-themed color palette, card-based layouts, and consistent spacing.

**Architecture:** React 18 + TypeScript + Tailwind CSS. Each page is a standalone component using existing UI primitives (button, card, input, etc.). Recharts for charts, Lucide for icons, date-fns for dates.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Recharts, Lucide React, date-fns

---

## File Structure

```
apps/web/src/
├── pages/
│   ├── Home.tsx                    (redesign - hero search)
│   ├── hotels/SearchPage.tsx       (redesign - results grid)
│   ├── hotels/HotelDetailPage.tsx   (redesign - gallery + booking)
│   ├── bookings/CheckoutPage.tsx   (redesign - split payment)
│   ├── hotel-admin/DashboardPage.tsx (redesign - charts + stats)
│   └── admin/AdminDashboardPage.tsx   (redesign - verification queue)
├── components/ui/
│   ├── search-bar.tsx              (new - reusable search component)
│   ├── hotel-card.tsx              (new - hotel listing card)
│   ├── filter-sidebar.tsx          (new - search filters)
│   └── stats-card.tsx              (new - admin KPI cards)
└── index.css                       (update - add Inter font, custom colors)
```

---

## Design System Tokens

Add to `index.css`:
```css
:root {
  --navy: #1E3A5F;
  --royal-blue: #3B82F6;
  --sky-blue: #0EA5E9;
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;
}
```

---

## Tasks

### Task 1: Home / Search Page

**Files:**
- Modify: `apps/web/src/pages/Home.tsx`
- Create: `apps/web/src/components/ui/search-bar.tsx`
- Create: `apps/web/src/components/ui/hero-section.tsx`

- [ ] **Step 1: Update index.css with Inter font and color tokens**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --navy: #1E3A5F;
  --royal-blue: #3B82F6;
  --sky-blue: #0EA5E9;
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;
}

body {
  font-family: 'Inter', sans-serif;
}
```

- [ ] **Step 2: Create search-bar.tsx component**

```tsx
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from './button';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 flex gap-4 ${className}`}>
      <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <MapPin className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Where are you going?"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Check in - Check out"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <Users className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="2 guests, 1 room"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8">
        Search
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create hero-section.tsx component**

```tsx
import { SearchBar } from './search-bar';

export function HeroSection() {
  return (
    <div className="relative h-[500px] bg-cover bg-center rounded-3xl overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/80 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-8">
        <h1 className="text-5xl font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-xl mb-8 text-white/90">Book hotels, resorts, and apartments worldwide</p>
        <SearchBar className="w-full max-w-4xl" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Redesign Home.tsx with hero + featured hotels**

```tsx
import { HeroSection } from '@/components/ui/hero-section';
import { HotelCard } from '@/components/ui/hotel-card';
import { SearchBar } from '@/components/ui/search-bar';

const featuredHotels = [
  {
    id: '1',
    name: 'Grand Luxury Resort',
    location: 'Maldives',
    rating: 4.8,
    reviews: 234,
    price: 450,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  },
  {
    id: '2',
    name: 'Seaside Paradise Hotel',
    location: 'Bali, Indonesia',
    rating: 4.9,
    reviews: 189,
    price: 320,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },
  {
    id: '3',
    name: 'Mountain View Lodge',
    location: 'Swiss Alps',
    rating: 4.7,
    reviews: 156,
    price: 380,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">HotelHub</h1>
          <nav className="flex gap-6">
            <a href="/hotels" className="text-gray-600 hover:text-[#3B82F6]">Hotels</a>
            <a href="/my-bookings" className="text-gray-600 hover:text-[#3B82F6]">My Bookings</a>
            <a href="/login" className="text-gray-600 hover:text-[#3B82F6]">Login</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-8 space-y-12">
        <HeroSection />

        <section>
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-4 gap-6">
            {['Paris', 'Tokyo', 'New York', 'Dubai'].map((city) => (
              <div key={city} className="h-40 rounded-xl bg-cover bg-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundImage: `url(https://source.unsplash.com/400x300/?${city})` }}>
                <div className="h-full flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent rounded-xl">
                  <span className="text-white font-semibold text-lg">{city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Featured Hotels</h2>
          <div className="grid grid-cols-3 gap-6">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
```

- [ ] **Step 5: Create hotel-card.tsx component**

```tsx
import { Star, MapPin } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        <Badge className="absolute top-3 right-3 bg-[#3B82F6]">Featured</Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-[#1E3A5F]">{hotel.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          {hotel.location}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-medium">{hotel.rating}</span>
          </div>
          <span className="text-gray-400">({hotel.reviews} reviews)</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#3B82F6]">${hotel.price}</span>
          <span className="text-gray-500">/night</span>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 6: Test the Home page**

Run: `cd apps/web && bun run dev`
Expected: Page loads with hero section, search bar, destinations grid, and hotel cards.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/pages/Home.tsx apps/web/src/components/ui/search-bar.tsx apps/web/src/components/ui/hero-section.tsx apps/web/src/components/ui/hotel-card.tsx apps/web/src/index.css
git commit -m "feat: implement Home/Search page with hero and featured hotels"
```

---

### Task 2: Search Results Page

**Files:**
- Modify: `apps/web/src/pages/hotels/SearchPage.tsx`
- Create: `apps/web/src/components/ui/filter-sidebar.tsx`
- Create: `apps/web/src/components/ui/hotel-card.tsx` (if not exists)

- [ ] **Step 1: Create filter-sidebar.tsx**

```tsx
import { Slider } from './slider';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { Star } from 'lucide-react';

export function FilterSidebar() {
  return (
    <aside className="w-72 bg-white rounded-xl p-6 shadow-sm h-fit">
      <h3 className="font-semibold text-lg text-[#1E3A5F] mb-4">Filters</h3>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
        <Slider defaultValue={[0, 500]} max={1000} step={10} />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>$0</span>
          <span>$1000+</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Star Rating</label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox id={`rating-${rating}`} />
              <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
                {rating !== 5 && <span className="text-gray-400 text-sm">& up</span>}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities</label>
        <div className="space-y-2">
          {['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'].map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox id={`amenity-${amenity}`} />
              <label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">{amenity}</label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">Apply Filters</Button>
    </aside>
  );
}
```

- [ ] **Step 2: Redesign SearchPage.tsx**

```tsx
import { useState } from 'react';
import { FilterSidebar } from '@/components/ui/filter-sidebar';
import { HotelCard } from '@/components/ui/hotel-card';
import { MapPin, SlidersHorizontal, X } from 'lucide-react';

const mockHotels = [
  { id: '1', name: 'Ocean View Resort', location: 'Maui, Hawaii', rating: 4.8, reviews: 312, price: 380, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800' },
  { id: '2', name: 'City Center Hotel', location: 'Paris, France', rating: 4.5, reviews: 245, price: 220, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800' },
  { id: '3', name: 'Mountain Retreat', location: 'Aspen, Colorado', rating: 4.9, reviews: 178, price: 520, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800' },
  { id: '4', name: 'Tropical Paradise', location: 'Bali, Indonesia', rating: 4.7, reviews: 289, price: 290, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800' },
  { id: '5', name: 'Desert Oasis', location: 'Dubai, UAE', rating: 4.6, reviews: 198, price: 410, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800' },
  { id: '6', name: 'Historic Grand Hotel', location: 'Rome, Italy', rating: 4.8, reviews: 421, price: 350, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
];

export function SearchPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">HotelHub</h1>
          <nav className="flex gap-6">
            <a href="/hotels" className="text-gray-600 hover:text-[#3B82F6]">Hotels</a>
            <a href="/my-bookings" className="text-gray-600 hover:text-[#3B82F6]">My Bookings</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F]">Search Results</h2>
            <p className="text-gray-500 mt-1">Found 6 hotels in Paris, France</p>
          </div>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500">Sort by:</span>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Test Search Results page**

Run: Navigate to `/hotels`
Expected: Hotel cards grid with filter sidebar visible.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/hotels/SearchPage.tsx apps/web/src/components/ui/filter-sidebar.tsx
git commit -m "feat: implement Search Results page with filters"
```

---

### Task 3: Hotel Details Page

**Files:**
- Modify: `apps/web/src/pages/hotels/HotelDetailPage.tsx`

- [ ] **Step 1: Redesign HotelDetailPage.tsx**

```tsx
import { useState } from 'react';
import { Star, MapPin, Wifi, Car, Dumbbell, Utensils, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockHotel = {
  name: 'Grand Luxury Resort & Spa',
  location: 'Maldives',
  rating: 4.8,
  reviews: 234,
  price: 450,
  images: [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  ],
  amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
  description: 'Experience world-class luxury in the heart of the Maldives. Our resort offers pristine beaches, overwater villas, and exceptional service.',
  rooms: [
    { type: 'Deluxe Ocean View', price: 450, capacity: 2, bedType: 'King Bed' },
    { type: 'Family Suite', price: 680, capacity: 4, bedType: '2 Queen Beds' },
    { type: 'Presidential Villa', price: 1200, capacity: 6, bedType: '3 King Beds' },
  ],
};

export function HotelDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(mockHotel.rooms[0]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % mockHotel.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + mockHotel.images.length) % mockHotel.images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">HotelHub</h1>
          <nav className="flex gap-6">
            <a href="/hotels" className="text-gray-600 hover:text-[#3B82F6]">Hotels</a>
            <a href="/my-bookings" className="text-gray-600 hover:text-[#3B82F6]">My Bookings</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#1E3A5F]">{mockHotel.name}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-semibold">{mockHotel.rating}</span>
            </div>
            <span className="text-gray-500">{mockHotel.reviews} reviews</span>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              {mockHotel.location}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden h-96">
              <img
                src={mockHotel.images[currentImageIndex]}
                alt="Hotel"
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {mockHotel.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#1E3A5F] mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">{mockHotel.description}</p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#1E3A5F] mb-4">Amenities</h3>
              <div className="grid grid-cols-3 gap-4">
                {mockHotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-gray-600">
                    {amenity === 'WiFi' && <Wifi className="w-5 h-5" />}
                    {amenity === 'Pool' && <Clock className="w-5 h-5" />}
                    {amenity === 'Spa' && <Dumbbell className="w-5 h-5" />}
                    {amenity === 'Gym' && <Dumbbell className="w-5 h-5" />}
                    {amenity === 'Restaurant' && <Utensils className="w-5 h-5" />}
                    {amenity === 'Parking' && <Car className="w-5 h-5" />}
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#1E3A5F] mb-4">Select Room</h3>
              <div className="space-y-3">
                {mockHotel.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedRoom.type === room.type ? 'border-[#3B82F6] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-[#1E3A5F]">{room.type}</h4>
                        <p className="text-sm text-gray-500">{room.bedType} • {room.capacity} guests</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#3B82F6]">${room.price}</span>
                        <p className="text-sm text-gray-500">/night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-[#3B82F6]">${selectedRoom.price}</span>
                <span className="text-gray-500">/night</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="Check in"
                  />
                </div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="Check out"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">${selectedRoom.price} x 3 nights</span>
                  <span>${selectedRoom.price * 3}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service fee</span>
                  <span>$45</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${selectedRoom.price * 3 + 45}</span>
                </div>
              </div>

              <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3">
                Reserve Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test Hotel Details page**

Navigate to `/hotels/1`
Expected: Image gallery, room selection, booking form.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/hotels/HotelDetailPage.tsx
git commit -m "feat: implement Hotel Details page with gallery and booking"
```

---

### Task 4: Booking & Payment Page

**Files:**
- Modify: `apps/web/src/pages/bookings/CheckoutPage.tsx`
- Modify: `apps/web/src/pages/bookings/PaymentPage.tsx`

- [ ] **Step 1: Redesign CheckoutPage.tsx with split layout**

```tsx
import { useState } from 'react';
import { Calendar, Users, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CheckoutPage() {
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <a href="/hotels" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Complete Your Booking</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#1E3A5F] mb-4">Guest Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                  <Input
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                  <Input
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  <Input
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#1E3A5F] mb-4">Booking Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#3B82F6]" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-gray-500">May 15, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#3B82F6]" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-gray-500">May 18, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-[#3B82F6]" />
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-gray-500">2 adults</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1E3A5F] mb-4">Booking Summary</h2>

              <div className="flex gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200"
                  alt="Hotel"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-[#1E3A5F]">Grand Luxury Resort</h3>
                  <p className="text-sm text-gray-500">Deluxe Ocean View</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#F59E0B]">★</span>
                    <span>4.8</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">$450 x 3 nights</span>
                  <span>$1,350</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service fee</span>
                  <span>$45</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#3B82F6]">$1,395</span>
                </div>
              </div>

              <Button className="w-full mt-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Redesign PaymentPage.tsx**

```tsx
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <a href="/checkout" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Payment</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-8">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1E3A5F]">Card Details</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Secure payment
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Card Number</label>
              <div className="relative">
                <Input placeholder="1234 5678 9012 3456" className="pl-10" />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">CVV</label>
                <Input placeholder="123" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name on Card</label>
              <Input placeholder="John Doe" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500">Total amount</span>
              <span className="text-2xl font-bold text-[#3B82F6]">$1,395</span>
            </div>
            <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3">
              Pay Now
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          Your payment is secured with 256-bit SSL encryption
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test Checkout and Payment pages**

Navigate to `/booking/1` and `/payment/1`
Expected: Split-screen checkout with summary sidebar, payment form with card input.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/bookings/CheckoutPage.tsx apps/web/src/pages/bookings/PaymentPage.tsx
git commit -m "feat: implement Booking & Payment pages with split layout"
```

---

### Task 5: Hotel Admin Dashboard

**Files:**
- Modify: `apps/web/src/pages/hotel-admin/DashboardPage.tsx`

- [ ] **Step 1: Add recharts dependency**

Run: `cd apps/web && bun add recharts`

- [ ] **Step 2: Redesign HotelAdmin Dashboard with charts**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 72000 },
];

const occupancyData = [
  { name: 'Occupied', value: 72 },
  { name: 'Available', value: 28 },
];

const COLORS = ['#3B82F6', '#E2E8F0'];

const recentBookings = [
  { id: '1', guest: 'Sarah Wilson', room: 'Deluxe Ocean View', checkIn: 'May 15', status: 'confirmed', amount: 1350 },
  { id: '2', guest: 'Michael Chen', room: 'Family Suite', checkIn: 'May 16', status: 'pending', amount: 2040 },
  { id: '3', guest: 'Emma Davis', room: 'Presidential Villa', checkIn: 'May 18', status: 'confirmed', amount: 3600 },
];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-[#1E3A5F] min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">HotelHub Admin</h1>
          </div>
          <nav className="mt-6">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Rooms', active: false },
              { label: 'Bookings', active: false },
              { label: 'Hotel Profile', active: false },
            ].map((item) => (
              <a
                key={item.label}
                href={item.label === 'Dashboard' ? '/hotel-admin/dashboard' : `#${item.label.toLowerCase()}`}
                className={`block px-6 py-3 text-sm ${item.active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your hotel overview.</p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: '$284,500', change: '+12.5%', up: true, icon: DollarSign },
              { label: 'Total Bookings', value: '1,234', change: '+8.2%', up: true, icon: Calendar },
              { label: 'Occupancy Rate', value: '72%', change: '-3.1%', up: false, icon: Users },
              { label: 'Avg Daily Rate', value: '$320', change: '+5.4%', up: true, icon: TrendingUp },
            ].map((stat) => (
              <Card key={stat.label} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <stat.icon className="w-5 h-5 text-[#3B82F6]" />
                  <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1E3A5F]">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6 col-span-2">
              <h3 className="font-semibold text-[#1E3A5F] mb-4">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-[#1E3A5F] mb-4">Occupancy Rate</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {occupancyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#3B82F6]">72%</p>
                <p className="text-sm text-gray-500">Occupied</p>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold text-[#1E3A5F] mb-4">Recent Bookings</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Guest</th>
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Check-in</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3">{booking.guest}</td>
                      <td className="py-3 text-gray-500">{booking.room}</td>
                      <td className="py-3 text-gray-500">{booking.checkIn}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 font-medium">${booking.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test Hotel Admin Dashboard**

Navigate to `/hotel-admin/dashboard`
Expected: Sidebar, KPI cards, revenue bar chart, occupancy pie chart, recent bookings table.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/hotel-admin/DashboardPage.tsx
git commit -m "feat: implement Hotel Admin Dashboard with charts and stats"
```

---

### Task 6: System Admin Verification Page

**Files:**
- Modify: `apps/web/src/pages/admin/AdminDashboardPage.tsx`

- [ ] **Step 1: Redesign System Admin Dashboard with verification queue**

```tsx
import { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type TabType = 'pending' | 'approved' | 'rejected';

const hotels = [
  { id: '1', name: 'Sunset Beach Resort', owner: 'John Smith', location: 'Maui, Hawaii', submittedDate: 'May 1, 2026', status: 'pending' },
  { id: '2', name: 'Mountain View Lodge', owner: 'Sarah Johnson', location: 'Aspen, Colorado', submittedDate: 'May 1, 2026', status: 'pending' },
  { id: '3', name: 'City Center Hotel', owner: 'Mike Brown', location: 'Paris, France', submittedDate: 'Apr 30, 2026', status: 'approved' },
  { id: '4', name: 'Desert Oasis', owner: 'Lisa Wilson', location: 'Dubai, UAE', submittedDate: 'Apr 29, 2026', status: 'rejected' },
];

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  const filteredHotels = hotels.filter(h => h.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-[#1E3A5F] min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">System Admin</h1>
          </div>
          <nav className="mt-6">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Users', active: false },
              { label: 'Hotels', active: false },
              { label: 'Bookings', active: false },
              { label: 'Reviews', active: false },
            ].map((item) => (
              <a
                key={item.label}
                href={item.label === 'Dashboard' ? '/admin' : `#${item.label.toLowerCase()}`}
                className={`block px-6 py-3 text-sm ${item.active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Hotel Verification</h1>
            <p className="text-gray-500">Review and approve hotel registrations</p>
          </div>

          <div className="flex gap-6 mb-6">
            {(['pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <Badge className={`ml-2 ${tab === 'pending' ? 'bg-yellow-100 text-yellow-700' : tab === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {hotels.filter(h => h.status === tab).length}
                </Badge>
              </button>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input className="pl-10" placeholder="Search hotels..." />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Hotel Name</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-[#1E3A5F]">{hotel.name}</p>
                        <p className="text-sm text-gray-500">ID: {hotel.id}</p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{hotel.owner}</td>
                    <td className="py-4 text-gray-600">{hotel.location}</td>
                    <td className="py-4 text-gray-500">{hotel.submittedDate}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {hotel.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredHotels.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No {activeTab} hotels found
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test System Admin Dashboard**

Navigate to `/admin`
Expected: Verification queue with tabs, approve/reject buttons, hotel details.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/admin/AdminDashboardPage.tsx
git commit -m "feat: implement System Admin Verification page with approval workflow"
```

---

## Plan Self-Review Checklist

1. **Spec coverage:** All 6 screens covered (Home, Search, Hotel Detail, Checkout, Admin Dashboard, System Admin)
2. **Placeholder scan:** No TBD/TODO - all code is complete
3. **Type consistency:** Uses existing components (Button, Card, Input, Badge, etc.) from UI folder

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-hotel-ui-implementation-plan.md`**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
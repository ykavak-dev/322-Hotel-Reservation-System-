import { HeroSection } from '@/components/ui/hero-section';
import { HotelCard } from '@/components/hotels/HotelCard';
import type { HotelSearchResult } from '@/types/hotel';

const featuredHotels: HotelSearchResult[] = [
  {
    id: 'hotel-001',
    name: 'Grand Luxury Resort',
    description: 'A stunning luxury resort in the heart of the Maldives',
    address: 'Maldives',
    city: 'Maldives',
    country: 'Maldives',
    starRating: 5,
    amenities: ['wifi', 'pool', 'spa', 'gym'],
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'],
    averageRating: 4.8,
    totalReviews: 234,
    cheapestRoomPrice: 450,
    availableRoomTypes: ['deluxe', 'suite'],
  },
  {
    id: 'hotel-002',
    name: 'Seaside Paradise Hotel',
    description: 'Beautiful beachfront hotel in Bali',
    address: 'Bali, Indonesia',
    city: 'Bali',
    country: 'Indonesia',
    starRating: 5,
    amenities: ['wifi', 'pool', 'beach', 'spa'],
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    averageRating: 4.9,
    totalReviews: 189,
    cheapestRoomPrice: 320,
    availableRoomTypes: ['standard', 'deluxe'],
  },
  {
    id: 'hotel-003',
    name: 'Mountain View Lodge',
    description: 'Cozy mountain lodge in the Swiss Alps',
    address: 'Swiss Alps',
    city: 'Zermatt',
    country: 'Switzerland',
    starRating: 4,
    amenities: ['wifi', 'ski', 'fireplace', 'restaurant'],
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
    averageRating: 4.7,
    totalReviews: 156,
    cheapestRoomPrice: 380,
    availableRoomTypes: ['standard', 'suite'],
  },
];

const cityImages: Record<string, string> = {
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
  Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-8 space-y-12">
        <HeroSection />

        <section>
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-4 gap-6">
            {Object.entries(cityImages).map(([city, imageUrl]) => (
              <div key={city} className="h-40 rounded-xl bg-cover bg-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundImage: `url(${imageUrl})` }}>
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
import { useState } from 'react';
import { FilterSidebar } from '@/components/ui/filter-sidebar';
import { HotelCard } from '@/components/hotels/HotelCard';
import { SlidersHorizontal, X } from 'lucide-react';

const mockHotels = [
  { id: '1', name: 'Ocean View Resort', description: 'A beautiful oceanfront resort', address: '123 Beach Rd', city: 'Maui', country: 'Hawaii', starRating: 4, amenities: ['WiFi', 'Pool'], images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'], averageRating: 4.8, totalReviews: 312, cheapestRoomPrice: 380, availableRoomTypes: ['Standard'] },
  { id: '2', name: 'City Center Hotel', description: 'Modern hotel in city center', address: '456 Main St', city: 'Paris', country: 'France', starRating: 4, amenities: ['WiFi', 'Gym'], images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'], averageRating: 4.5, totalReviews: 245, cheapestRoomPrice: 220, availableRoomTypes: ['Standard'] },
  { id: '3', name: 'Mountain Retreat', description: 'Luxury mountain getaway', address: '789 Alpine Way', city: 'Aspen', country: 'Colorado', starRating: 5, amenities: ['Spa', 'Gym'], images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'], averageRating: 4.9, totalReviews: 178, cheapestRoomPrice: 520, availableRoomTypes: ['Deluxe'] },
  { id: '4', name: 'Tropical Paradise', description: 'Exotic tropical resort', address: '321 Palm Beach', city: 'Bali', country: 'Indonesia', starRating: 4, amenities: ['Pool', 'Restaurant'], images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'], averageRating: 4.7, totalReviews: 289, cheapestRoomPrice: 290, availableRoomTypes: ['Standard'] },
  { id: '5', name: 'Desert Oasis', description: 'Luxury desert resort', address: '555 Sand Dune', city: 'Dubai', country: 'UAE', starRating: 5, amenities: ['WiFi', 'Parking'], images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'], averageRating: 4.6, totalReviews: 198, cheapestRoomPrice: 410, availableRoomTypes: ['Suite'] },
  { id: '6', name: 'Historic Grand Hotel', description: 'Historic luxury in Rome', address: '777 Ancient Way', city: 'Rome', country: 'Italy', starRating: 5, amenities: ['Restaurant', 'Spa'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'], averageRating: 4.8, totalReviews: 421, cheapestRoomPrice: 350, availableRoomTypes: ['Deluxe'] },
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
            <div className="flex justify-end mb-4">
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

import { HeroSection } from '@/components/ui/hero-section';
import { HotelCard } from '@/components/ui/hotel-card';

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
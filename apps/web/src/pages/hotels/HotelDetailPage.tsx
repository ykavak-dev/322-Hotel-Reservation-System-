import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Wifi, Car, Dumbbell, Utensils, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <Link to="/hotels" className="text-gray-600 hover:text-[#3B82F6]">Hotels</Link>
            <Link to="/my-bookings" className="text-gray-600 hover:text-[#3B82F6]">My Bookings</Link>
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
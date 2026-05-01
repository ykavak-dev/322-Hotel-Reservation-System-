import { useState } from 'react';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

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
          <Link to="/hotels" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
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

              <Link to="/payment/1">
                <Button className="w-full mt-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                  Proceed to Payment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
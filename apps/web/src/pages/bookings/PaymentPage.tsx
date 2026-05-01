import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/booking/1" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
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
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
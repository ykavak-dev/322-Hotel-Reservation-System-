import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
// apps/web/src/pages/hotel-admin/RoomsPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getHotelRooms } from '../../services/api';
import { RoomsTable } from '../../components/hotel-admin/RoomsTable';
import { AddRoomSheet } from '../../components/hotel-admin/AddRoomSheet';
import type { RoomManagementItem } from '../../types/admin';

// NOTE: hotelId will come from the user's owned hotels. For this implementation,
// use a placeholder that will be replaced when the hotel-admin dashboard is fully connected.
// In a real implementation, this would come from the user's auth context.
const MOCK_HOTEL_ID = 'mock-hotel-id';

export const RoomsPage: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomManagementItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hotelId = MOCK_HOTEL_ID;

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['hotel-rooms', hotelId],
    queryFn: () => getHotelRooms(hotelId),
    enabled: hotelId !== MOCK_HOTEL_ID,
    refetchInterval: 30000,
  });

  const filteredRooms = rooms.filter((r) =>
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (room: RoomManagementItem) => {
    setEditingRoom(room);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rooms</h2>
          <p className="text-sm text-muted-foreground">Manage your hotel rooms and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
        </div>
      ) : (
        <RoomsTable rooms={filteredRooms} hotelId={hotelId} onEdit={handleEdit} />
      )}

      <AddRoomSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingRoom(null);
        }}
        hotelId={hotelId}
        room={editingRoom}
      />
    </div>
  );
};
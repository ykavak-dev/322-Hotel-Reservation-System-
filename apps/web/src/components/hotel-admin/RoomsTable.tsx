// apps/web/src/components/hotel-admin/RoomsTable.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { InlinePriceEdit } from './InlinePriceEdit';
import { ConfirmationAlert } from './ConfirmationAlert';
import { toast } from 'sonner';
import { updateRoom, deleteRoom } from '../../services/api';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import type { RoomManagementItem } from '../../types/admin';

interface RoomsTableProps {
  rooms: RoomManagementItem[];
  hotelId: string;
  onEdit: (room: RoomManagementItem) => void;
}

export const RoomsTable: React.FC<RoomsTableProps> = ({ rooms, hotelId, onEdit }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => deleteRoom(hotelId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const priceMutation = useMutation({
    mutationFn: ({ roomId, price }: { roomId: string; price: number }) =>
      updateRoom(hotelId, roomId, { pricePerNight: price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success('Price updated');
    },
    onError: () => toast.error('Failed to update price'),
  });

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room Type</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price/Night</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Capacity</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Available</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-t hover:bg-muted/30">
              <td className="py-3 px-4 font-medium">{room.type}</td>
              <td className="py-3 px-4">
                <InlinePriceEdit
                  value={room.pricePerNight}
                  onSave={(price) => priceMutation.mutate({ roomId: room.id, price })}
                />
              </td>
              <td className="py-3 px-4">{room.capacity}</td>
              <td className="py-3 px-4">{room.totalQuantity}</td>
              <td className={cn('py-3 px-4 font-medium', room.availableQuantity > 0 ? 'text-green-600' : 'text-red-600')}>
                {room.availableQuantity}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(room)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmationAlert
                    trigger={
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete Room"
                    description={`Are you sure you want to delete the ${room.type} room? This action cannot be undone.`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => deleteMutation.mutate(room.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-muted-foreground">No rooms found. Add your first room.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
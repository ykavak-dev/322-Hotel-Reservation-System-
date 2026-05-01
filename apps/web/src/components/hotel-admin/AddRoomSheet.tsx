// apps/web/src/components/hotel-admin/AddRoomSheet.tsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ImageGalleryManager } from './ImageGalleryManager';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoom, updateRoom } from '../../services/api';
import type { RoomManagementItem, CreateRoomData } from '../../types/admin';
import type { RoomType } from '@hotel/shared';

const AMENITIES_OPTIONS = [
  'WiFi', 'Pool', 'Parking', 'Air Conditioning', 'TV', 'Mini Bar',
  'Safe', 'Balcony', 'Ocean View', 'Smoking Allowed', 'Room Service',
  'Gym', 'Spa', 'Pet Friendly',
];

const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY'];

interface AddRoomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  room?: RoomManagementItem | null;
  onSuccess?: () => void;
}

export const AddRoomSheet: React.FC<AddRoomSheetProps> = ({
  open,
  onOpenChange,
  hotelId,
  room,
  onSuccess,
}) => {
  const isEdit = Boolean(room);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateRoomData>({
    type: 'SINGLE',
    description: '',
    pricePerNight: 0,
    capacity: 1,
    bedType: '',
    roomSize: undefined,
    amenities: [],
    images: [],
    totalQuantity: 1,
  });

  useEffect(() => {
    if (room) {
      setForm({
        type: room.type,
        description: room.description ?? '',
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        bedType: room.bedType ?? '',
        roomSize: room.roomSize ?? undefined,
        amenities: room.amenities,
        images: room.images,
        totalQuantity: room.totalQuantity,
      });
    } else {
      setForm({ type: 'SINGLE', description: '', pricePerNight: 0, capacity: 1, bedType: '', roomSize: undefined, amenities: [], images: [], totalQuantity: 1 });
    }
  }, [room, open]);

  const mutation = useMutation({
    mutationFn: (data: CreateRoomData) =>
      isEdit ? updateRoom(hotelId, room.id, data) : createRoom(hotelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success(isEdit ? 'Room updated successfully' : 'Room created successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error(isEdit ? 'Failed to update room' : 'Failed to create room');
    },
  });

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Room' : 'Add New Room'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update room details below.' : 'Fill in the room details to create a new room type.'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Room Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Total Quantity *</Label>
              <Input type="number" min={1} value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Price/Night * ($)</Label>
              <Input type="number" min={0} step="0.01" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>Capacity * (guests)</Label>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Bed Type</Label>
              <Input placeholder="e.g. King, Twin" value={form.bedType ?? ''} onChange={(e) => setForm({ ...form, bedType: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Room Size (m2)</Label>
              <Input type="number" min={0} value={form.roomSize ?? ''} onChange={(e) => setForm({ ...form, roomSize: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Room description..." />
          </div>

          <div className="grid gap-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES_OPTIONS.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={form.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <ImageGalleryManager
              images={form.images ?? []}
              onChange={(images) => setForm({ ...form, images })}
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
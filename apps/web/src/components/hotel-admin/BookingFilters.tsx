// apps/web/src/components/hotel-admin/BookingFilters.tsx
import { Download } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import type { BookingFilters } from '../../types/admin';

interface BookingFiltersProps {
  filters: BookingFilters;
  onChange: (filters: BookingFilters) => void;
  onExportCSV: () => void;
  hasSelectedRows: boolean;
  onBulkConfirm: () => void;
  onBulkCancel: () => void;
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
const ROOM_TYPES = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY'];

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  onChange,
  onExportCSV,
  hasSelectedRows,
  onBulkConfirm,
  onBulkCancel,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filters.status ?? 'ALL'} onValueChange={(v) => onChange({ ...filters, status: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">From Date</Label>
          <Input type="date" className="w-40"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">To Date</Label>
          <Input type="date" className="w-40"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Room Type</Label>
          <Select value={filters.roomType ?? 'ALL'} onValueChange={(v) => onChange({ ...filters, roomType: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((r) => <SelectItem key={r} value={r}>{r === 'ALL' ? 'All Types' : r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Guest Name</Label>
          <Input placeholder="Search guest..." className="w-44"
            value={filters.guestName ?? ''}
            onChange={(e) => onChange({ ...filters, guestName: e.target.value || undefined })}
          />
        </div>

        <Button variant="outline" onClick={onExportCSV} className="self-end">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>

        {hasSelectedRows && (
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="default" onClick={onBulkConfirm}>Bulk Confirm</Button>
            <Button size="sm" variant="destructive" onClick={onBulkCancel}>Bulk Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
};
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PriceRangeSlider } from './PriceRangeSlider';
import type { SearchFilters as FilterState } from '@/types/hotel';

const AMENITY_OPTIONS = ['wifi', 'pool', 'parking', 'spa', 'breakfast', 'gym'];
const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY'];

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onClear: () => void;
}

export function SearchFilters({ filters, onFilterChange, onClear }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? 0,
    filters.maxPrice ?? 1000,
  ]);

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    onFilterChange({ minPrice: value[0], maxPrice: value[1] });
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const current = filters.amenities ?? [];
    const updated = checked
      ? [...current, amenity]
      : current.filter((a) => a !== amenity);
    onFilterChange({ amenities: updated });
  };

  const handleStarToggle = (star: number, checked: boolean) => {
    if (checked) {
      onFilterChange({ starRating: star });
    } else if (filters.starRating === star) {
      onFilterChange({ starRating: undefined });
    }
  };

  const hasActiveFilters =
    (filters.minPrice !== undefined || filters.maxPrice !== undefined) ||
    (filters.amenities && filters.amenities.length > 0) ||
    filters.starRating !== undefined ||
    filters.roomType !== undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold">Price Range</Label>
        <PriceRangeSlider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onChange={handlePriceChange}
        />
      </div>

      <Separator />

      {/* Star Rating */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold">Star Rating</Label>
        <div className="flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <Checkbox
                id={`star-${star}`}
                checked={filters.starRating === star}
                onCheckedChange={(checked) => handleStarToggle(star, !!checked)}
              />
              <Label htmlFor={`star-${star}`} className="flex items-center gap-1 cursor-pointer">
                {Array.from({ length: star }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
                <span className="text-sm text-muted-foreground">& up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Amenities */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold">Amenities</Label>
        <div className="flex flex-col gap-2">
          {AMENITY_OPTIONS.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={filters.amenities?.includes(amenity) ?? false}
                onCheckedChange={(checked) => handleAmenityToggle(amenity, !!checked)}
              />
              <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer capitalize">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Room Type */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold">Room Type</Label>
        <Select
          value={filters.roomType ?? ''}
          onValueChange={(val) => onFilterChange({ roomType: val as FilterState['roomType'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any room type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any room type</SelectItem>
            {ROOM_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-2">
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        </>
      )}
    </div>
  );
}
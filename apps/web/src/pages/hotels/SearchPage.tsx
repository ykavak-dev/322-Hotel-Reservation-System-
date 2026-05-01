import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { searchHotels } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { DateRangePicker } from '@/components/hotels/DateRangePicker';
import { GuestsDropdown } from '@/components/hotels/GuestsDropdown';
import { SearchFilters } from '@/components/hotels/SearchFilters';
import { SortSelect, SortOption } from '@/components/hotels/SortSelect';
import { HotelCard } from '@/components/hotels/HotelCard';
import { HotelSkeleton } from '@/components/hotels/HotelSkeleton';
import { MockMapView } from '@/components/hotels/MockMapView';
import type { SearchFilters as FilterState, SearchResponse } from '@/types/hotel';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse filters from URL
  const filters = useMemo<FilterState>(() => ({
    location: searchParams.get('location') ?? undefined,
    checkIn: searchParams.get('checkIn') ?? undefined,
    checkOut: searchParams.get('checkOut') ?? undefined,
    guests: Number(searchParams.get('guests') ?? 1),
    adults: Number(searchParams.get('adults') ?? 1),
    children: Number(searchParams.get('children') ?? 0),
    rooms: Number(searchParams.get('rooms') ?? 1),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : undefined,
    starRating: searchParams.get('starRating') ? Number(searchParams.get('starRating')) : undefined,
    roomType: (searchParams.get('roomType') as FilterState['roomType']) ?? undefined,
    sortBy: (searchParams.get('sortBy') as SortOption) ?? 'relevance',
    page: Number(searchParams.get('page') ?? 1),
  }), [searchParams]);

  // Local UI state for inputs
  const [locationInput, setLocationInput] = useState(filters.location ?? '');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.checkIn ? new Date(filters.checkIn) : undefined,
    to: filters.checkOut ? new Date(filters.checkOut) : undefined,
  });

  const debouncedLocation = useDebounce(locationInput, 300);

  // Build query params object for API
  const queryParams = useMemo(() => ({
    ...(filters.location && { location: filters.location }),
    ...(filters.checkIn && { checkIn: filters.checkIn }),
    ...(filters.checkOut && { checkOut: filters.checkOut }),
    guests: filters.guests,
    ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters.amenities && filters.amenities.length > 0 && { amenities: filters.amenities.join(',') }),
    ...(filters.starRating !== undefined && { starRating: filters.starRating }),
    ...(filters.roomType && { roomType: filters.roomType }),
    sortBy: filters.sortBy,
    page: filters.page,
    limit: 10,
  }), [filters]);

  // Fetch hotels
  const { data, isLoading, isError } = useQuery<SearchResponse>({
    queryKey: ['hotels', queryParams],
    queryFn: () => searchHotels(queryParams),
  });

  // Update URL when filters change
  const updateFilters = (updates: Partial<FilterState>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','));
        } else {
          next.set(key, String(value));
        }
      });
      next.delete('page'); // Reset to page 1 on filter change
      return next;
    }, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({});
    setDateRange({ from: undefined, to: undefined });
    setLocationInput('');
  };

  const handleSearchClick = () => {
    updateFilters({
      location: debouncedLocation || undefined,
      checkIn: dateRange.from?.toISOString().split('T')[0],
      checkOut: dateRange.to?.toISOString().split('T')[0],
      adults: filters.adults,
      children: filters.children,
      rooms: filters.rooms,
    });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const FilterContent = (
    <SearchFilters
      filters={filters}
      onFilterChange={updateFilters}
      onClear={clearFilters}
    />
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero search bar */}
      <section className="border-b bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Location */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Location</label>
              <Input
                placeholder="City, hotel name..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date range */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Dates</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={(range) => setDateRange(range)}
              />
            </div>

            {/* Guests */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Guests</label>
              <GuestsDropdown
                adults={filters.adults}
                children={filters.children}
                rooms={filters.rooms}
                onChange={({ adults, children, rooms }) => {
                  updateFilters({ adults, children, rooms, guests: adults + children });
                }}
              />
            </div>

            {/* Search */}
            <Button size="lg" onClick={handleSearchClick} className="shrink-0 gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>

            {/* Mobile filters toggle */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{FilterContent}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto flex gap-6 px-4 py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Filters</h2>
            {FilterContent}
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Sort bar */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-48 inline-block" />
              ) : (
                `${data?.total ?? 0} hotel${(data?.total ?? 0) !== 1 ? 's' : ''} found`
              )}
            </p>
            <div className="flex items-center gap-3">
              <SortSelect
                value={filters.sortBy}
                onChange={(val) => updateFilters({ sortBy: val })}
              />
              <Button
                variant={showMap ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setShowMap(!showMap)}
                title="Toggle map"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Map view */}
          {showMap && (
            <div className="mb-6">
              <MockMapView
                hotelCount={data?.hotels.length ?? 0}
                location={filters.location}
              />
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <HotelSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">Failed to load hotels. Please try again.</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && (data?.hotels.length ?? 0) === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No hotels found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or changing your search dates.
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            </div>
          )}

          {/* Results grid */}
          {!isLoading && !isError && (data?.hotels.length ?? 0) > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data!.hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>

              {/* Pagination */}
              {(data?.totalPages ?? 0) > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, data!.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data?.hasNextPage}
                    onClick={() => handlePageChange(filters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
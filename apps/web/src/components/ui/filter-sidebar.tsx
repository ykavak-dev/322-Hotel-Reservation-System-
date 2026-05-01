import { Slider } from './slider';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { Star } from 'lucide-react';

export function FilterSidebar() {
  return (
    <aside className="w-72 bg-white rounded-xl p-6 shadow-sm h-fit">
      <h3 className="font-semibold text-lg text-[#1E3A5F] mb-4">Filters</h3>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
        <Slider defaultValue={[0, 500]} max={1000} step={10} />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>$0</span>
          <span>$1000+</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Star Rating</label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox id={`rating-${rating}`} />
              <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
                {rating !== 5 && <span className="text-gray-400 text-sm">& up</span>}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities</label>
        <div className="space-y-2">
          {['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'].map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox id={`amenity-${amenity}`} />
              <label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">{amenity}</label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">Apply Filters</Button>
    </aside>
  );
}

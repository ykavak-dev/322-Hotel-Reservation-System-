import { Slider } from '@/components/ui/slider';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({
  min,
  max,
  step = 10,
  value,
  onChange,
}: PriceRangeSliderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <span className="text-sm">${value[0]}</span>
        <span className="text-sm">${value[1]}{value[1] >= max ? '+' : ''}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>${min}</span>
        <span>${max}+</span>
      </div>
    </div>
  );
}
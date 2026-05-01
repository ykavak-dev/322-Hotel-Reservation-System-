import { Slider } from '@/components/ui/slider';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, step, value, onChange }: PriceRangeSliderProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange([newValue[0], newValue[1]]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>${value[0]}</span>
        <span>${value[1]}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
      />
    </div>
  );
}

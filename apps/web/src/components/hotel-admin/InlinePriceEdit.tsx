// apps/web/src/components/hotel-admin/InlinePriceEdit.tsx
import { useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface InlinePriceEditProps {
  value: number;
  onSave: (value: number) => void;
  disabled?: boolean;
}

export const InlinePriceEdit: React.FC<InlinePriceEditProps> = ({ value, onSave, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const save = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className="font-mono text-sm hover:text-primary transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        ${value.toLocaleString()}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">$</span>
      <Input
        ref={inputRef}
        type="number"
        min={0}
        step="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="w-24 h-7 text-sm"
      />
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={save}>
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={cancel}>
        <X className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
};
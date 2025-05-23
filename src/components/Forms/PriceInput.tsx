import { Input } from "@/components/ui/input";
import { FormDescription } from "@/components/ui/form";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function PriceInput({
  value,
  onChange,
  disabled = false
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || 0;
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Input
          type="number"
          min={0}
          step={1000}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className="w-full"
        />
        <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">VND</span>
      </div>
      <FormDescription className="text-xs">
        Enter price in Vietnamese Dong (VND)
      </FormDescription>
    </div>
  );
}

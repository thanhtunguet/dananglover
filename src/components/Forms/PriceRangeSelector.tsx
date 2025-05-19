
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceRangeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function PriceRangeSelector({
  value,
  onChange,
  disabled = false
}: PriceRangeSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      {[1, 2, 3].map((price) => (
        <button
          key={price}
          type="button"
          disabled={disabled}
          onClick={() => onChange(price)}
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors",
            price === value 
              ? "bg-primary text-primary-foreground" 
              : "border bg-background hover:bg-muted",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {Array(price)
            .fill(0)
            .map((_, i) => (
              <DollarSign key={i} className="h-3.5 w-3.5" />
            ))}
        </button>
      ))}
    </div>
  );
}

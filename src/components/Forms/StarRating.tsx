
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  disabled = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div 
      className={cn("flex items-center", className)}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            "p-0.5 transition-colors focus:outline-none",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
        >
          <Star 
            className={cn(
              "h-6 w-6 transition-colors",
              (hoverValue || value) >= star 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            )} 
          />
        </button>
      ))}
    </div>
  );
}

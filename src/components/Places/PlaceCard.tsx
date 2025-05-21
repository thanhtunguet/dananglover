
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Place } from "@/types";

interface PlaceCardProps {
  place: Place;
  className?: string;
}

export default function PlaceCard({ place, className }: PlaceCardProps) {
  // Format price in Vietnamese Dong
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      // Use 0 decimal places to remove decimals from VND format
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Link
      to={`/places/${place.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={place.cover_image}
          alt={place.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg line-clamp-1">{place.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm">{place.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
          <span className="truncate">{place.location.address}</span>
        </div>

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {place.description}
          </p>
          <span className="text-sm font-medium">
            {formatPrice(place.price_range)}
          </span>
        </div>
      </div>
    </Link>
  );
}

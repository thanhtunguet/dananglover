import { Place } from "@/types";
import PlaceCard from "./PlaceCard";

interface PlaceGridProps {
  places: Place[];
  emptyMessage?: string;
}

export default function PlaceGrid({
  places,
  emptyMessage = "No places found",
}: PlaceGridProps) {
  if (places.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}

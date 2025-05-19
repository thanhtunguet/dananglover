
import { useEffect, useRef, useState } from 'react';
import { Place } from '@/types';

interface MapViewProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPlaceSelect?: (place: Place) => void;
}

// This is a placeholder component for map implementation
// In a real app, you would integrate with a mapping library like Google Maps, Mapbox, Leaflet, etc.
export default function MapView({ 
  places, 
  center,
  zoom = 12,
  height = "400px",
  onPlaceSelect
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  useEffect(() => {
    // Map initialization would go here with a real mapping library
    // For now, we'll just display a message
    if (mapRef.current) {
      const mapElement = mapRef.current;
      mapElement.innerHTML = `
        <div class="flex items-center justify-center h-full bg-muted/20 border rounded-lg">
          <div class="text-center p-4">
            <p class="text-muted-foreground mb-2">Map View Placeholder</p>
            <p class="text-xs text-muted-foreground">In a real app, a map would be displayed here showing ${places.length} places</p>
          </div>
        </div>
      `;
    }
  }, [places.length]);

  return (
    <div>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height }}
      ></div>
      
      {/* List of places shown on map */}
      <div className="mt-4 space-y-2">
        <h3 className="font-medium">Places on map:</h3>
        <div className="grid gap-2">
          {places.map(place => (
            <button
              key={place.id}
              className={`text-left p-2 border rounded-md hover:bg-muted/50 transition-colors ${
                selectedPlaceId === place.id ? 'bg-muted border-primary/50' : ''
              }`}
              onClick={() => {
                setSelectedPlaceId(place.id);
                onPlaceSelect?.(place);
              }}
            >
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-muted-foreground truncate">{place.location.address}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

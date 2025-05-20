
import { useEffect, useRef, useState } from "react";
import { Place } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { leafletLayer } from "protomaps-leaflet";

const API_KEY = import.meta.env.VITE_PROTOMAPS_API_KEY;

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPlaceSelect?: (place: Place) => void;
}

export default function MapView({
  places,
  center = { lat: 16.047079, lng: 108.20623 }, // Default to Da Nang
  zoom = 12,
  height = "400px",
  onPlaceSelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
    mapInstanceRef.current = map;

    // Add the PMTiles layer - using type assertion to work with protomaps-leaflet
    const layer = leafletLayer({
      url: `https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=${API_KEY}`,
      // Use as any to bypass TypeScript restriction since protomaps-leaflet has custom options
      style: {
        layers: [
          {
            id: "land",
            type: "fill",
            source: "land",
            paint: { "fill-color": "#e0e0e0" },
          },
          {
            id: "water",
            type: "fill",
            source: "water",
            paint: { "fill-color": "#a0c8f0" },
          },
          {
            id: "roads",
            type: "line",
            source: "roads",
            paint: { "line-color": "#ffffff", "line-width": 1 },
          },
        ],
      },
    } as any); // Using type assertion to bypass TypeScript restriction
    layer.addTo(map);

    // Cleanup function
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  // Update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    places.forEach((place) => {
      const marker = L.marker([place.location.lat, place.location.lng])
        .addTo(mapInstanceRef.current!)
        .bindPopup(place.name);

      marker.on("click", () => {
        setSelectedPlaceId(place.id);
        onPlaceSelect?.(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, onPlaceSelect]);

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ height }}
      />

      {/* List of places shown on map */}
      <div className="mt-4 space-y-2">
        <h3 className="font-medium">Places on map:</h3>
        <div className="grid gap-2">
          {places.map((place) => (
            <button
              key={place.id}
              className={`text-left p-2 border rounded-md hover:bg-muted/50 transition-colors ${
                selectedPlaceId === place.id ? "bg-muted border-primary/50" : ""
              }`}
              onClick={() => {
                setSelectedPlaceId(place.id);
                onPlaceSelect?.(place);
                // Center map on selected place
                mapInstanceRef.current?.setView(
                  [place.location.lat, place.location.lng],
                  mapInstanceRef.current.getZoom()
                );
              }}
            >
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {place.location.address}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

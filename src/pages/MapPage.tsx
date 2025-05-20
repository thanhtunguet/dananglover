import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "@/components/Map/MapView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Place } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function MapPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all places for the map
  const { data: places = [], isLoading } = useQuery({
    queryKey: ["mapPlaces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("places").select("*");

      if (error) {
        console.error("Error fetching places for map:", error);
        toast({
          variant: "destructive",
          title: "Error loading map data",
          description: error.message,
        });
        return [];
      }

      // Convert to our Place type
      return data.map((place) => ({
        id: place.id,
        name: place.name,
        description: place.description,
        cover_image: place.cover_image,
        rating: place.rating,
        priceRange: place.price_range as 1 | 2 | 3,
        location: {
          address: place.address,
          lat: place.lat,
          lng: place.lng,
        },
        createdBy: place.created_by,
        created_at: new Date(place.created_at),
      })) as Place[];
    },
  });

  const handlePlaceSelect = (place: Place) => {
    navigate(`/places/${place.id}`);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Places</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading map data...</p>
        </div>
      ) : (
        <div className="h-[calc(100vh-12rem)]">
          <MapView
            places={places}
            height="100%"
            onPlaceSelect={handlePlaceSelect}
          />
        </div>
      )}
    </div>
  );
}

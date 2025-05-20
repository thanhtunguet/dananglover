import { useState } from "react";
import { Navigate } from "react-router-dom";
import PlaceGrid from "@/components/Places/PlaceGrid";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Place } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function SavedPlacesPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Fetch saved places
  const { data: savedPlaces = [], isLoading } = useQuery({
    queryKey: ["savedPlaces", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the ids of saved places
      const { data: savedData, error: savedError } = await supabase
        .from("saved_places")
        .select("place_id")
        .eq("user_id", user.id);

      if (savedError) {
        console.error("Error fetching saved places:", savedError);
        toast({
          variant: "destructive",
          title: "Error loading saved places",
          description: savedError.message,
        });
        return [];
      }

      // If no saved places, return empty array
      if (!savedData || savedData.length === 0) {
        return [];
      }

      // Get the place IDs
      const placeIds = savedData.map((saved) => saved.place_id);

      // Then fetch the actual places
      const { data: placesData, error: placesError } = await supabase
        .from("places")
        .select("*")
        .in("id", placeIds);

      if (placesError) {
        console.error("Error fetching places details:", placesError);
        toast({
          variant: "destructive",
          title: "Error loading place details",
          description: placesError.message,
        });
        return [];
      }

      // Convert to our Place type
      return placesData.map((place) => ({
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
        createdAt: new Date(place.created_at),
      })) as Place[];
    },
    enabled: !!user,
  });

  // If not logged in and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Saved Places</h1>
      <p className="text-muted-foreground mb-6">
        Places you've saved for later
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading your saved places...</p>
        </div>
      ) : (
        <PlaceGrid
          places={savedPlaces}
          emptyMessage="You haven't saved any places yet."
        />
      )}
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlaceForm } from "@/components/Places/PlaceForm";
import { Place } from "@/types";

export default function EditPlacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is authorized to edit this place
  const { data: place, isLoading } = useQuery({
    queryKey: ["place", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching place",
          description: error.message,
        });
        return null;
      }

      // Convert to our Place type
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        cover_image: data.cover_image,
        rating: data.rating,
        price_range: data.price_range as 1 | 2 | 3,
        location: {
          address: data.address,
          lat: data.lat,
          lng: data.lng,
        },
        created_by: data.created_by,
        created_at: new Date(data.created_at),
      } as Place;
    },
    enabled: !!id,
  });

  // Redirect if not authenticated or not the author
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to edit a place.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (!isLoading && place && place.created_by !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit places you created.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }
  }, [user, place, isLoading, navigate]);

  if (!user || (place && place.created_by !== user.id)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Place not found</h1>
        <p className="text-muted-foreground mb-4">
          The place you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Place</h1>
      <PlaceForm place={place} />
    </div>
  );
}

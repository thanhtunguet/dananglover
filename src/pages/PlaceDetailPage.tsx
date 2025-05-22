import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Star, MapPin, ArrowLeft, Edit, Trash2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewList from "@/components/Reviews/ReviewList";
import ReviewForm from "@/components/Reviews/ReviewForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Place, Review } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { leafletLayer } from "protomaps-leaflet";

const API_KEY = import.meta.env.VITE_PROTOMAPS_API_KEY;

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);

  // Fetch place details
  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ["place", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching place:", error);
        toast({
          variant: "destructive",
          title: "Error loading place",
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
        price_range: data.price_range, // Matches DB field name
        location: {
          address: data.address,
          lat: data.lat,
          lng: data.lng,
        },
        created_by: data.created_by,
        created_at: new Date(data.created_at),
      } as Place;
    },
  });

  // Fetch reviews with user profiles
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      if (!id) return [];

      try {
        // First, fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("place_id", id)
          .order("created_at", { ascending: false });

        if (reviewsError) {
          throw reviewsError;
        }

        // Map reviews and fetch user profiles for each review
        const reviewsWithProfiles: Review[] = await Promise.all(
          reviewsData.map(async (review) => {
            // Fetch user profile for each review
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", review.user_id)
              .single();

            return {
              id: review.id,
              place_id: review.place_id,
              user_id: review.user_id,
              rating: review.rating,
              comment: review.comment || "",
              created_at: new Date(review.created_at),
              user: profileData
                ? {
                    id: profileData.id,
                    full_name: profileData.full_name || "Anonymous",
                    username: profileData.username || "user",
                    avatar_url: profileData.avatar_url,
                  }
                : undefined,
            };
          })
        );

        return reviewsWithProfiles;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          variant: "destructive",
          title: "Error loading reviews",
          description: error instanceof Error ? error.message : "Unknown error",
        });
        return [];
      }
    },
    enabled: !!id,
  });

  // Check if place is saved by current user
  useEffect(() => {
    if (!user || !id) return;

    const checkIfSaved = async () => {
      const { data, error } = await supabase
        .from("saved_places")
        .select("*")
        .eq("place_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking saved status:", error);
        return;
      }

      setIsSaved(!!data);
    };

    checkIfSaved();
  }, [id, user]);

  // Toggle saved status
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) return;

      if (isSaved) {
        // Remove from saved places
        const { error } = await supabase
          .from("saved_places")
          .delete()
          .eq("place_id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        return false;
      } else {
        // Add to saved places
        const { error } = await supabase.from("saved_places").insert({
          place_id: id,
          user_id: user.id,
        });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newSavedStatus) => {
      setIsSaved(newSavedStatus);
      queryClient.invalidateQueries({ queryKey: ["savedPlaces"] });

      toast({
        title: newSavedStatus ? "Place saved" : "Place removed",
        description: newSavedStatus
          ? "This place has been added to your saved list."
          : "This place has been removed from your saved list.",
      });
    },
    onError: (error) => {
      console.error("Error toggling saved status:", error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to update saved status. Please try again.",
      });
    },
  });

  // Delete place mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Place ID is required");
      setIsDeleting(true);

      const { error } = await supabase.from("places").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast({
        title: "Place deleted",
        description: "The place has been deleted successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      setIsDeleting(false);
      toast({
        variant: "destructive",
        title: "Error deleting place",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const handleToggleSave = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save places.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this place? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const handleStartReview = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to write a review.",
        variant: "destructive",
      });
      return;
    }
    setIsWritingReview(true);
  };

  if (placeLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <p>Loading place details...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Place not found</h1>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <img
              src={place.cover_image || "/placeholder.svg"}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <div className="flex items-center gap-2">
              {user?.id === place.created_by && (
                <>
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/places/edit/${place.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant={isSaved ? "default" : "outline"}
                size="icon"
                onClick={handleToggleSave}
                disabled={saveMutation.isPending}
              >
                <Heart className={isSaved ? "fill-white" : ""} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{place.location.address}</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(place.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({place.rating.toFixed(1)})
            </span>
            <span className="text-muted-foreground">
              {/* Price range display */}
              {Array.from({ length: place.price_range }).map((_, i) => (
                <span key={i}>$</span>
              ))}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p>{place.description}</p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reviews</h2>
              {!isWritingReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartReview}
                  className="flex items-center gap-2"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Write a Review
                </Button>
              )}
            </div>

            {isWritingReview ? (
              <div className="mb-8 p-6 border rounded-lg bg-card">
                <ReviewForm
                  placeId={id || ""}
                  onSuccess={() => setIsWritingReview(false)}
                />
              </div>
            ) : null}

            <ReviewList
              reviews={reviews}
              isLoading={reviewsLoading}
              place_id={id || ""}
            />
          </div>
        </div>

        <div>
          <div className="bg-muted p-4 rounded-lg sticky top-20">
            <h3 className="font-medium mb-2">Location</h3>
            <div className="aspect-square bg-muted-foreground/20 rounded-md mb-4">
              <LocationMap
                lat={place.location.lat}
                lng={place.location.lng}
                address={place.location.address}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>{place.location.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationMap({
  lat,
  lng,
  address,
}: {
  lat: number;
  lng: number;
  address: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    // Add the PMTiles layer
    const layer = leafletLayer({
      url: `https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=${API_KEY}`,
      // style: {
      //   layers: [
      //     {
      //       id: "land",
      //       type: "fill",
      //       source: "land",
      //       paint: { "fill-color": "#e0e0e0" },
      //     },
      //     {
      //       id: "water",
      //       type: "fill",
      //       source: "water",
      //       paint: { "fill-color": "#a0c8f0" },
      //     },
      //     {
      //       id: "roads",
      //       type: "line",
      //       source: "roads",
      //       paint: { "line-color": "#ffffff", "line-width": 1 },
      //     },
      //   ],
      // },
    });
    layer.addTo(map);

    // Add marker
    markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(address);

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng, address]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-md overflow-hidden" />
  );
}

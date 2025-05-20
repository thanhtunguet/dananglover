import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlaceGrid from "@/components/Places/PlaceGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Place } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch all places
  const { data: places = [], isLoading } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching places:", error);
        toast({
          variant: "destructive",
          title: "Error loading places",
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

  // Compute filtered places based on search query
  const filteredPlaces =
    searchQuery.trim() === ""
      ? places
      : places.filter((place) => {
          const query = searchQuery.toLowerCase();
          return (
            place.name.toLowerCase().includes(query) ||
            place.description.toLowerCase().includes(query) ||
            place.location.address.toLowerCase().includes(query)
          );
        });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the computed filteredPlaces
  };

  return (
    <div className="container pb-12 pt-4 md:pt-8">
      <div className="flex flex-col items-center text-center mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Discover amazing places
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Find and share your favorite hangout spots with friends
        </p>

        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-lg gap-2 mt-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for cafes, restaurants, parks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Popular Places
            </h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading places...</p>
            </div>
          ) : (
            <PlaceGrid places={filteredPlaces} />
          )}
        </section>
      </div>
    </div>
  );
}

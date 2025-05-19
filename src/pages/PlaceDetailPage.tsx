
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Star, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewList from '@/components/Reviews/ReviewList';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Place } from '@/types';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch place details
  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching place:', error);
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
        coverImage: data.cover_image,
        rating: data.rating,
        priceRange: data.price_range as 1 | 2 | 3,
        location: {
          address: data.address,
          lat: data.lat,
          lng: data.lng,
        },
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
      } as Place;
    },
  });

  // Fetch reviews with user profiles
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name, username, avatar_url)
        `)
        .eq('place_id', id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching reviews:', error);
        toast({
          variant: "destructive",
          title: "Error loading reviews",
          description: error.message,
        });
        return [];
      }
      
      return data.map(review => ({
        id: review.id,
        placeId: review.place_id,
        userId: review.user_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.created_at),
        user: {
          fullName: review.profiles?.full_name || 'Anonymous',
          username: review.profiles?.username || 'user',
          avatarUrl: review.profiles?.avatar_url
        }
      }));
    },
    enabled: !!id,
  });

  // Check if place is saved by current user
  useEffect(() => {
    if (!user || !id) return;
    
    const checkIfSaved = async () => {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('place_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking saved status:', error);
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
          .from('saved_places')
          .delete()
          .eq('place_id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        return false;
      } else {
        // Add to saved places
        const { error } = await supabase
          .from('saved_places')
          .insert({
            place_id: id,
            user_id: user.id
          });
          
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newSavedStatus) => {
      setIsSaved(newSavedStatus);
      queryClient.invalidateQueries({ queryKey: ['savedPlaces'] });
      
      toast({
        title: newSavedStatus ? "Place saved" : "Place removed",
        description: newSavedStatus 
          ? "This place has been added to your saved list." 
          : "This place has been removed from your saved list."
      });
    },
    onError: (error) => {
      console.error('Error toggling saved status:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to update saved status. Please try again."
      });
    }
  });
  
  const handleToggleSave = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save places.",
        variant: "destructive"
      });
      return;
    }
    
    saveMutation.mutate();
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
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <img 
              src={place.coverImage || '/placeholder.svg'} 
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <Button 
              variant={isSaved ? "default" : "outline"} 
              size="icon"
              onClick={handleToggleSave}
              disabled={saveMutation.isPending}
            >
              <Heart className={isSaved ? "fill-white" : ""} />
            </Button>
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
                  className={`h-5 w-5 ${i < Math.round(place.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({place.rating.toFixed(1)})
            </span>
            <span className="text-muted-foreground">
              {/* Price range display */}
              {Array.from({ length: place.priceRange }).map((_, i) => (
                <span key={i}>$</span>
              ))}
            </span>
          </div>
          
          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p>{place.description}</p>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <ReviewList 
              reviews={reviews}
              isLoading={reviewsLoading}
              placeId={id || ''}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-muted p-4 rounded-lg sticky top-20">
            <h3 className="font-medium mb-2">Location</h3>
            <div className="aspect-square bg-muted-foreground/20 rounded-md mb-4">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBtIfQTXyAV95YrqCbYUfBkYxXoWQfb7_k&q=${place.location.address}&center=${place.location.lat},${place.location.lng}`} 
                allowFullScreen
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

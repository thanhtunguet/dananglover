
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, DollarSign, Share, ArrowLeft, Heart, Calendar, Clock } from 'lucide-react';
import ReviewList from '@/components/Reviews/ReviewList';
import MapView from '@/components/Map/MapView';
import { Place, Review } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch place details
  const { 
    data: place, 
    isLoading: placeLoading, 
    error: placeError 
  } = useQuery({
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
        throw new Error(error.message);
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
    retry: false,
  });

  // Check if place is saved by the current user
  const { data: isSaved = false, refetch: refetchSavedStatus } = useQuery({
    queryKey: ['isSaved', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return false;
      
      const { data, error } = await supabase
        .from('saved_places')
        .select('id')
        .eq('place_id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error checking saved status:', error);
      }
      
      return !!data;
    },
    enabled: !!user && !!id,
  });

  // Fetch reviews for this place
  const { 
    data: reviews = [], 
    isLoading: reviewsLoading 
  } = useQuery({
    queryKey: ['placeReviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name, username)
        `)
        .eq('place_id', id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching reviews:', error);
        throw new Error(error.message);
      }
      
      // Convert to our Review type
      return data.map(review => ({
        id: review.id,
        placeId: review.place_id,
        userId: review.user_id,
        userName: review.profiles?.full_name || review.profiles?.username || 'Anonymous',
        rating: review.rating,
        comment: review.comment || '',
        createdAt: new Date(review.created_at),
      })) as Review[];
    },
    enabled: !!id,
  });

  // Save/unsave place mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Authentication required');
      
      if (isSaved) {
        // Delete the saved record
        const { error } = await supabase
          .from('saved_places')
          .delete()
          .eq('place_id', id)
          .eq('user_id', user.id);
          
        if (error) throw new Error(error.message);
        return false;
      } else {
        // Insert a new saved record
        const { error } = await supabase
          .from('saved_places')
          .insert([{ place_id: id, user_id: user.id }]);
          
        if (error) throw new Error(error.message);
        return true;
      }
    },
    onSuccess: (newSavedState) => {
      queryClient.invalidateQueries({ queryKey: ['isSaved', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['savedPlaces', user?.id] });
      
      toast({
        title: newSavedState ? 'Place saved' : 'Place unsaved',
        description: newSavedState 
          ? 'This place has been added to your saved places.'
          : 'This place has been removed from your saved places.',
      });
    },
    onError: (error) => {
      console.error('Error toggling save status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || 'An unexpected error occurred',
      });
    },
  });

  const handleSaveToggle = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save places",
        action: (
          <Button variant="outline" onClick={() => navigate('/login')}>
            Login
          </Button>
        ),
      });
      return;
    }
    
    toggleSaveMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: place?.name || 'Check out this place',
          text: place?.description || 'I found this great place',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The link to this place has been copied to your clipboard.",
      });
    }
  };

  if (placeLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p>Loading place details...</p>
      </div>
    );
  }

  if (placeError || !place) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center gap-4">
        <p>Place not found or an error occurred.</p>
        <Button onClick={() => navigate('/')}>Go back to home</Button>
      </div>
    );
  }

  return (
    <div className="container pb-12">
      <div className="flex items-center mb-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>
      
      <div className="relative w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={place.coverImage}
          alt={place.name}
          className="w-full max-h-[500px] object-cover"
        />
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{place.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{place.rating.toFixed(1)}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{reviews.length} reviews</span>
                </div>
                <span className="mx-2 text-muted-foreground">•</span>
                <div className="flex items-center text-muted-foreground">
                  {Array(place.priceRange)
                    .fill(0)
                    .map((_, i) => (
                      <DollarSign key={i} className="h-4 w-4" />
                    ))}
                </div>
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{place.location.address}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToggle}
                disabled={toggleSaveMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="sr-only">Save</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">About</h2>
            <p className="text-muted-foreground">{place.description}</p>
          </div>
          
          <Tabs defaultValue="reviews">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reviews</h3>
                {reviewsLoading ? (
                  <p>Loading reviews...</p>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
              </div>
            </TabsContent>
            <TabsContent value="info" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center p-4 border rounded-lg">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <h4 className="font-medium">Opening Hours</h4>
                      <p className="text-sm text-muted-foreground">9:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 border rounded-lg">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <h4 className="font-medium">Added On</h4>
                      <p className="text-sm text-muted-foreground">
                        {place.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <div className="sticky top-24 space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Location</h3>
              <MapView 
                places={[place]} 
                center={{ lat: place.location.lat, lng: place.location.lng }} 
                height="200px"
              />
              <div className="mt-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                </a>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => user ? navigate('/add-review') : navigate('/login')}
            >
              <Star className="h-4 w-4 mr-2" />
              Write a review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

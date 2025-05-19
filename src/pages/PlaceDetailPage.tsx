
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, DollarSign, Share, ArrowLeft, Heart, Calendar, Clock } from 'lucide-react';
import ReviewList from '@/components/Reviews/ReviewList';
import MapView from '@/components/Map/MapView';
import { Place } from '@/types';
import { mockPlaces, mockReviews } from '@/data/mockData';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch data from an API
    const foundPlace = mockPlaces.find(p => p.id === id);
    setPlace(foundPlace || null);
  }, [id]);

  const placeReviews = mockReviews.filter(review => review.placeId === id);

  if (!place) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p>Place not found</p>
      </div>
    );
  }

  const handleShare = () => {
    // In a real app, this would use the Web Share API
    console.log('Sharing place:', place.name);
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: place.name,
          text: place.description,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      alert(`Share ${place.name}: ${window.location.href}`);
    }
  };

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
                  <span className="text-muted-foreground">{placeReviews.length} reviews</span>
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
                onClick={() => setIsSaved(!isSaved)}
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
                <ReviewList reviews={placeReviews} />
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
                        {new Date(place.createdAt).toLocaleDateString()}
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
            <Button className="w-full">
              <Star className="h-4 w-4 mr-2" />
              Write a review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

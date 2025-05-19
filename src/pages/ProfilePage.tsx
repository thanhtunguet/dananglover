
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogOut, Plus } from "lucide-react";
import PlaceGrid from "@/components/Places/PlaceGrid";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Place } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, session, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    fetchProfile();
  }, [user]);

  // Fetch places created by the user
  const { data: userPlaces = [], isLoading: placesLoading } = useQuery({
    queryKey: ['userPlaces', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('created_by', user.id);
        
      if (error) {
        console.error('Error fetching places:', error);
        toast({
          variant: "destructive",
          title: "Error loading places",
          description: error.message,
        });
        return [];
      }
      
      // Convert Supabase data to our Place type
      return data.map(place => ({
        id: place.id,
        name: place.name,
        description: place.description,
        coverImage: place.cover_image,
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
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // If not logged in and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-center text-center mb-8 space-y-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || user?.email || "User"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10" />
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{profile?.full_name || user?.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="myPlaces" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="myPlaces">My Places</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="myPlaces" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Places you've added</h2>
            <Button asChild>
              <Link to="/add-place">
                <Plus className="h-4 w-4 mr-2" />
                Add a place
              </Link>
            </Button>
          </div>
          
          {placesLoading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading your places...</p>
            </div>
          ) : (
            <PlaceGrid 
              places={userPlaces} 
              emptyMessage="You haven't added any places yet." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Account Settings</h3>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Control which email notifications you receive.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>New place recommendations</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Friend activity</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">
                Permanent actions that can't be undone.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

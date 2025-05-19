
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogOut, Plus } from "lucide-react";
import PlaceGrid from "@/components/Places/PlaceGrid";
import { mockPlaces } from "@/data/mockData";

export default function ProfilePage() {
  // In a real app, user data would be fetched from your authentication provider
  const mockUser = {
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: null,
  };

  // In a real app, these would be fetched from your backend
  const userPlaces = mockPlaces.slice(1, 4);
  
  const handleLogout = () => {
    // In a real app, this would sign the user out using Supabase
    alert("Logout functionality would be implemented with Supabase");
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-center text-center mb-8 space-y-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
          {mockUser.avatar ? (
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10" />
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{mockUser.name}</h1>
          <p className="text-muted-foreground">{mockUser.email}</p>
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
          
          <PlaceGrid 
            places={userPlaces} 
            emptyMessage="You haven't added any places yet." 
          />
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

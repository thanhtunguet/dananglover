
import { useState } from 'react';
import PlaceGrid from '@/components/Places/PlaceGrid';
import { mockPlaces } from '@/data/mockData';

export default function SavedPlacesPage() {
  // In a real app, this would be fetched from your backend
  // For now, we'll just use mock data
  const [savedPlaces] = useState(mockPlaces.slice(0, 3));

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Saved Places</h1>
      <p className="text-muted-foreground mb-6">Places you've saved for later</p>
      
      <PlaceGrid 
        places={savedPlaces} 
        emptyMessage="You haven't saved any places yet." 
      />
    </div>
  );
}

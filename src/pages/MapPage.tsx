
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '@/components/Map/MapView';
import { mockPlaces } from '@/data/mockData';
import { Place } from '@/types';

export default function MapPage() {
  const navigate = useNavigate();
  
  const handlePlaceSelect = (place: Place) => {
    navigate(`/places/${place.id}`);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Places</h1>
      
      <div className="h-[calc(100vh-12rem)]">
        <MapView 
          places={mockPlaces} 
          height="100%" 
          onPlaceSelect={handlePlaceSelect} 
        />
      </div>
    </div>
  );
}

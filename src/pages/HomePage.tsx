
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PlaceGrid from '@/components/Places/PlaceGrid';
import { mockPlaces } from '@/data/mockData';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState(mockPlaces);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setFilteredPlaces(mockPlaces);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query) || 
      place.description.toLowerCase().includes(query) ||
      place.location.address.toLowerCase().includes(query)
    );
    
    setFilteredPlaces(results);
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
            <h2 className="text-2xl font-bold tracking-tight">Popular Places</h2>
          </div>
          <PlaceGrid places={filteredPlaces} />
        </section>
      </div>
    </div>
  );
}

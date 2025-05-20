export interface Place {
  id: string;
  name: string;
  description: string;
  address?: string;
  lat?: number;
  lng?: number;
  cover_image: string;
  rating: number;
  price_range: 1 | 2 | 3; // 1=$, 2=$$, 3=$$$
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  created_by?: string;
  created_at: Date;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: Date;
  user?: Profile;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  place_id?: string;
  places?: Place;
  author_id: string;
  profiles?: Profile;
  cover_image?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

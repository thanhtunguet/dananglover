
export interface Place {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  rating: number;
  priceRange: 1 | 2 | 3; // 1=$, 2=$$, 3=$$$
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdBy?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user?: {
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}


import { Place, Review } from "@/types";

export const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Moonlight Cafe",
    description:
      "Cozy cafe with great coffee and pastries. Perfect for working or meeting friends.",
    cover_image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    price_range: 2,
    location: {
      address: "123 Coffee St, Seattle, WA",
      lat: 47.6062,
      lng: -122.3321,
    },
    created_at: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "Pixel Gaming Lounge",
    description:
      "Modern gaming cafe with all the latest consoles and PCs. Great for hangouts with friends who game.",
    cover_image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Z2FtaW5nJTIwY2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    price_range: 2,
    location: {
      address: "45 Game Ave, Portland, OR",
      lat: 45.5152,
      lng: -122.6784,
    },
    created_at: new Date("2023-02-20"),
  },
  {
    id: "3",
    name: "Ocean View Restaurant",
    description:
      "Upscale dining with spectacular views of the ocean. Known for their fresh seafood dishes.",
    cover_image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    price_range: 3,
    location: {
      address: "789 Ocean Dr, San Diego, CA",
      lat: 32.7157,
      lng: -117.1611,
    },
    created_at: new Date("2023-03-10"),
  },
  {
    id: "4",
    name: "Vintage Book Bar",
    description:
      "A unique combination of bookstore and wine bar. Browse rare books while enjoying a glass of wine.",
    cover_image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3N0b3JlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    price_range: 2,
    location: {
      address: "101 Literary Lane, Boston, MA",
      lat: 42.3601,
      lng: -71.0589,
    },
    created_at: new Date("2023-04-05"),
  },
  {
    id: "5",
    name: "Skyline Rooftop Bar",
    description:
      "Trendy rooftop bar with panoramic city views. Great for evening drinks and socializing.",
    cover_image:
      "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cm9vZnRvcCUyMGJhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.9,
    price_range: 3,
    location: {
      address: "567 High St, New York, NY",
      lat: 40.7128,
      lng: -74.006,
    },
    created_at: new Date("2023-05-18"),
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    place_id: "1",
    user_id: "u1",
    rating: 5,
    comment: "My favorite place to work remotely. Great coffee and atmosphere!",
    created_at: new Date("2023-02-10"),
    user: {
      id: "u1",
      full_name: "Alex Johnson",
      username: "alex_j",
      avatar_url: undefined,
    },
  },
  {
    id: "r2",
    place_id: "1",
    user_id: "u2",
    rating: 4,
    comment: "Love their pastries and the staff is super friendly.",
    created_at: new Date("2023-03-05"),
    user: {
      id: "u2",
      full_name: "Jamie Smith",
      username: "jamie_s",
      avatar_url: undefined,
    },
  },
  {
    id: "r3",
    place_id: "2",
    user_id: "u3",
    rating: 5,
    comment: "Amazing selection of games and the rates are reasonable.",
    created_at: new Date("2023-02-25"),
    user: {
      id: "u3",
      full_name: "Riley Taylor",
      username: "riley_t",
      avatar_url: undefined,
    },
  },
  {
    id: "r4",
    place_id: "3",
    user_id: "u1",
    rating: 5,
    comment: "The view is breathtaking and the seafood is incredibly fresh.",
    created_at: new Date("2023-04-12"),
    user: {
      id: "u1",
      full_name: "Alex Johnson",
      username: "alex_j",
      avatar_url: undefined,
    },
  },
  {
    id: "r5",
    place_id: "4",
    user_id: "u4",
    rating: 4,
    comment: "Such a unique concept! Found a rare book I've been looking for.",
    created_at: new Date("2023-04-30"),
    user: {
      id: "u4",
      full_name: "Jordan Patel",
      username: "jordan_p",
      avatar_url: undefined,
    },
  },
  {
    id: "r6",
    place_id: "5",
    user_id: "u2",
    rating: 5,
    comment: "Best views of the city! Great for a night out with friends.",
    created_at: new Date("2023-06-01"),
    user: {
      id: "u2",
      full_name: "Jamie Smith",
      username: "jamie_s",
      avatar_url: undefined,
    },
  },
];

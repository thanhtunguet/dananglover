import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { BlogPost } from "@/types";

export default function BlogListPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            `
            *,
            places(*),
            profiles(full_name, username, avatar_url)
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        return data.map((post) => {
          // Map the Supabase response to our BlogPost type
          const blogPost: BlogPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            place_id: post.place_id,
            places: post.places
              ? {
                  id: post.places.id,
                  name: post.places.name,
                  description: post.places.description,
                  cover_image: post.places.cover_image,
                  rating: post.places.rating,
                  price_range: post.places.price_range,
                  location: {
                    address: post.places.address,
                    lat: post.places.lat,
                    lng: post.places.lng,
                  },
                  created_by: post.places.created_by,
                  created_at: new Date(post.places.created_at),
                }
              : undefined,
            author_id: post.author_id,
            author: post.profiles
              ? {
                  full_name: post.profiles.full_name || "Anonymous",
                  username: post.profiles.username || "user",
                  avatar_url: post.profiles.avatar_url,
                }
              : undefined,
            cover_image: post.cover_image,
            created_at: new Date(post.created_at),
            updated_at: new Date(post.updated_at),
          };

          return blogPost;
        });
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        toast({
          variant: "destructive",
          title: "Error fetching blog posts",
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
        return [];
      }
    },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        {user && (
          <Button asChild>
            <Link to="/blog/new">
              <Plus className="mr-2" /> Add New Post
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : blogPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                {post.cover_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted" />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content.replace(/<[^>]*>?/gm, "").substring(0, 150)}
                    {post.content.length > 150 ? "..." : ""}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {post.author?.full_name || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.created_at)?.toLocaleDateString()}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No blog posts yet</h3>
          <p className="text-muted-foreground mb-6">
            {user
              ? "Be the first to share your experience!"
              : "Sign in to create a new post."}
          </p>
          {user ? (
            <Button asChild>
              <Link to="/blog/new">
                <Plus className="mr-2" /> Write First Post
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

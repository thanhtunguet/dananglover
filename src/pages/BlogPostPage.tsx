import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { BlogPostHeader } from "@/components/Blog/BlogPostHeader";
import { BlogPostContent } from "@/components/Blog/BlogPostContent";
import { BlogPostSkeleton } from "@/components/Blog/BlogPostSkeleton";
import { BlogPostNotFound } from "@/components/Blog/BlogPostNotFound";
import { useDeleteBlogPost } from "@/hooks/use-delete-blog-post";
import { BlogPost } from "@/types";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { handleDelete, isDeleting } = useDeleteBlogPost();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: async () => {
      if (!id) return null;

      try {
        // Use join syntax that works with Supabase
        const {
          data,
          error,
        }: {
          data: BlogPost;
          error: Error;
        } = await supabase
          .from("blog_posts")
          .select(
            `
            *,
            places(*),
            profiles(full_name, username, avatar_url)
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        // Transform the data to match the BlogPost type
        const blogPost: BlogPost = {
          id: data.id,
          title: data.title,
          content: data.content,
          place_id: data.place_id,
          places: data.places
            ? {
                id: data.places.id,
                name: data.places.name,
                description: data.places.description,
                cover_image: data.places.cover_image,
                rating: data.places.rating,
                price_range: data.places.price_range,
                location: {
                  address: data.places.address,
                  lat: data.places.lat,
                  lng: data.places.lng,
                },
                created_by: data.places.created_by,
                created_at: new Date(data.places.created_at),
              }
            : undefined,
          author_id: data.author_id,
          profiles: data.profiles
            ? {
                id: data.profiles.id,
                full_name: data.profiles.full_name || "Anonymous",
                username: data.profiles.username || "user",
                avatar_url: data.profiles.avatar_url,
              }
            : undefined,
          cover_image: data.cover_image,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        };

        return blogPost;
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          variant: "destructive",
          title: "Error fetching blog post",
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
        return null;
      }
    },
  });

  if (isLoading) {
    return <BlogPostSkeleton />;
  }

  if (!post) {
    return <BlogPostNotFound />;
  }

  const isAuthor = user?.id === post.author_id;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <BlogPostHeader
        post={post}
        isAuthor={isAuthor}
        isDeleting={isDeleting}
        onDelete={() => handleDelete(post.id)}
      />

      <BlogPostContent post={post} />
    </div>
  );
}

import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { BlogPost } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(`
            *,
            places(*),
            author:profiles!blog_posts_author_id_fkey(full_name, username, avatar_url)
          `)
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        return {
          id: data.id,
          title: data.title,
          content: data.content,
          placeId: data.place_id,
          place: data.places ? {
            id: data.places.id,
            name: data.places.name,
            description: data.places.description,
            coverImage: data.places.cover_image,
            rating: data.places.rating,
            priceRange: data.places.price_range,
            location: {
              address: data.places.address,
              lat: data.places.lat,
              lng: data.places.lng,
            },
            createdBy: data.places.created_by,
            createdAt: new Date(data.places.created_at),
          } : undefined,
          authorId: data.author_id,
          author: data.author && data.author.length > 0 ? {
            fullName: data.author[0]?.full_name || "Anonymous",
            username: data.author[0]?.username || "user",
            avatarUrl: data.author[0]?.avatar_url,
          } : undefined,
          coverImage: data.cover_image,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        } as BlogPost;
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          variant: "destructive",
          title: "Error fetching blog post",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        return null;
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      
      setIsDeleting(true);
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast({
        title: "Post deleted",
        description: "Your blog post has been deleted successfully.",
      });
      navigate("/blog");
    },
    onError: (error) => {
      setIsDeleting(false);
      toast({
        variant: "destructive",
        title: "Error deleting post",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePostMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
          </Link>
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === post.authorId;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
            </Link>
          </Button>
          
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/blog/edit/${post.id}`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <span>By {post.author?.fullName || "Anonymous"}</span>
          <span className="mx-2">•</span>
          <span>{post.createdAt.toLocaleDateString()}</span>
          {post.place && (
            <>
              <span className="mx-2">•</span>
              <Link to={`/places/${post.placeId}`} className="hover:underline">
                {post.place.name}
              </Link>
            </>
          )}
        </div>
      </div>
      
      {post.coverImage && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}


import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BlogPostForm from "@/components/Blog/BlogPostForm";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is authorized to edit this post
  const { data, isLoading } = useQuery({
    queryKey: ["blogPostAuth", id],
    queryFn: async () => {
      if (!id || !user) return null;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("author_id")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching post",
          description: error.message,
        });
        return null;
      }

      return data;
    },
    enabled: !!id && !!user,
  });

  // Redirect if not authenticated or not the author
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to edit a blog post.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (!isLoading && data && data.author_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own blog posts.",
        variant: "destructive",
      });
      navigate("/blog", { replace: true });
    }
  }, [user, data, isLoading, navigate]);

  if (!user || (data && data.author_id !== user.id)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>
      <BlogPostForm postId={id} />
    </div>
  );
}

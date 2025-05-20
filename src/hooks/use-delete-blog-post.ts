
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeleteBlogPost() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!postId) return;
      
      setIsDeleting(true);
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);

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

  const handleDelete = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePostMutation.mutate(postId);
    }
  };

  return { handleDelete, isDeleting };
}

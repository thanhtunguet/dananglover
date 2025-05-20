
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import BlogPostForm from "@/components/Blog/BlogPostForm";

export default function CreateBlogPostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a blog post.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}

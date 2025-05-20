import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogPost, Place } from "@/types";

interface BlogPostFormProps {
  postId?: string;
}

interface FormValues {
  title: string;
  content: string;
  placeId: string | "none";
  coverImage: string;
}

export default function BlogPostForm({ postId }: BlogPostFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!postId;

  // Fetch post data if editing
  const { data: post } = useQuery({
    queryKey: ["blogPost", postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching blog post",
          description: error.message,
        });
        return null;
      }

      return data;
    },
    enabled: isEditing,
  });

  // Fetch places to link to the blog post
  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("name");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching places",
          description: error.message,
        });
        return [];
      }

      return data.map((place) => ({
        id: place.id,
        name: place.name,
      }));
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      content: "",
      placeId: "none",
      coverImage: "",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        placeId: post.place_id || "none",
        coverImage: post.cover_image || "",
      });
    }
  }, [post, form]);

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("You must be logged in to create a post");
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: values.title,
          content: values.content,
          place_id: values.placeId === "none" ? null : values.placeId,
          author_id: user.id,
          cover_image: values.coverImage || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast({
        title: "Post created",
        description: "Your blog post has been created successfully.",
      });
      navigate(`/blog/${data.id}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error creating post",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!postId) throw new Error("Post ID is required");
      setIsSubmitting(true);

      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: values.title,
          content: values.content,
          place_id: values.placeId === "none" ? null : values.placeId,
          cover_image: values.coverImage || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) throw error;
      return { id: postId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost", postId] });
      toast({
        title: "Post updated",
        description: "Your blog post has been updated successfully.",
      });
      navigate(`/blog/${data.id}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error updating post",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your blog post content here..."
                  className="min-h-[300px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can use HTML formatting if you're familiar with it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Place (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a place (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {places.map((place: any) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Link this post to a place in our database.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Provide a URL to an image for your post cover.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isEditing ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

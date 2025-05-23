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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import type { BlogPost, Place } from "@/types";
import ImageUpload from "@/components/Forms/ImageUpload";

interface BlogPostFormProps {
  postId?: string;
}

interface FormValues {
  title: string;
  content: string;
  place_id: string | "none";
  cover_image: string;
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
      place_id: "none",
      cover_image: "",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        place_id: post.place_id || "none",
        cover_image: post.cover_image || "",
      });
    }
  }, [post, form]);

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("You must be logged in to create a post");
      setIsSubmitting(true);

      const place_id = values.place_id === "none" ? null : values.place_id;

      // First, create the post
      const { data: newPost, error: createError } = await supabase
        .from("blog_posts")
        .insert({
          title: values.title,
          content: values.content,
          place_id: place_id,
          author_id: user.id,
          cover_image: values.cover_image || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError) throw createError;

      // Then, fetch the complete post data
      const {
        data: completePost,
        error: fetchError,
      }: {
        data: any;
        error: Error;
      } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          places(*),
          profiles(full_name, username, avatar_url, id)
        `
        )
        .eq("id", newPost.id)
        .single();

      if (fetchError) throw fetchError;

      // Transform the data to match the BlogPost type
      const blogPost = {
        id: completePost.id,
        title: completePost.title,
        content: completePost.content,
        place_id: completePost.place_id,
        places: completePost.places
          ? {
            id: completePost.places.id,
            name: completePost.places.name,
            description: completePost.places.description,
            cover_image: completePost.places.cover_image,
            rating: completePost.places.rating,
            price_range: completePost.places.price_range,
            location: {
              address: completePost.places.address,
              lat: completePost.places.lat,
              lng: completePost.places.lng,
            },
            created_by: completePost.places.created_by,
            created_at: new Date(completePost.places.created_at),
          }
          : undefined,
        author_id: completePost.author_id,
        profiles: completePost.profiles
          ? {
            id: completePost.profiles.id,
            full_name: completePost.profiles.full_name || "Anonymous",
            username: completePost.profiles.username || "user",
            avatar_url: completePost.profiles.avatar_url,
          }
          : undefined,
        cover_image: completePost.cover_image,
        created_at: new Date(completePost.created_at),
        updated_at: new Date(completePost.updated_at),
      };

      return blogPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.setQueryData(["blogPost", data.id], data);
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

      const place_id = values.place_id === "none" ? null : values.place_id;

      // First, update the post
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
          title: values.title,
          content: values.content,
          place_id: place_id,
          cover_image: values.cover_image || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (updateError) throw updateError;

      // Then, fetch the complete post data
      const { data: completePost, error: fetchError } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          places(*),
          profiles(full_name, username, avatar_url, id)
        `
        )
        .eq("id", postId)
        .single();

      if (fetchError) throw fetchError;

      // Transform the data to match the BlogPost type
      const blogPost = {
        id: completePost.id,
        title: completePost.title,
        content: completePost.content,
        place_id: completePost.place_id,
        places: completePost.places
          ? {
            id: completePost.places.id,
            name: completePost.places.name,
            description: completePost.places.description,
            cover_image: completePost.places.cover_image,
            rating: completePost.places.rating,
            price_range: completePost.places.price_range,
            location: {
              address: completePost.places.address,
              lat: completePost.places.lat,
              lng: completePost.places.lng,
            },
            created_by: completePost.places.created_by,
            created_at: new Date(completePost.places.created_at),
          }
          : undefined,
        author_id: completePost.author_id,
        profiles: completePost.profiles
          ? {
            id: completePost.profiles.id,
            full_name: completePost.profiles.full_name || "Anonymous",
            username: completePost.profiles.username || "user",
            avatar_url: completePost.profiles.avatar_url,
          }
          : undefined,
        cover_image: completePost.cover_image,
        created_at: new Date(completePost.created_at),
        updated_at: new Date(completePost.updated_at),
      };

      return blogPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.setQueryData(["blogPost", data.id], data);
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
                <div data-color-mode="light" className={cn("min-h-[300px]")}>
                  <MDEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value || "")}
                    preview="edit"
                    height={300}
                    className="w-full"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Write your content using Markdown syntax. You can use # for
                headings, * for lists, and more.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="place_id"
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
                  {places.map((place: Place) => (
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
          name="cover_image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label="Cover Image"
                />
              </FormControl>
              <FormDescription>
                Upload an image or provide a URL for your post cover.
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

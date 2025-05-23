import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
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
import StarRating from "@/components/Forms/StarRating";
import PriceInput from "@/components/Forms/PriceInput";
import ImageUpload from "@/components/Forms/ImageUpload";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Place } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cover_image: z.string().min(1, "Cover image is required"),
  price_range: z.number().min(0, "Price cannot be negative"),
  rating: z.number().min(1).max(5).optional().nullable(),
  address: z.string().min(5, "Address must be at least 5 characters").optional().nullable(),
  lat: z.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  lng: z.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlaceFormProps {
  place?: Place;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: place?.name || "",
      description: place?.description || "",
      cover_image: place?.cover_image || "",
      price_range: place?.price_range || 0,
      rating: place?.rating || null,
      address: place?.location.address || null,
      lat: place?.location.lat || null,
      lng: place?.location.lng || null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to manage places.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const placeData = {
        name: values.name,
        description: values.description,
        cover_image: values.cover_image,
        price_range: values.price_range,
        rating: values.rating || null,
        address: values.address || null,
        lat: values.lat || null,
        lng: values.lng || null,
      };

      if (place) {
        // Update existing place
        const { error } = await supabase
          .from("places")
          .update(placeData)
          .eq("id", place.id)
          .eq("created_by", user.id);

        if (error) throw error;

        toast({
          title: "Place updated successfully",
          description: `${values.name} has been updated.`,
        });
      } else {
        // Create new place
        const { data, error } = await supabase
          .from("places")
          .insert([
            {
              ...placeData,
              created_by: user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Place added successfully",
          description: `${values.name} has been added to your places.`,
        });

        navigate(`/places/${data.id}`);
        return;
      }

      navigate(`/places/${place.id}`);
    } catch (error: any) {
      console.error("Error managing place:", error);
      toast({
        variant: "destructive",
        title: "Error managing place",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the place (e.g., "Moonlight Cafe")
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the place..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the place
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
                <FormLabel>Cover Image *</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Cover Image"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (VND) *</FormLabel>
                <FormControl>
                  <PriceInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (Optional)</FormLabel>
                <FormControl>
                  <StarRating value={field.value || 0} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Rate the place from 1 to 5 stars
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the address" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>The full address of the place</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 16.047079"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Between -90 and 90</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 108.206230"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Between -180 and 180</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : place ? "Update Place" : "Add Place"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

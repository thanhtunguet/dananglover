
import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create a unique file path with user ID as the folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('place_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Manual tracking of progress (since we removed the callback)
      setUploadProgress(100);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('place_images').getPublicUrl(filePath);

      // Update form with new URL
      onChange(publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the image",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <img
            src={value}
            alt="Uploaded image"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 bg-muted/50">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drag and drop or click to upload
                </span>
                <span className="text-xs text-muted-foreground">
                  (Max file size: 5MB)
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

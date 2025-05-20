import { Star } from "lucide-react";
import { Review } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  place_id?: string;
}

export default function ReviewList({
  reviews,
  isLoading = false,
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="flex items-start gap-4">
            <Avatar>
              {review.user?.avatar_url && (
                <AvatarImage
                  src={review.user.avatar_url}
                  alt={review.user.full_name || "User"}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary">
                {(review.user?.full_name || "User")
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex items-center">
                <h4 className="font-medium">
                  {review.user?.full_name || "Anonymous"}
                </h4>
                <span className="mx-2 h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">
                  {new Date(review.created_at)?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

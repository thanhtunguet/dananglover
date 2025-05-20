import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { BlogPost } from "@/types";

interface BlogPostHeaderProps {
  post: BlogPost;
  isAuthor: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}

export function BlogPostHeader({
  post,
  isAuthor,
  isDeleting,
  onDelete,
}: BlogPostHeaderProps) {
  return (
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
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <span>By {post.profiles?.full_name || "Anonymous"}</span>
        <span className="mx-2">•</span>
        <span>{new Date(post.created_at)?.toLocaleDateString()}</span>
        {post.places && (
          <>
            <span className="mx-2">•</span>
            <Link to={`/places/${post.place_id}`} className="hover:underline">
              {post.places.name}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

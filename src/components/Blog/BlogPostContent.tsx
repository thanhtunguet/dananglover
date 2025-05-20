
import React from "react";
import { BlogPost } from "@/types";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <>
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
    </>
  );
}

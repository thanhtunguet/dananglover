import React from "react";
import { BlogPost } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Components } from "react-markdown";

interface BlogPostContentProps {
  post: BlogPost;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const components: Components = {
    code({ inline, className, children, ...props }: CodeProps) {
      return (
        <code
          className={cn(
            "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
            inline ? "inline-block" : "block p-4 my-4",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

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

      <div className={cn("prose prose-slate max-w-none dark:prose-invert")}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {post.content}
        </ReactMarkdown>
      </div>
    </>
  );
}

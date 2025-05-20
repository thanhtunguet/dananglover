
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BlogPostNotFound() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
      <Button asChild>
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
        </Link>
      </Button>
    </div>
  );
}

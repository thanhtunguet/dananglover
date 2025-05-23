
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MapPin, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DaNangLover</span>
          </Link>
        </div>

        <div className="flex md:hidden">
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link to="/" className="flex items-center">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DaNangLover</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <div className="hidden md:flex md:items-center md:gap-5 md:text-sm">
              <Link to="/" className="font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Discover
              </Link>
              <Link to="/map" className="font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Map
              </Link>
              <Link to="/saved" className="font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Saved
              </Link>
              <Link to="/blog" className="font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Blog
              </Link>
            </div>
            <Link to="/add-place">
              <Button size="sm" variant="default" className="rounded-full">
                <Plus className="h-4 w-4 mr-2" /> Add Place
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in md:hidden bg-background",
        isMenuOpen ? "slide-in-from-bottom-80" : "hidden"
      )}>
        <div className="relative z-20 grid gap-6 p-4">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DaNangLover</span>
          </Link>
          <nav className="grid grid-flow-row auto-rows-max text-lg">
            <Link
              to="/"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              to="/map"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              to="/saved"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Saved
            </Link>
            <Link
              to="/blog"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/add-place"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Add Place
            </Link>
            <Link
              to="/profile"
              className="flex w-full items-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
          </nav>
        </div>
        <Button
          variant="ghost"
          className="absolute right-4 top-4 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </header>
  );
}

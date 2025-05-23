import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import HomePage from "./pages/HomePage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import MapPage from "./pages/MapPage";
import SavedPlacesPage from "./pages/SavedPlacesPage";
import AddPlacePage from "./pages/AddPlacePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import CreateBlogPostPage from "./pages/CreateBlogPostPage";
import EditBlogPostPage from "./pages/EditBlogPostPage";
import EditPlacePage from "./pages/EditPlacePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/places/edit/:id" element={<EditPlacePage />} />
              <Route path="/places/:id" element={<PlaceDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/saved" element={<SavedPlacesPage />} />
              <Route path="/add-place" element={<AddPlacePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/blog/new" element={<CreateBlogPostPage />} />
              <Route path="/blog/edit/:id" element={<EditBlogPostPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

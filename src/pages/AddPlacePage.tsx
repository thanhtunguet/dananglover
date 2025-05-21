
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PlaceForm } from "@/components/Places/PlaceForm";

export default function AddPlacePage() {
  const { user, loading } = useAuth();

  // If not logged in and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add a New Place</h1>
      <PlaceForm />
    </div>
  );
}

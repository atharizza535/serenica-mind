import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";
import Therapists from "./pages/Therapists";
import TherapistDetail from "./pages/TherapistDetail";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import TherapistOnboarding from "./pages/TherapistOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/therapists/:id" element={<TherapistDetail />} />
            <Route path="/onboarding" element={<TherapistOnboarding />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
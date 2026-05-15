import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import ApartmentDetail from "./pages/ApartmentDetail";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import ManualPayment from "./pages/ManualPayment";
import SubscriptionStatus from "./pages/SubscriptionStatus";
import PricePrediction from "./pages/PricePrediction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddApartment from "./pages/AddApartment";
import EditApartment from "./pages/EditApartment";
import Settings from "./pages/Settings";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdAnalysisReport from "./pages/AdAnalysisReport";

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
            <Route path="/search" element={<Search />} />
            <Route path="/apartment/:id" element={<ApartmentDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            <Route
              path="/payment/:packageId"
              element={
                <ProtectedRoute>
                  <ManualPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-status"
              element={
                <ProtectedRoute>
                  <SubscriptionStatus />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-apartment"
              element={
                <ProtectedRoute requiredType="landlord">
                  <AddApartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-apartment/:id"
              element={
                <ProtectedRoute requiredType="landlord">
                  <EditApartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ad-analysis"
              element={
                <ProtectedRoute requiredType="landlord">
                  <AdAnalysisReport />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import HelpCenter from "./pages/HelpCenter";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";
import MobyClone from "./pages/MobyClone";
import Profile_Enhanced from "./pages/Profile_Enhanced";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import OTPDemo from "./pages/OTPDemo";
import OTPTestPage from "./pages/OTPTestPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import PerformanceTest from "./pages/PerformanceTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/confirm" element={<EmailConfirmation />} />
            
            {/* Protected route - requires Auto-Bot access (phone + email verification) */}
            <Route path="/moby-clone" element={
              <AuthGuard requireAutoBot={true}>
                <MobyClone />
              </AuthGuard>
            } />
            
            {/* Protected routes - requires basic authentication */}
            <Route path="/profile" element={
              <AuthGuard>
                <Profile_Enhanced />
              </AuthGuard>
            } />
            <Route path="/analytics" element={
              <AuthGuard>
                <AnalyticsDashboard />
              </AuthGuard>
            } />
            <Route path="/performance" element={
              <AuthGuard>
                <PerformanceTest />
              </AuthGuard>
            } />
            
            {/* Public routes */}
            <Route path="/otp-demo" element={<OTPDemo />} />
            <Route path="/otp-test" element={<OTPTestPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

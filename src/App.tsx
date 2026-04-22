import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import BillboardDetailPage from "./pages/BillboardDetailPage";
import CampaignSetupPage from "./pages/CampaignSetupPage";
import UploadCreativePage from "./pages/UploadCreativePage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import BannerDetailPage from "./pages/BannerDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import TeamPage from "./pages/TeamPage";
import TalkToXadsPage from "./pages/TalkToXadsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={protect(<HomePage />)} />
            <Route path="/search" element={protect(<SearchPage />)} />
            <Route path="/billboard/:id" element={protect(<BillboardDetailPage />)} />
            <Route path="/campaign-setup" element={protect(<CampaignSetupPage />)} />
            <Route path="/upload-creative" element={protect(<UploadCreativePage />)} />
            <Route path="/order-tracking" element={protect(<OrderTrackingPage />)} />
            <Route path="/payment" element={protect(<PaymentPage />)} />
            <Route path="/success" element={protect(<SuccessPage />)} />
            <Route path="/campaigns" element={protect(<CampaignsPage />)} />
            <Route path="/campaign/:id" element={protect(<CampaignDetailPage />)} />
            <Route path="/campaign/:id/banner/:bannerId" element={protect(<BannerDetailPage />)} />
            <Route path="/profile" element={protect(<ProfilePage />)} />
            <Route path="/profile/account" element={protect(<AccountSettingsPage />)} />
            <Route path="/profile/business" element={protect(<BusinessProfilePage />)} />
            <Route path="/profile/team" element={protect(<TeamPage />)} />
            <Route path="/talk-to-xads" element={protect(<TalkToXadsPage />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

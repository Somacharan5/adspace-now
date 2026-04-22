import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGate from "@/components/RoleGate";
import LoginPage from "./pages/LoginPage";
import RolePickerPage from "./pages/RolePickerPage";
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
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import VendorListingsPage from "./pages/vendor/VendorListingsPage";
import ListingFormPage from "./pages/vendor/ListingFormPage";
import VendorMapPage from "./pages/vendor/VendorMapPage";
import { VendorMessagesPage, VendorAnalyticsPage, VendorNotificationsPage } from "./pages/vendor/PlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;
const vendor = (el: JSX.Element) => <RoleGate allow="vendor">{el}</RoleGate>;
const owner = (el: JSX.Element) => <RoleGate allow={["property_owner"]}>{el}</RoleGate>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/select-role" element={<RolePickerPage />} />

            {/* Business / buyer flow */}
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
            <Route path="/profile" element={<RoleGate allow="any"><ProfilePage /></RoleGate>} />
            <Route path="/profile/account" element={<RoleGate allow="any"><AccountSettingsPage /></RoleGate>} />
            <Route path="/profile/business" element={<RoleGate allow="any"><BusinessProfilePage /></RoleGate>} />
            <Route path="/profile/team" element={<RoleGate allow="any"><TeamPage /></RoleGate>} />
            <Route path="/talk-to-xads" element={protect(<TalkToXadsPage />)} />

            {/* Vendor portal */}
            <Route path="/vendor/dashboard" element={vendor(<VendorDashboardPage />)} />
            <Route path="/vendor/listings" element={owner(<VendorListingsPage />)} />
            <Route path="/vendor/listings/new" element={owner(<ListingFormPage />)} />
            <Route path="/vendor/listings/:id" element={owner(<ListingFormPage />)} />
            <Route path="/vendor/map" element={vendor(<VendorMapPage />)} />
            <Route path="/vendor/messages" element={vendor(<VendorMessagesPage />)} />
            <Route path="/vendor/analytics" element={vendor(<VendorAnalyticsPage />)} />
            <Route path="/vendor/notifications" element={vendor(<VendorNotificationsPage />)} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

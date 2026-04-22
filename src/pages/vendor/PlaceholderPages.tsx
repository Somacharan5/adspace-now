import VendorLayout from "@/components/vendor/VendorLayout";
import { MessageSquare, BarChart3, Bell } from "lucide-react";

const ComingSoon = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <VendorLayout>
    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{title}</h1>
    <p className="text-sm text-muted-foreground mb-6">{desc}</p>
    <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground">Coming in Phase 2</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        This module is part of the next build phase. The foundation is ready — we'll wire it up next.
      </p>
    </div>
  </VendorLayout>
);

export const VendorMessagesPage = () => <ComingSoon icon={MessageSquare} title="Messages" desc="Real-time chat with owners, vendors, and businesses" />;
export const VendorAnalyticsPage = () => <ComingSoon icon={BarChart3} title="Analytics" desc="Performance trends across your listings" />;
export const VendorNotificationsPage = () => <ComingSoon icon={Bell} title="Notifications" desc="Booking requests, status updates, system alerts" />;

import VendorLayout from "@/components/vendor/VendorLayout";
import { BarChart3 } from "lucide-react";

const ComingSoon = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <VendorLayout>
    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{title}</h1>
    <p className="text-sm text-muted-foreground mb-6">{desc}</p>
    <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground">Coming soon</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Performance trends and revenue analytics will land in the next phase.
      </p>
    </div>
  </VendorLayout>
);

export const VendorAnalyticsPage = () => <ComingSoon icon={BarChart3} title="Analytics" desc="Performance trends across your listings" />;

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import successImg from "@/assets/success-illustration.png";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="text-center max-w-sm w-full"
      >
        <img src={successImg} alt="Success" className="w-32 h-32 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-foreground">Your campaign is live 🚀</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your billboard ad is being set up and will go live shortly.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-secondary text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Campaign ID</span>
            <span className="font-medium text-foreground">XH-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium text-foreground">{state.startDate || "2025-04-01"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Billboard</span>
            <span className="font-medium text-foreground">{state.billboard?.title || "MG Road Premium"}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            onClick={() => navigate("/campaigns")}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base gap-2"
          >
            <BarChart3 className="w-4 h-4" /> Track Campaign
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            <Download className="w-4 h-4" /> Download Invoice
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Printer, Truck, HardHat, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: CheckCircle2, label: "Design Approved", desc: "Your creative has been approved", done: true },
  { icon: Printer, label: "Printing", desc: "Ad is being printed", done: true },
  { icon: Truck, label: "Transportation", desc: "In transit to location", done: false, current: true },
  { icon: HardHat, label: "Installation", desc: "Crew is installing the billboard", done: false },
  { icon: Radio, label: "Live", desc: "Your billboard is live!", done: false },
];

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Order Tracking</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6">
        {/* Timeline */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? "bg-success text-success-foreground"
                        : step.current
                        ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-12 ${
                        step.done ? "bg-success" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-2 pb-6">
                  <p className={`font-semibold text-sm ${step.done || step.current ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  {step.current && (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                      In Progress
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <Button
          onClick={() => navigate("/payment", { state })}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

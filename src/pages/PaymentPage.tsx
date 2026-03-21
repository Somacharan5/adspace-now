import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CreditCard, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const paymentMethods = [
  { id: "upi", icon: Smartphone, label: "UPI", desc: "GPay, PhonePe, Paytm" },
  { id: "card", icon: CreditCard, label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: Building2, label: "Net Banking", desc: "All major banks" },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const billboard = state.billboard;
  const days = state.days || 7;
  const [method, setMethod] = useState("upi");

  const subtotal = billboard ? billboard.price * days : 45000;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Payment</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-5">
        {/* Order Summary */}
        <div className="p-4 rounded-xl bg-card card-shadow">
          <h3 className="font-semibold text-foreground text-sm mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billboard</span>
              <span className="text-foreground">{billboard?.title || "MG Road Premium"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{days} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="text-foreground">₹{gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                  method === id ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          256-bit SSL encrypted. Your data is safe.
        </div>
      </motion.div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <Button
          onClick={() => navigate("/success", { state })}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          Confirm & Pay ₹{total.toLocaleString()}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;

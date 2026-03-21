import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/xads-logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleContinue = () => {
    if (step === "phone" && phone.length >= 10) {
      setStep("otp");
    } else if (step === "otp" && otp.length === 4) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-10">
          <img src={logo} alt="XHats" className="h-12" />
        </div>

        <div className="space-y-6">
          {step === "phone" ? (
            <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter your phone number to continue</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12 h-12 text-base rounded-xl"
                  maxLength={10}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
                <p className="text-sm text-muted-foreground mt-1">Sent to +91 {phone}</p>
              </div>
              <Input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-12 text-center text-2xl tracking-[0.5em] font-semibold rounded-xl"
                maxLength={4}
              />
              <button className="text-sm text-accent font-medium" onClick={() => setStep("phone")}>
                Change number
              </button>
            </motion.div>
          )}

          <Button
            onClick={handleContinue}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base gap-2"
            disabled={step === "phone" ? phone.length < 10 : otp.length < 4}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Trusted by 1,000+ businesses across India
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

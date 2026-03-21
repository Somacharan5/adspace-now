import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Image, Sun, Moon, ZoomIn, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import billboard1 from "@/assets/billboard-1.jpg";

const UploadCreativePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dayMode, setDayMode] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Upload Creative</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6">
        {/* Upload Area */}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-accent transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-accent" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">
              {preview ? "Change creative" : "Upload your ad creative"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or Video · Max 10MB</p>
          </div>
        </button>

        {/* Billboard Preview - CORE FEATURE */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Image className="w-4 h-4 text-accent" /> Live Preview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDayMode(!dayMode)}
                    className={`p-2 rounded-lg transition-colors ${dayMode ? "bg-secondary" : "bg-primary text-primary-foreground"}`}
                  >
                    {dayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setZoomed(!zoomed)}
                    className="p-2 rounded-lg bg-secondary"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Realistic Billboard Mockup */}
              <div
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                  dayMode ? "bg-blue-50" : "bg-gray-900"
                } ${zoomed ? "scale-110 origin-center" : ""}`}
              >
                <img
                  src={billboard1}
                  alt="Billboard scene"
                  className={`w-full h-56 object-cover transition-all duration-500 ${
                    dayMode ? "brightness-100" : "brightness-50"
                  }`}
                />
                {/* Overlay the user's creative onto the billboard */}
                <div className="absolute top-[15%] left-[15%] w-[70%] h-[45%] overflow-hidden">
                  <img
                    src={preview}
                    alt="Your creative"
                    className="w-full h-full object-cover"
                    style={{
                      filter: dayMode ? "brightness(1.05)" : "brightness(0.8)",
                    }}
                  />
                </div>
                {!dayMode && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
                    <span className="text-[10px] text-accent-foreground font-medium">Night View</span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-success/10 flex items-center gap-2">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-xs text-success font-medium">Your creative looks great on this billboard!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fixed CTA */}
      {preview && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border"
        >
          <Button
            onClick={() => navigate("/order-tracking", { state })}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Confirm & Continue
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default UploadCreativePage;

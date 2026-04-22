import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const MetricCard = ({ icon: Icon, label, value, hint, accent }: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "accent" | "success" | "warning" | "destructive";
}) => {
  const color = accent ?? "accent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}/10`}>
          <Icon className={`w-4 h-4 text-${color}`} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </div>
    </motion.div>
  );
};

export default MetricCard;

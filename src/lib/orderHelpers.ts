import { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending approval",
  approved: "Approved — awaiting payment",
  rejected: "Rejected",
  paid: "Paid — ready to print",
  printing: "Printing",
  installed: "Installed",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-destructive/10 text-destructive",
  paid: "bg-accent/10 text-accent",
  printing: "bg-accent/10 text-accent",
  installed: "bg-accent/10 text-accent",
  live: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export const ORDER_TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Requested" },
  { status: "approved", label: "Approved" },
  { status: "paid", label: "Paid" },
  { status: "printing", label: "Printing" },
  { status: "installed", label: "Installed" },
  { status: "live", label: "Live" },
  { status: "completed", label: "Completed" },
];

export const isTerminal = (s: OrderStatus) => s === "rejected" || s === "completed" || s === "cancelled";

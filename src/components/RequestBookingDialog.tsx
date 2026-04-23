import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    title: string;
    owner_id: string | null;
    price_per_day: number;
  };
};

const RequestBookingDialog = ({ open, onOpenChange, listing }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [start, setStart] = useState<Date | undefined>(addDays(new Date(), 3));
  const [end, setEnd] = useState<Date | undefined>(addDays(new Date(), 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = start && end ? Math.max(1, differenceInCalendarDays(end, start) + 1) : 0;
  const total = days * listing.price_per_day;

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in to request a booking");
      return;
    }
    if (!listing.owner_id) {
      toast.error("This listing has no owner assigned");
      return;
    }
    if (!start || !end || days < 1) {
      toast.error("Pick a valid date range");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        listing_id: listing.id,
        business_id: user.id,
        owner_id: listing.owner_id,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
        duration_days: days,
        price_per_day: listing.price_per_day,
        total_cost: total,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking request sent");
    onOpenChange(false);
    navigate(`/orders/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request booking</DialogTitle>
          <DialogDescription>{listing.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !start && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {start ? format(start, "PP") : "Pick"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={start} onSelect={setStart} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">End date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !end && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {end ? format(end, "PP") : "Pick"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={end} onSelect={setEnd} disabled={(d) => !start || d < start} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes for the owner (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests, creative direction, install timing…" className="mt-1 min-h-[80px]" />
          </div>

          <div className="rounded-xl border border-border p-3 bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{days} days × ₹{listing.price_per_day.toLocaleString()}</p>
              <p className="text-lg font-bold text-foreground">₹{total.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-[160px] text-right">Reserve now — pay only after the owner approves.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || days < 1}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestBookingDialog;

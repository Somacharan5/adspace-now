import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, MapPin, IndianRupee, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VendorLayout from "@/components/vendor/VendorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Listing = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  type: string;
  price_per_day: number;
  status: string;
  images: string[];
};

const statusColor: Record<string, string> = {
  available: "bg-success/10 text-success",
  booked: "bg-warning/10 text-warning",
  inactive: "bg-muted text-muted-foreground",
};

const VendorListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("id,title,city,area,type,price_per_day,status,images")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setListings((data as Listing[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    load();
  };

  const filtered = listings.filter((l) =>
    !search || `${l.title} ${l.city} ${l.area ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VendorLayout>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{listings.length} total</p>
        </div>
        <Button onClick={() => navigate("/vendor/listings/new")} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Listing</Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <h3 className="font-semibold text-foreground">No listings yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Add your first billboard to start earning.</p>
          <Button onClick={() => navigate("/vendor/listings/new")} className="mt-4 gap-2 rounded-xl"><Plus className="w-4 h-4" /> Create Listing</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <div key={l.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-muted relative">
                {l.images?.[0] ? (
                  <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                )}
                <Badge className={`absolute top-3 right-3 ${statusColor[l.status]} border-0 capitalize`}>{l.status}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1">{l.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" /> {l.area ? `${l.area}, ` : ""}{l.city}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm font-semibold text-foreground">
                  <IndianRupee className="w-3.5 h-3.5" />{l.price_per_day.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/day</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg gap-1" onClick={() => navigate(`/vendor/listings/${l.id}`)}>
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove "{l.title}". Active bookings may be affected.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(l.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorListingsPage;

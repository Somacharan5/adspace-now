import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Upload, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorLayout from "@/components/vendor/VendorLayout";
import LocationPicker from "@/components/vendor/LocationPicker";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TYPES = ["Billboard", "Digital", "Transit", "Hoarding", "Mall", "Airport"];
const STATUSES = ["available", "booked", "inactive"];

const ListingFormPage = () => {
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    area: "",
    type: "Billboard",
    size: "",
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    latitude: null as number | null,
    longitude: null as number | null,
    images: [] as string[],
    tags: "",
    traffic_estimate: "",
    status: "available",
  });

  useEffect(() => {
    if (!isEdit || !user) return;
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (!data) return;
      setForm({
        title: data.title,
        description: data.description ?? "",
        city: data.city,
        area: data.area ?? "",
        type: data.type,
        size: data.size ?? "",
        price_per_day: data.price_per_day,
        price_per_week: data.price_per_week ?? 0,
        price_per_month: data.price_per_month ?? 0,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images ?? [],
        tags: (data.tags ?? []).join(", "),
        traffic_estimate: data.traffic_estimate ?? "",
        status: data.status,
      });
    })();
  }, [id, isEdit, user]);

  const upload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("listing-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
    if (urls.length) toast.success(`${urls.length} image(s) uploaded`);
  };

  const removeImage = (url: string) => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  const save = async () => {
    if (!user) return;
    if (!form.title || !form.city || !form.price_per_day) {
      toast.error("Title, city, and daily price are required");
      return;
    }
    setSaving(true);
    const payload = {
      owner_id: user.id,
      title: form.title,
      description: form.description || null,
      city: form.city,
      area: form.area || null,
      type: form.type,
      size: form.size || null,
      price_per_day: Number(form.price_per_day),
      price_per_week: form.price_per_week ? Number(form.price_per_week) : null,
      price_per_month: form.price_per_month ? Number(form.price_per_month) : null,
      latitude: form.latitude,
      longitude: form.longitude,
      images: form.images,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      traffic_estimate: form.traffic_estimate || null,
      status: form.status as "available" | "booked" | "inactive",
    };

    const { error } = isEdit
      ? await supabase.from("listings").update(payload).eq("id", id!)
      : await supabase.from("listings").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEdit ? "Listing updated" : "Listing created");
    navigate("/vendor/listings");
  };

  return (
    <VendorLayout>
      <button onClick={() => navigate("/vendor/listings")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to listings
      </button>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{isEdit ? "Edit Listing" : "New Listing"}</h1>
      <p className="text-sm text-muted-foreground mb-6">Fill in details — buyers will see what you provide here.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bandra-Kurla Premium Billboard" className="mt-1.5 rounded-xl h-11" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes this billboard special?" className="mt-1.5 rounded-xl min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5 rounded-xl h-11" />
            </div>
            <div>
              <Label>Area</Label>
              <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-1.5 rounded-xl h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5 rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Size</Label>
              <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 40x20 ft" className="mt-1.5 rounded-xl h-11" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>₹/day *</Label>
              <Input type="number" value={form.price_per_day || ""} onChange={(e) => setForm({ ...form, price_per_day: Number(e.target.value) })} className="mt-1.5 rounded-xl h-11" />
            </div>
            <div>
              <Label>₹/week</Label>
              <Input type="number" value={form.price_per_week || ""} onChange={(e) => setForm({ ...form, price_per_week: Number(e.target.value) })} className="mt-1.5 rounded-xl h-11" />
            </div>
            <div>
              <Label>₹/month</Label>
              <Input type="number" value={form.price_per_month || ""} onChange={(e) => setForm({ ...form, price_per_month: Number(e.target.value) })} className="mt-1.5 rounded-xl h-11" />
            </div>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Premium, High Traffic, Tech" className="mt-1.5 rounded-xl h-11" />
          </div>
          <div>
            <Label>Traffic Estimate</Label>
            <Input value={form.traffic_estimate} onChange={(e) => setForm({ ...form, traffic_estimate: e.target.value })} placeholder="e.g. 50,000+ daily" className="mt-1.5 rounded-xl h-11" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1.5 rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Location (click on map)</Label>
            <div className="mt-1.5">
              <LocationPicker
                lat={form.latitude}
                lng={form.longitude}
                onPick={(la, ln) => setForm((f) => ({ ...f, latitude: la, longitude: ln }))}
                height={280}
              />
            </div>
            {form.latitude && form.longitude && (
              <p className="text-xs text-muted-foreground mt-2">Selected: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
            )}
          </div>

          <div>
            <Label>Images</Label>
            <label className="mt-1.5 flex items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border hover:border-accent cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload images"}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {form.images.map((url) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(url)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 sticky bottom-4">
        <Button variant="outline" onClick={() => navigate("/vendor/listings")} className="rounded-xl">Cancel</Button>
        <Button onClick={save} disabled={saving} className="flex-1 rounded-xl h-11 font-semibold">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Listing"}
        </Button>
      </div>
    </VendorLayout>
  );
};

export default ListingFormPage;

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import VendorLayout from "@/components/vendor/VendorLayout";
import { supabase } from "@/integrations/supabase/client";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Listing = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  type: string;
  price_per_day: number;
  latitude: number | null;
  longitude: number | null;
  status: string;
};

const VendorMapPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("id,title,city,area,type,price_per_day,latitude,longitude,status")
        .eq("status", "available");
      setListings((data as Listing[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const filtered = listings.filter((l) => {
    if (search && !`${l.title} ${l.city} ${l.area ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (type !== "all" && l.type !== type) return false;
    if (maxPrice !== "all" && l.price_per_day > Number(maxPrice)) return false;
    return l.latitude != null && l.longitude != null;
  });

  useEffect(() => {
    if (!layerRef.current || !mapRef.current) return;
    layerRef.current.clearLayers();
    filtered.forEach((l) => {
      const marker = L.marker([l.latitude!, l.longitude!]).addTo(layerRef.current!);
      marker.bindPopup(`
        <div style="min-width:160px">
          <div style="font-weight:600">${l.title}</div>
          <div style="font-size:12px;color:#666">${l.area ? l.area + ", " : ""}${l.city}</div>
          <div style="margin-top:4px;font-weight:600">₹${l.price_per_day.toLocaleString()}/day</div>
          <div style="margin-top:2px;font-size:11px;color:#888">${l.type}</div>
        </div>
      `);
    });
    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map((l) => [l.latitude!, l.longitude!] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [filtered]);

  return (
    <VendorLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Map View</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all available billboards on the map</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search city or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Billboard">Billboard</SelectItem>
            <SelectItem value="Digital">Digital</SelectItem>
            <SelectItem value="Transit">Transit</SelectItem>
            <SelectItem value="Hoarding">Hoarding</SelectItem>
          </SelectContent>
        </Select>
        <Select value={maxPrice} onValueChange={setMaxPrice}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Max price/day" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            <SelectItem value="10000">Under ₹10k</SelectItem>
            <SelectItem value="15000">Under ₹15k</SelectItem>
            <SelectItem value="25000">Under ₹25k</SelectItem>
            <SelectItem value="50000">Under ₹50k</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Showing</span>
        <Badge variant="secondary" className="rounded-full">{filtered.length} listings</Badge>
      </div>

      <div ref={containerRef} style={{ height: "60vh" }} className="rounded-2xl overflow-hidden border border-border" />
    </VendorLayout>
  );
};

export default VendorMapPage;

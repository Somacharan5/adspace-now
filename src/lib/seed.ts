import { supabase } from "@/integrations/supabase/client";
import { billboards } from "@/lib/data";

// Seed 2 demo campaigns for new users on first login.
export async function seedDemoCampaignsIfEmpty(userId: string) {
  const { data: existing } = await supabase
    .from("campaigns")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const today = new Date();
  const sixDaysAgo = new Date(today);
  sixDaysAgo.setDate(today.getDate() - 6);
  const inAWeek = new Date(today);
  inAWeek.setDate(today.getDate() + 7);

  const c1 = billboards.find((b) => b.id === "1")!;
  const c2 = billboards.find((b) => b.id === "5")!;
  const c3 = billboards.find((b) => b.id === "2")!;

  const { data: camp1 } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      name: "Summer Sale 2025",
      start_date: sixDaysAgo.toISOString().slice(0, 10),
      duration_days: 30,
      status: "live",
      total_cost: (c1.price + c2.price) * 30,
    })
    .select()
    .single();

  if (camp1) {
    await supabase.from("campaign_billboards").insert([
      { campaign_id: camp1.id, billboard_id: c1.id, billboard_title: c1.title, billboard_city: c1.city, billboard_location: c1.location, billboard_image: c1.image, billboard_lat: c1.lat, billboard_lng: c1.lng, price_per_day: c1.price, status: "live" },
      { campaign_id: camp1.id, billboard_id: c2.id, billboard_title: c2.title, billboard_city: c2.city, billboard_location: c2.location, billboard_image: c2.image, billboard_lat: c2.lat, billboard_lng: c2.lng, price_per_day: c2.price, status: "live" },
    ]);
  }

  const { data: camp2 } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      name: "Product Launch",
      start_date: inAWeek.toISOString().slice(0, 10),
      duration_days: 14,
      status: "printing",
      total_cost: c3.price * 14,
    })
    .select()
    .single();

  if (camp2) {
    await supabase.from("campaign_billboards").insert([
      { campaign_id: camp2.id, billboard_id: c3.id, billboard_title: c3.title, billboard_city: c3.city, billboard_location: c3.location, billboard_image: c3.image, billboard_lat: c3.lat, billboard_lng: c3.lng, price_per_day: c3.price, status: "printing" },
    ]);
  }
}

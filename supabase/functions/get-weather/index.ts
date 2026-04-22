import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lng, city } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat and lng required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check cache (1 hour)
    const { data: cached } = await supabase
      .from("weather_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (cached && new Date(cached.fetched_at).getTime() > Date.now() - 60 * 60 * 1000) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch live + 7-day past from Open-Meteo (no API key)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&past_days=7&forecast_days=1&timezone=auto`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo error: ${r.status}`);
    const raw = await r.json();

    const codeToCondition = (c: number): { condition: string; icon: string } => {
      if (c === 0) return { condition: "Clear", icon: "☀️" };
      if (c <= 2) return { condition: "Partly Cloudy", icon: "⛅" };
      if (c === 3) return { condition: "Cloudy", icon: "☁️" };
      if (c <= 48) return { condition: "Foggy", icon: "🌫️" };
      if (c <= 67) return { condition: "Rainy", icon: "🌧️" };
      if (c <= 77) return { condition: "Snow", icon: "🌨️" };
      if (c <= 82) return { condition: "Showers", icon: "🌦️" };
      if (c <= 99) return { condition: "Thunderstorm", icon: "⛈️" };
      return { condition: "Unknown", icon: "🌡️" };
    };

    const today = {
      temp: `${Math.round(raw.current.temperature_2m)}°C`,
      humidity: `${raw.current.relative_humidity_2m}%`,
      wind: `${Math.round(raw.current.wind_speed_10m)} km/h`,
      ...codeToCondition(raw.current.weather_code),
    };

    const log = (raw.daily.time as string[]).map((date: string, i: number) => {
      const c = codeToCondition(raw.daily.weather_code[i]);
      return {
        date,
        temp: `${Math.round(raw.daily.temperature_2m_max[i])}°C / ${Math.round(raw.daily.temperature_2m_min[i])}°C`,
        ...c,
      };
    }).reverse();

    const data = { city: city ?? null, today, log };

    await supabase.from("weather_cache").upsert({ cache_key: cacheKey, data, fetched_at: new Date().toISOString() }, { onConflict: "cache_key" });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

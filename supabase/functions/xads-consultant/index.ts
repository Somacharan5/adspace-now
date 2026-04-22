import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BILLBOARD_CATALOG = `
Available billboards (id | title | city | type | size | price/day INR | tags):
1 | MG Road Premium Hoarding | Bangalore | Hoarding | 40x20 | 25000 | High Traffic, Premium
2 | Andheri Digital Billboard | Mumbai | Digital | 30x15 | 35000 | Digital, Popular
3 | NH-48 Highway Unipole | Gurugram | Unipole | 50x25 | 12000 | Budget, Highway
4 | T Nagar Market | Chennai | Hoarding | 30x15 | 18000 | High Traffic, Market
5 | Connaught Place Digital | Delhi | Digital | 25x12 | 35000 | Premium, Landmark
6 | Salt Lake Sector V | Kolkata | Hoarding | 35x18 | 8000 | Budget, IT Hub
7 | Bandra-Worli Sea Link | Mumbai | Digital | 35x18 | 32000 | Premium, Landmark
8 | Koramangala Bus Shelter | Bangalore | Bus Shelter | 6x4 | 5000 | Budget, Residential
9 | Hinjewadi IT Park Unipole | Pune | Unipole | 45x20 | 15000 | IT Hub, High Traffic
10 | Anna Salai Digital | Chennai | Digital | 28x14 | 28000 | Digital, High Traffic
11 | Jubilee Hills Hoarding | Hyderabad | Hoarding | 40x20 | 22000 | Premium, Residential
12 | SG Highway Bus Shelter | Ahmedabad | Bus Shelter | 6x4 | 6000 | Budget, Popular
13 | MG Road Metro Delhi | Delhi | Hoarding | 30x15 | 20000 | High Traffic, Landmark
14 | Marine Drive Unipole | Mumbai | Unipole | 40x20 | 30000 | Premium, Landmark
15 | Whitefield Bus Shelter | Bangalore | Bus Shelter | 6x4 | 5500 | Budget, IT Hub
16 | Noida Expressway Digital | Noida | Digital | 35x18 | 27000 | Highway, Digital
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load business profile to personalise system prompt
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const businessContext = biz
      ? `User's business profile:
- Name: ${biz.business_name || "(not set)"}
- Industry: ${biz.industry || "(not set)"}
- Target audience: ${biz.target_audience || "(not set)"}
- Marketing goals: ${biz.marketing_goals || "(not set)"}
- Monthly budget: ${biz.monthly_budget ? "₹" + biz.monthly_budget.toLocaleString() : "(not set)"}
- Preferred cities: ${biz.preferred_cities?.join(", ") || "(not set)"}
- Description: ${biz.description || "(not set)"}`
      : "User has not filled in their business profile yet. Politely ask them to do so for better recommendations.";

    const systemPrompt = `You are "Xads Consultant", a senior outdoor advertising strategist. You help businesses pick the right billboards across India.

${businessContext}

${BILLBOARD_CATALOG}

When recommending campaigns:
- Be concise. Use bullet points and short paragraphs.
- Pick 2–4 specific billboards by id+title+city.
- Explain WHY each fits their audience and goal.
- Suggest creative direction (tone, visuals, copy hook) tailored to their industry.
- Give a quick estimate: total budget for X days, expected daily impressions range, and a rough reach estimate.
- If the business profile is incomplete, ask one focused question per turn to fill the gaps.
- Always end with a short next step.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in your workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("xads-consultant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

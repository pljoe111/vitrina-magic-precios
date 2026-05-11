import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://v2.alchem.is",
  "https://vitrina-magic-precios.lovable.app",
  "https://id-preview--3085c95c-c87a-4794-86bf-4e047233fd16.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow lovable preview/sandbox subdomains for the project
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com")) return true;
    if (u.hostname === "alchem.is" || u.hostname.endsWith(".alchem.is")) return true;
  } catch { /* ignore */ }
  return false;
};

const buildCors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
});

const API_BASE = "http://wapp-api.apein.space";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = buildCors(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const { phone } = await req.json();
    const digits = String(phone || "").replace(/[^0-9]/g, "");

    if (digits.length < 7) {
      return new Response(JSON.stringify({ valid: false, reason: "invalid_format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const API_TOKEN = Deno.env.get("WAPP_API_TOKEN");
    const BASIC_USER = Deno.env.get("WAPP_BASIC_USER");
    const BASIC_PASS = Deno.env.get("WAPP_BASIC_PASS");

    if (!API_TOKEN || !BASIC_USER || !BASIC_PASS) {
      console.error("WhatsApp validator not configured");
      return new Response(JSON.stringify({ valid: true, stub: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const basic = btoa(`${BASIC_USER}:${BASIC_PASS}`);
    const url = `${API_BASE}/contacts/check?phone=${encodeURIComponent(digits)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-Api-Token": API_TOKEN,
        Authorization: `Basic ${basic}`,
      },
    });

    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* keep raw */ }

    if (!res.ok) {
      console.error("WhatsApp validator failed", res.status, text);
      // Fail open so we never block leads on a 3rd party outage.
      return new Response(JSON.stringify({ valid: true, error: "validator_unavailable", status: res.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // wapp-api shape: { registered: boolean, results: [{ registered, whatsappId }] }
    const valid =
      data.registered === true ||
      (Array.isArray(data.results) && data.results.some((r: any) => r?.registered === true));

    return new Response(JSON.stringify({ valid, raw: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("validate-whatsapp error", err);
    return new Response(JSON.stringify({ valid: true, error: "internal" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

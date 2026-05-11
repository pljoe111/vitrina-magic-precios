import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_BASE = "http://wapp-api.apein.space";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

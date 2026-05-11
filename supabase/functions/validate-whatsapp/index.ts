import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const VALIDATOR_URL = Deno.env.get("WHATSAPP_VALIDATOR_URL");
    const VALIDATOR_TOKEN = Deno.env.get("WHATSAPP_VALIDATOR_TOKEN");

    // Stub: if validator not configured yet, treat all phones as valid.
    if (!VALIDATOR_URL || !VALIDATOR_TOKEN) {
      return new Response(JSON.stringify({ valid: true, stub: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = VALIDATOR_URL.includes("?")
      ? `${VALIDATOR_URL}&phone=${encodeURIComponent(digits)}`
      : `${VALIDATOR_URL}?phone=${encodeURIComponent(digits)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${VALIDATOR_TOKEN}` },
    });

    if (!res.ok) {
      console.error("WhatsApp validator failed", res.status, await res.text());
      // Fail open so we never block leads on a 3rd party outage.
      return new Response(JSON.stringify({ valid: true, error: "validator_unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json().catch(() => ({}));
    // Accept various shapes: { valid: bool } | { exists: bool } | { is_whatsapp: bool } | { status: "valid" }
    const valid =
      data.valid === true ||
      data.exists === true ||
      data.is_whatsapp === true ||
      data.status === "valid" ||
      data.result === true;

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

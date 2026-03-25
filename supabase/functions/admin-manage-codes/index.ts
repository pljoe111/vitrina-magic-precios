import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, username, password, ...params } = await req.json();

    // Validate credentials
    const ADMIN_USER = "alchem";
    const ADMIN_PASS = Deno.env.get("ADMIN_PASSWORD");

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "login":
        result = { success: true };
        break;

      case "list": {
        const { data, error } = await supabase
          .from("access_codes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { codes: data };
        break;
      }

      case "create": {
        const { code, label, expires_at } = params;
        const { data, error } = await supabase
          .from("access_codes")
          .insert({ code, label: label || null, expires_at, is_active: true })
          .select()
          .single();
        if (error) throw error;
        result = { code: data };
        break;
      }

      case "toggle_active": {
        const { id, is_active } = params;
        const { data, error } = await supabase
          .from("access_codes")
          .update({ is_active })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = { code: data };
        break;
      }

      case "update_expiry": {
        const { id, expires_at } = params;
        const { data, error } = await supabase
          .from("access_codes")
          .update({ expires_at })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = { code: data };
        break;
      }

      case "delete": {
        const { id } = params;
        const { error } = await supabase
          .from("access_codes")
          .delete()
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

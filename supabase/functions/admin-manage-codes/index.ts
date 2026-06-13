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

    const ADMIN_USER = "alchem";
    const ADMIN_PASS = Deno.env.get("ADMIN_PASSWORD");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Public (no-auth) actions
    const PUBLIC_ACTIONS = new Set(["validate_code", "sign_coa"]);

    if (!PUBLIC_ACTIONS.has(action)) {
      if (username !== ADMIN_USER || password !== ADMIN_PASS) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let result;

    switch (action) {
      case "login":
        result = { success: true };
        break;

      case "validate_code": {
        const submitted = String(params.code || "").trim();
        if (!submitted) {
          result = { valid: false };
          break;
        }
        const { data, error } = await supabase
          .from("access_codes")
          .select("code, expires_at, is_active")
          .ilike("code", submitted)
          .maybeSingle();
        if (error) throw error;
        const valid = !!(data && data.is_active && new Date(data.expires_at) > new Date());
        result = valid
          ? { valid: true, code: data!.code, expires_at: data!.expires_at }
          : { valid: false };
        break;
      }

      case "list_quotes": {
        const { data, error } = await supabase
          .from("quotes")
          .select("id, client_name, title, updated_at")
          .order("updated_at", { ascending: false });
        if (error) throw error;
        result = { quotes: data };
        break;
      }

      case "get_quote": {
        const { id } = params;
        const { data, error } = await supabase
          .from("quotes")
          .select("id, data")
          .eq("id", id)
          .single();
        if (error) throw error;
        result = { quote: data };
        break;
      }

      case "upsert_quote": {
        const { id, client_name, title, data: quoteData } = params;
        if (id) {
          const { data, error } = await supabase
            .from("quotes")
            .update({ client_name, title, data: quoteData, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select("id")
            .single();
          if (error) throw error;
          result = { id: data.id };
        } else {
          const { data, error } = await supabase
            .from("quotes")
            .insert({ client_name, title, data: quoteData })
            .select("id")
            .single();
          if (error) throw error;
          result = { id: data.id };
        }
        break;
      }

      case "delete_quote": {
        const { id } = params;
        const { error } = await supabase.from("quotes").delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

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

      case "list_leads": {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { leads: data };
        break;
      }

      case "get_setting": {
        const { key } = params;
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        if (error) throw error;
        result = { value: data?.value ?? null };
        break;
      }

      case "set_setting": {
        const { key, value } = params;
        const { data, error } = await supabase
          .from("app_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        result = { setting: data };
        break;
      }

      case "list_batches": {
        const { data, error } = await supabase
          .from("test_batches")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { batches: data };
        break;
      }

      case "create_batch": {
        const { batch } = params;
        const status = batch.coa_url ? "published" : "pending";
        const { data, error } = await supabase
          .from("test_batches")
          .insert({ ...batch, status })
          .select()
          .single();
        if (error) throw error;
        result = { batch: data };
        break;
      }

      case "update_batch": {
        const { id, patch } = params;
        const next = { ...patch };
        if (Object.prototype.hasOwnProperty.call(patch, "coa_url") && !patch.status) {
          next.status = patch.coa_url ? "published" : "pending";
        }
        const { data, error } = await supabase
          .from("test_batches")
          .update(next)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = { batch: data };
        break;
      }

      case "set_batch_status": {
        const { id, status } = params;
        const { data, error } = await supabase
          .from("test_batches")
          .update({ status })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = { batch: data };
        break;
      }

      case "delete_batch": {
        const { id } = params;
        const { error } = await supabase.from("test_batches").delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "upload_coa": {
        // admin-only (passed auth check above). params: { filename, content_base64 }
        const { filename, content_base64 } = params;
        if (!filename || !content_base64) throw new Error("filename and content_base64 are required");
        const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${safeName}`;
        const binary = Uint8Array.from(atob(content_base64), (c) => c.charCodeAt(0));
        const { error: upErr } = await supabase.storage
          .from("coa-pdfs")
          .upload(path, binary, { contentType: "application/pdf", upsert: false });
        if (upErr) throw upErr;
        result = { path };
        break;
      }

      case "sign_coa": {
        // public: anyone viewing /test-results needs a temporary signed URL
        const raw = String(params.path || "").trim();
        if (!raw) throw new Error("path required");
        // accept either a bare path or a legacy full public URL
        const path = raw.includes("/coa-pdfs/")
          ? raw.split("/coa-pdfs/").pop()!.split("?")[0]
          : raw.replace(/^\/+/, "");
        const { data, error } = await supabase.storage
          .from("coa-pdfs")
          .createSignedUrl(path, 60 * 60); // 1 hour
        if (error) throw error;
        result = { signedUrl: data.signedUrl };
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

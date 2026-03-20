import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { full_name, email, phone, whatsapp, city, country, profession, clinic_name, lead_score, lead_classification } = await req.json();

    const whatsappLine = whatsapp ? `<li><strong>WhatsApp:</strong> ${whatsapp}</li>` : '';

    const html = `
      <h2>🔔 Nuevo Lead desde Catálogo</h2>
      <p>Un nuevo profesional ha solicitado acceso al catálogo.</p>
      <h3>Clasificación: <span style="color: ${lead_classification === 'CALIENTE' ? '#e53e3e' : lead_classification === 'TIBIO' ? '#dd6b20' : '#718096'}">${lead_classification}</span> (Score: ${lead_score})</h3>
      <ul>
        <li><strong>Nombre:</strong> ${full_name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Teléfono:</strong> ${phone}</li>
        ${whatsappLine}
        <li><strong>Ciudad:</strong> ${city}, ${country}</li>
        <li><strong>Profesión:</strong> ${profession}</li>
        ${clinic_name ? `<li><strong>Clínica:</strong> ${clinic_name}</li>` : ''}
      </ul>
      ${whatsapp ? `<p><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}">📱 Contactar por WhatsApp</a></p>` : ''}
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Alchem Leads <onboarding@resend.dev>',
        to: ['leads@alchem.mx'],
        subject: `[${lead_classification}] Nuevo lead: ${full_name}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending lead notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

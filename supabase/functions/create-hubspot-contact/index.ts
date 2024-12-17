import { serve } from "https://deno.fresh.run/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone } = await req.json();
    console.log("Received contact data:", { name, email, phone });

    // Create HubSpot contact
    const hubspotData = {
      properties: {
        firstname: name,
        email: email,
        phone: phone,
        lifecyclestage: "lead",
        lead_source: "Website Form",
      },
    };

    const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("HUBSPOT_API_KEY")}`,
      },
      body: JSON.stringify(hubspotData),
    });

    if (!hubspotResponse.ok) {
      console.error("HubSpot API error:", await hubspotResponse.text());
      throw new Error("Failed to create contact in HubSpot");
    }

    const result = await hubspotResponse.json();
    console.log("HubSpot contact created:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
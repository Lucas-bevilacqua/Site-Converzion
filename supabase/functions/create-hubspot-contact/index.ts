import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY");
    if (!hubspotApiKey) {
      console.error("HUBSPOT_API_KEY not found in environment variables");
      throw new Error("HubSpot API key not configured");
    }

    // Create HubSpot contact with only standard properties
    const hubspotData = {
      properties: {
        firstname: name,
        email: email,
        phone: phone,
        lifecyclestage: "lead"
      },
    };

    console.log("Sending request to HubSpot API with data:", hubspotData);
    const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify(hubspotData),
    });

    const responseText = await hubspotResponse.text();
    console.log("HubSpot API response status:", hubspotResponse.status);
    console.log("HubSpot API response:", responseText);

    if (!hubspotResponse.ok) {
      throw new Error(`HubSpot API error: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log("HubSpot contact created successfully:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-hubspot-contact function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
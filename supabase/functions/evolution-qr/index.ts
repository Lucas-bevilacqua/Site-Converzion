import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting QR code generation process...')
    
    const { empresa_id } = await req.json()
    
    if (!empresa_id) {
      console.error('No empresa_id provided')
      return new Response(
        JSON.stringify({ error: 'empresa_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Fetching empresa data for ID: ${empresa_id}`)
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Fetch empresa data
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('url_instance, apikeyevo')
      .eq('id', empresa_id)
      .single()

    if (empresaError) {
      console.error('Error fetching empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo) {
      console.error('Missing Evolution credentials for empresa:', empresa_id)
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Making request to Evolution API...')
    
    // Make request to Evolution API
    const evolutionResponse = await fetch(`${empresa.url_instance}/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empresa.apikeyevo}`
      }
    })

    // First try to get the response as text
    const responseText = await evolutionResponse.text()
    console.log('Raw Evolution API response:', responseText)

    let qrData
    try {
      qrData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Evolution API response:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Resposta inválida da API do Evolution',
          details: responseText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!evolutionResponse.ok || !qrData.qrcode) {
      console.error('Error or missing QR code in Evolution API response:', qrData)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao gerar QR code no Evolution',
          details: qrData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully received QR code from Evolution')

    // Update empresa with QR code
    const { error: updateError } = await supabaseClient
      .from('Empresas')
      .update({ 
        qr_code_url: qrData.qrcode,
        is_connected: false
      })
      .eq('id', empresa_id)

    if (updateError) {
      console.error('Error updating empresa with QR code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully updated empresa with QR code')
    
    return new Response(
      JSON.stringify({ success: true, qr_code: qrData.qrcode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in evolution-qr function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
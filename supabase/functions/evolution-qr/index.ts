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
    
    const { empresaId } = await req.json()
    
    if (!empresaId) {
      console.error('No empresaId provided')
      return new Response(
        JSON.stringify({ error: 'empresaId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Fetching empresa data for ID: ${empresaId}`)
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Fetch empresa data
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .select('url_instance, apikeyevo')
      .eq('id', empresaId)
      .single()

    if (empresaError) {
      console.error('Error fetching empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo) {
      console.error('Missing Evolution credentials for empresa:', empresaId)
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

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text()
      console.error('Error from Evolution API:', errorText)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar QR code no Evolution' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const qrData = await evolutionResponse.json()
    console.log('Successfully received QR code from Evolution')

    // Update empresa with QR code
    const { error: updateError } = await supabaseClient
      .from('empresas')
      .update({ 
        qr_code_url: qrData.qrcode,
        is_connected: false
      })
      .eq('id', empresaId)

    if (updateError) {
      console.error('Error updating empresa with QR code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully updated empresa with QR code')
    
    return new Response(
      JSON.stringify({ success: true, qrcode: qrData.qrcode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in evolution-qr function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
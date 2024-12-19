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
      .select('url_instance, apikeyevo, is_connected')
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

    // First check if instance is already connected
    if (empresa.is_connected) {
      console.log('Checking instance connection state...')
      const stateUrl = `${empresa.url_instance}/instance/connectionState`
      
      try {
        const stateResponse = await fetch(stateUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': empresa.apikeyevo
          }
        })

        if (!stateResponse.ok) {
          throw new Error(`Failed to get connection state: ${stateResponse.statusText}`)
        }

        const stateData = await stateResponse.json()
        console.log('Connection state response:', stateData)
        
        // According to Evolution API docs, state can be 'open' or 'connected'
        if (stateData.state === 'open' || stateData.state === 'connected') {
          console.log('Instance is already connected')
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Instância já está conectada',
              is_connected: true 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (error) {
        console.log('Error checking connection state:', error)
        // Continue to QR code generation if state check fails
      }
    }

    console.log('Making request to Evolution API for new QR code...')
    
    // Generate new QR code using the /instance/connect endpoint
    const connectUrl = `${empresa.url_instance}/instance/connect`
    console.log('Evolution API connect URL:', connectUrl)
    
    const connectResponse = await fetch(connectUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!connectResponse.ok) {
      console.error('Error response from Evolution API:', await connectResponse.text())
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao conectar com o Evolution API',
          details: connectResponse.statusText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const qrData = await connectResponse.json()
    console.log('QR code generation response:', qrData)

    if (!qrData.code) {
      console.error('Missing QR code in Evolution API response:', qrData)
      return new Response(
        JSON.stringify({ 
          error: 'QR code não encontrado na resposta',
          details: qrData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update empresa with QR code and set connection status to false
    const { error: updateError } = await supabaseClient
      .from('Empresas')
      .update({ 
        qr_code_url: qrData.code,
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

    console.log('Successfully generated and saved QR code')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_code: qrData.code,
        message: 'QR code gerado com sucesso'
      }),
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
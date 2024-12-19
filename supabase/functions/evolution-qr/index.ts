import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('url_instance, apikeyevo')
      .eq('id', empresa_id)
      .single()

    if (empresaError || !empresa) {
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
    console.log('Evolution API URL:', empresa.url_instance)

    // Primeiro verificar o estado da conexão
    const stateUrl = `${empresa.url_instance}/instance/connectionState`
    console.log('Checking connection state at:', stateUrl)
    
    try {
      const stateResponse = await fetch(stateUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        }
      })

      if (!stateResponse.ok) {
        const errorText = await stateResponse.text()
        console.error('Error response from Evolution API:', errorText)
        throw new Error(`Evolution API returned ${stateResponse.status}: ${errorText}`)
      }

      const stateData = await stateResponse.json()
      console.log('Connection state response:', stateData)
      
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

    // Gerar novo QR code
    const connectUrl = `${empresa.url_instance}/instance/connect`
    console.log('Requesting QR code at:', connectUrl)
    
    const connectResponse = await fetch(connectUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text()
      console.error('Error response from Evolution API:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao conectar com o Evolution API',
          details: errorText
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

    // Atualizar empresa com o QR code
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
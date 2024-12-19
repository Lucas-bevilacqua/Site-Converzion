import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { empresa_id } = await req.json()
    console.log('Fetching empresa data for ID:', empresa_id)

    // Get empresa data
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('*')
      .eq('id', empresa_id)
      .single()

    if (empresaError || !empresa) {
      console.error('Error fetching empresa:', empresaError)
      throw new Error('Empresa não encontrada')
    }

    const baseUrl = empresa.url_instance?.replace(/\/$/, '') // Remove trailing slash if present
    const apiKey = empresa.apikeyevo

    if (!baseUrl || !apiKey) {
      throw new Error('URL da instância ou API key não configuradas')
    }

    console.log('Checking instance state...')
    
    // Check instance state first
    const stateResponse = await fetch(`${baseUrl}/instance/connectionState`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      }
    })

    if (!stateResponse.ok) {
      console.error('Error checking instance state:', await stateResponse.text())
      throw new Error('Erro ao verificar estado da instância')
    }

    const stateData = await stateResponse.json()
    console.log('Instance state:', stateData)

    // If already connected, return success
    if (stateData.state === 'open' || stateData.state === 'connected') {
      console.log('Instance is already connected')
      
      // Update empresa status to connected
      await supabaseClient
        .from('Empresas')
        .update({ 
          is_connected: true,
          qr_code_url: null // Clear QR code since we're connected
        })
        .eq('id', empresa_id)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Instance already connected',
          connected: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Requesting new QR code...')
    
    // Request new QR code
    const connectResponse = await fetch(`${baseUrl}/instance/connect`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      }
    })

    if (!connectResponse.ok) {
      console.error('Error connecting instance:', await connectResponse.text())
      throw new Error('Erro ao conectar instância')
    }

    const connectData = await connectResponse.json()
    console.log('Connect response:', connectData)

    if (!connectData.code) {
      throw new Error('QR Code não retornado pela API')
    }

    // Update empresa with QR code
    const { error: updateError } = await supabaseClient
      .from('Empresas')
      .update({ 
        qr_code_url: connectData.code,
        is_connected: false 
      })
      .eq('id', empresa_id)

    if (updateError) {
      console.error('Error updating empresa:', updateError)
      throw new Error('Erro ao salvar QR code')
    }

    return new Response(
      JSON.stringify({
        success: true,
        qr_code: connectData.code
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in evolution-qr function:', error)
    return new Response(
      JSON.stringify({
        error: 'Erro ao conectar com o Evolution API',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
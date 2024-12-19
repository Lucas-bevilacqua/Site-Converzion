import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email não fornecido')
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    
    // Get empresa data for the specific email
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('url_instance, instance_name, apikeyevo')
      .eq('emailempresa', email)
      .single()

    if (empresaError || !empresa) {
      console.error('Erro ao buscar dados da empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo || !empresa.instance_name) {
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL to ensure it's just the base URL without any trailing paths
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/$/, '')
    console.log('URL base da instância:', baseUrl)

    // Generate QR code using the provided structure
    const qrResponse = await fetch(`${baseUrl}/instance/qr/${empresa.instance_name}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!qrResponse.ok) {
      console.error('Erro na resposta do Evolution:', await qrResponse.text())
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const qrData = await qrResponse.json()
    console.log('QR code gerado com sucesso')

    // Update QR code URL in database
    const { error: updateError } = await supabaseClient
      .from('Empresas')
      .update({ qr_code_url: qrData.qr })
      .eq('emailempresa', email)

    if (updateError) {
      console.error('Erro ao atualizar QR code:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        qr: qrData.qr
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
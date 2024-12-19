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
      .select('url_instance, apikeyevo')
      .eq('emailempresa', 'lucas.bevilacqua@idealtrends.com.br')
      .single()

    if (empresaError || !empresa) {
      console.error('Erro ao buscar dados da empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo) {
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL to ensure it's just the base URL without any trailing paths
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/$/, '')
    console.log('URL base da instância:', baseUrl)

    // Check instance status using the provided structure
    const statusResponse = await fetch(`${baseUrl}/instance/connectionState/instance1`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!statusResponse.ok) {
      console.error('Erro na resposta do Evolution:', await statusResponse.text())
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const statusData = await statusResponse.json()
    console.log('Status data:', statusData)

    // Update connection status in database
    const isConnected = statusData.state === 'open'
    const { error: updateError } = await supabaseClient
      .from('Empresas')
      .update({ is_connected: isConnected })
      .eq('emailempresa', 'lucas.bevilacqua@idealtrends.com.br')

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isConnected,
        state: statusData.state 
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
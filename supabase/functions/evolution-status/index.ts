import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      console.error('❌ Email não fornecido')
      return new Response(
        JSON.stringify({ error: 'Email não fornecido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Get empresa data with Evolution credentials
    console.log('🔍 Buscando dados da empresa:', email)
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('Empresas')
      .select('url_instance, instance_name, apikeyevo')
      .eq('emailempresa', email)
      .maybeSingle()

    if (empresaError) {
      console.error('❌ Erro ao buscar empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar dados da empresa', details: empresaError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Validate Evolution credentials
    if (!empresa?.url_instance || !empresa?.apikeyevo || !empresa?.instance_name) {
      console.log('⚠️ Credenciais do Evolution não configuradas')
      return new Response(
        JSON.stringify({ 
          error: 'Credenciais do Evolution não configuradas',
          needsSetup: true,
          details: {
            hasUrl: !!empresa?.url_instance,
            hasApiKey: !!empresa?.apikeyevo,
            hasInstanceName: !!empresa?.instance_name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL and instance name
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/+$/, '')
    const instanceName = encodeURIComponent(empresa.instance_name.trim())
    
    console.log('🌐 Verificando status na URL:', `${baseUrl}/instance/connectionState/${instanceName}`)

    // Check Evolution connection status
    const statusResponse = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('❌ Erro na resposta do Evolution:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao verificar status do Evolution',
          details: errorText,
          needsSetup: statusResponse.status === 404
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusResponse.status }
      )
    }

    const statusData = await statusResponse.json()
    console.log('✅ Status do Evolution:', statusData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        isConnected: statusData.state === 'open',
        state: statusData.state
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
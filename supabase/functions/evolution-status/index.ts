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

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Get empresa data
    console.log('🔍 Buscando dados da empresa:', email)
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('url_instance, instance_name, apikeyevo')
      .eq('emailempresa', email)
      .single()

    if (empresaError || !empresa) {
      console.error('❌ Erro ao buscar empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo || !empresa.instance_name) {
      console.error('❌ Credenciais da Evolution incompletas')
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas', needsSetup: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL and instance name
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/+$/, '')
    // Garantir que o nome da instância seja codificado corretamente para URL
    const instanceName = encodeURIComponent(empresa.instance_name.trim())
    
    console.log('🌐 Verificando status da instância:', instanceName)

    try {
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
        
        // If instance doesn't exist, mark as needing setup
        const needsSetup = statusResponse.status === 404
        
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao verificar status do Evolution',
            details: errorText,
            needsSetup
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
      console.error('❌ Erro ao verificar status:', error)
      return new Response(
        JSON.stringify({ error: `Erro ao verificar status: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
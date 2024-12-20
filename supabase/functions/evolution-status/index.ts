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
      .select('url_instance, instance_name, apikeyevo, is_connected')
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
        JSON.stringify({ 
          error: 'Credenciais do Evolution não configuradas',
          needsSetup: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL and instance name
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/+$/, '')
    const instanceName = empresa.instance_name.trim().replace(/\s+/g, '_')
    
    console.log('🌐 Verificando status da instância:', instanceName)
    console.log('🔑 Usando API Key:', empresa.apikeyevo)

    try {
      // First, try to create the instance if it doesn't exist
      const createResponse = await fetch(`${baseUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        },
        body: JSON.stringify({
          instanceName: instanceName,
          webhook: null,
          events: false
        })
      })

      console.log('📡 Create instance response:', createResponse.status)
      
      // Now check the connection state
      const statusResponse = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        }
      })

      const responseText = await statusResponse.text()
      console.log('📡 Status response:', statusResponse.status)
      console.log('📡 Response text:', responseText)

      if (!statusResponse.ok) {
        let needsSetup = false
        
        try {
          const errorData = JSON.parse(responseText)
          if (errorData.response?.message?.[0]?.includes('instance does not exist')) {
            needsSetup = true
          }
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta:', parseError)
        }

        // Update connection status to false since there was an error
        await supabaseClient
          .from('Empresas')
          .update({ is_connected: false })
          .eq('emailempresa', email)

        return new Response(
          JSON.stringify({
            error: 'Erro ao verificar status do Evolution',
            details: JSON.stringify({
              status: statusResponse.status,
              error: statusResponse.statusText,
              response: responseText ? JSON.parse(responseText) : null
            }),
            needsSetup,
            requestUrl: `${baseUrl}/instance/connectionState/${instanceName}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusResponse.status }
        )
      }

      const statusData = JSON.parse(responseText)
      console.log('✅ Status verificado com sucesso:', statusData)

      // Update connection status in database
      const { error: updateError } = await supabaseClient
        .from('Empresas')
        .update({ is_connected: statusData.state === 'open' })
        .eq('emailempresa', email)

      if (updateError) {
        console.error('❌ Erro ao atualizar status de conexão:', updateError)
      }

      return new Response(
        JSON.stringify({
          ...statusData,
          isConnected: statusData.state === 'open',
          needsSetup: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
      return new Response(
        JSON.stringify({ 
          error: `Erro ao verificar status: ${error.message}`,
          needsSetup: true 
        }),
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
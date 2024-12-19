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
      console.error('Email não fornecido')
      return new Response(
        JSON.stringify({ error: 'Email não fornecido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Get empresa data
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('url_instance, instance_name, apikeyevo')
      .eq('emailempresa', email)
      .single()

    if (empresaError || !empresa) {
      console.error('Erro ao buscar empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!empresa.url_instance || !empresa.apikeyevo || !empresa.instance_name) {
      console.error('Credenciais da Evolution incompletas')
      return new Response(
        JSON.stringify({ 
          error: 'Credenciais do Evolution não configuradas',
          needsSetup: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/+$/, '')
    console.log('URL base da instância:', baseUrl)

    try {
      // Requisição 1: Verifica status da instância
      console.log('Verificando status da instância:', empresa.instance_name)
      const statusResponse = await fetch(`${baseUrl}/instance/connectionState/${empresa.instance_name}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        }
      })

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('Erro na resposta do Evolution:', errorText)
        
        if (statusResponse.status === 404) {
          return new Response(
            JSON.stringify({ error: 'Instância não encontrada', needsSetup: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }
        
        throw new Error(`Evolution API returned ${statusResponse.status}: ${errorText}`)
      }

      const statusData = await statusResponse.json()
      console.log('Status data:', statusData)

      // Update connection status in database
      const isConnected = statusData.state === 'open'
      const { error: updateError } = await supabaseClient
        .from('Empresas')
        .update({ is_connected: isConnected })
        .eq('emailempresa', email)

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isConnected,
          state: statusData.state,
          instanceExists: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Erro ao verificar status:', error)
      return new Response(
        JSON.stringify({ error: `Erro ao verificar status: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
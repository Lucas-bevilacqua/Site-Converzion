import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { instance_url } = await req.json()
    
    if (!instance_url) {
      throw new Error('URL da instância não fornecida')
    }

    console.log('🔄 Verificando estado da conexão...')
    const stateResponse = await fetch(`${instance_url}/instance/connectionState`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'SUA_EVOLUTION_API_KEY', // Substitua pela sua chave API se necessário
      },
    })

    const stateData = await stateResponse.json()
    console.log('📱 Estado da conexão:', stateData)

    if (stateData.state === 'open') {
      return new Response(
        JSON.stringify({ message: 'Instance already connected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Iniciando nova conexão...')
    const connectResponse = await fetch(`${instance_url}/instance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'SUA_EVOLUTION_API_KEY', // Substitua pela sua chave API se necessário
      },
      body: JSON.stringify({
        instanceName: "instance1",
        webhook: null,
        webhookByEvents: false,
        events: [],
        qrcode: true,
        number: null,
        token: null,
        client: "evolution_v2",
        version: "2.2.0"
      })
    })

    if (!connectResponse.ok) {
      const errorData = await connectResponse.json()
      console.error('❌ Erro na conexão:', errorData)
      throw new Error(`Erro ao conectar com o Evolution API: ${JSON.stringify(errorData)}`)
    }

    const data = await connectResponse.json()
    console.log('✅ Resposta da conexão:', data)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
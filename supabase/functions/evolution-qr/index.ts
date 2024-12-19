import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
      console.error('URL da instância não fornecida')
      return new Response(
        JSON.stringify({ error: 'URL da instância não fornecida' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First create the instance
    console.log('🔄 Criando nova instância...')
    const createInstanceResponse = await fetch(`${instance_url}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: "instance1",
        webhook: null,
        webhookByEvents: false,
        events: [],
        qrcode: true,
        number: null,
        token: null,
        // Added required parameters from Evolution API v2.2.0
        isLatest: true,
        waitQrCode: true,
        license: "free",
        connectionType: "whatsapp-baileys"
      })
    })

    if (!createInstanceResponse.ok) {
      const errorData = await createInstanceResponse.json()
      console.error('❌ Erro ao criar instância:', errorData)
      throw new Error(`Erro ao criar instância: ${JSON.stringify(errorData)}`)
    }

    const createData = await createInstanceResponse.json()
    console.log('✅ Instância criada:', createData)

    // Then connect the instance to get the QR code
    console.log('🔄 Conectando instância...')
    const connectResponse = await fetch(`${instance_url}/instance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: "instance1",
        webhook: null,
        webhookByEvents: false,
        events: [],
        qrcode: true,
        number: null,
        token: null,
        // Added required parameters from Evolution API v2.2.0
        client: "evolution_v2",
        version: "2.2.0",
        waitQrCode: true,
        license: "free",
        connectionType: "whatsapp-baileys"
      })
    })

    if (!connectResponse.ok) {
      const errorData = await connectResponse.json()
      console.error('❌ Erro ao conectar instância:', errorData)
      throw new Error(`Erro ao conectar instância: ${JSON.stringify(errorData)}`)
    }

    const connectData = await connectResponse.json()
    console.log('✅ Instância conectada:', connectData)

    return new Response(
      JSON.stringify(connectData),
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
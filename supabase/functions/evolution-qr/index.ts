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
    const { instance_url, empresa_id } = await req.json()
    
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

    // Get the API key from the database for this empresa
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('Empresas')
      .select('apikeyevo')
      .eq('id', empresa_id)
      .single()

    if (empresaError || !empresa?.apikeyevo) {
      console.error('API key not found for empresa:', empresaError)
      throw new Error('API key not found for empresa')
    }

    // Clean up the URL to ensure it's just the base URL without any trailing paths
    const baseUrl = instance_url.split('/message')[0].replace(/\/$/, '')
    console.log('URL base da instância:', baseUrl)
    
    // Create instance with updated parameters according to v2.2 docs
    console.log('🔄 Criando nova instância...')
    const createInstanceResponse = await fetch(`${baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      },
      body: JSON.stringify({
        instanceName: "instance1",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        token: empresa.apikeyevo
      })
    })

    const createData = await createInstanceResponse.json()
    console.log('Create instance response:', createData)

    if (!createInstanceResponse.ok) {
      console.error('❌ Erro ao criar instância:', createData)
      throw new Error(`Erro ao criar instância: ${JSON.stringify(createData)}`)
    }

    console.log('✅ Instância criada:', createData)

    // Connect instance to get QR code
    console.log('🔄 Conectando instância para gerar QR code...')
    const connectResponse = await fetch(`${baseUrl}/instance/connect/instance1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': empresa.apikeyevo
      }
    })

    if (!connectResponse.ok) {
      const errorData = await connectResponse.json()
      console.error('❌ Erro ao conectar instância:', errorData)
      throw new Error(`Erro ao conectar instância: ${JSON.stringify(errorData)}`)
    }

    const connectData = await connectResponse.json()
    console.log('✅ Instância conectada, QR code gerado:', connectData)

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
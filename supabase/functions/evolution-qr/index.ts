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
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean up the URL - remove any trailing /message or other paths
    const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/+$/, '')
    console.log('URL base da instância:', baseUrl)

    try {
      // Requisição 1: Verifica se a instância existe
      console.log('Verificando se a instância existe:', empresa.instance_name)
      const statusResponse = await fetch(`${baseUrl}/instance/info/${empresa.instance_name}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        }
      })

      // Se a instância não existir, cria uma nova
      if (statusResponse.status === 404) {
        console.log('Instância não existe, criando nova...')
        
        // Requisição 2: Cria nova instância
        const createResponse = await fetch(`${baseUrl}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': empresa.apikeyevo
          },
          body: JSON.stringify({
            instanceName: empresa.instance_name
          })
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('Erro ao criar instância:', errorText)
          throw new Error(`Erro ao criar instância: ${errorText}`)
        }
      }

      // Requisição 3: Gera QR code
      console.log('Gerando QR code para instância:', empresa.instance_name)
      const qrResponse = await fetch(`${baseUrl}/instance/qrcode/${empresa.instance_name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': empresa.apikeyevo
        }
      })

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text()
        console.error('Erro ao gerar QR code:', errorText)
        throw new Error(`Evolution API returned ${qrResponse.status}: ${errorText}`)
      }

      const qrData = await qrResponse.json()
      console.log('QR code gerado com sucesso')

      // Update QR code URL in database
      const { error: updateError } = await supabaseClient
        .from('Empresas')
        .update({ qr_code_url: qrData.qrcode.base64 })
        .eq('emailempresa', email)

      if (updateError) {
        console.error('Erro ao atualizar QR code:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          qr: qrData.qrcode.base64
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Erro ao gerar QR code:', error)
      return new Response(
        JSON.stringify({ error: `Erro ao gerar QR code: ${error.message}` }),
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
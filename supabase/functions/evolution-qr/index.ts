import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { empresaId } = await req.json()
    
    // Buscar a URL da instância e API key do Evolution no banco
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('url_instance, apikeyevo')
      .eq('id', empresaId)
      .single()

    if (empresaError || !empresa) {
      console.error('Erro ao buscar dados da empresa:', empresaError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Verificar se temos as credenciais necessárias
    if (!empresa.url_instance || !empresa.apikeyevo) {
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Fazer requisição para a API do Evolution para gerar QR code
    const evolutionResponse = await fetch(`${empresa.url_instance}/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empresa.apikeyevo}`
      }
    })

    if (!evolutionResponse.ok) {
      console.error('Erro na resposta do Evolution:', await evolutionResponse.text())
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const qrData = await evolutionResponse.json()

    // Atualizar o QR code no banco
    const { error: updateError } = await supabase
      .from('empresas')
      .update({ 
        qr_code_url: qrData.qrcode,
        is_connected: false
      })
      .eq('id', empresaId)

    if (updateError) {
      console.error('Erro ao atualizar QR code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, qrcode: qrData.qrcode }),
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
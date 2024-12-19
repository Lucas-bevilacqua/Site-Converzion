import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { empresaId } = await req.json()
    
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

    if (!empresa.url_instance || !empresa.apikeyevo) {
      return new Response(
        JSON.stringify({ error: 'Credenciais do Evolution não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verificar status da conexão no Evolution
    const evolutionResponse = await fetch(`${empresa.url_instance}/status`, {
      headers: {
        'Authorization': `Bearer ${empresa.apikeyevo}`
      }
    })

    if (!evolutionResponse.ok) {
      console.error('Erro na resposta do Evolution:', await evolutionResponse.text())
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const statusData = await evolutionResponse.json()
    const isConnected = statusData.status === 'CONNECTED'

    // Atualizar status no banco
    const { error: updateError } = await supabase
      .from('empresas')
      .update({ is_connected: isConnected })
      .eq('id', empresaId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
    }

    return new Response(
      JSON.stringify({ success: true, isConnected }),
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
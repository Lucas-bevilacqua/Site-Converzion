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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, empresaId, prompt } = await req.json()

    if (!empresaId) {
      throw new Error('empresaId is required')
    }

    // Buscar as configurações da empresa
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .select('dify_api_key, dify_endpoint')
      .eq('id', empresaId)
      .single()

    if (empresaError || !empresa) {
      throw new Error('Empresa não encontrada ou erro ao buscar configurações')
    }

    const { dify_api_key, dify_endpoint } = empresa

    if (!dify_api_key || !dify_endpoint) {
      throw new Error('Configurações do Dify não encontradas para esta empresa')
    }

    switch (action) {
      case 'update':
        console.log('Atualizando prompt para empresa:', empresaId)
        console.log('Novo prompt:', prompt)
        
        // Atualizar o prompt usando as credenciais específicas da empresa
        const response = await fetch(`${dify_endpoint}/prompts`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${dify_api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        })

        if (!response.ok) {
          console.error('Erro ao atualizar prompt no Dify:', await response.text())
          throw new Error('Falha ao atualizar o prompt no Dify')
        }

        console.log('Prompt atualizado com sucesso no Dify')

        // Atualizar o prompt no banco de dados
        const { error: updateError } = await supabaseClient
          .from('empresas')
          .update({ prompt })
          .eq('id', empresaId)

        if (updateError) {
          console.error('Erro ao atualizar prompt no banco:', updateError)
          throw updateError
        }

        console.log('Prompt atualizado com sucesso no banco de dados')
        break

      default:
        throw new Error('Ação inválida')
    }

    return new Response(
      JSON.stringify({ message: 'Operação realizada com sucesso' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro na operação:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
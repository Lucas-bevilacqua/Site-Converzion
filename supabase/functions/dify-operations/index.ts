import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DifyRequestBody {
  action: 'create' | 'update'
  empresaId?: number
  prompt?: string
  name?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { action, empresaId, prompt, name } = await req.json() as DifyRequestBody

    // Obter a API key do Dify do ambiente
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    if (!difyApiKey) {
      throw new Error('Missing DIFY API key')
    }

    if (action === 'create') {
      // Criar novo agente no Dify
      const response = await fetch('https://api.dify.ai/v1/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Novo Agente IA',
          mode: 'completion',
          model: {
            provider: 'openai',
            name: 'gpt-3.5-turbo',
            mode: 'chat'
          },
          prompt: prompt || 'Você é um assistente prestativo.',
        })
      })

      const difyResponse = await response.json()
      console.log('Dify create response:', difyResponse)

      if (!response.ok) {
        throw new Error(`Failed to create Dify agent: ${difyResponse.message}`)
      }

      // Atualizar a empresa com a API key do novo agente
      if (empresaId) {
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ 'API Dify': difyResponse.api_key_id })
          .eq('id', empresaId)

        if (updateError) {
          throw updateError
        }
      }

      return new Response(JSON.stringify(difyResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update' && empresaId) {
      // Primeiro, buscar a API key do Dify da empresa
      const { data: empresa, error: fetchError } = await supabase
        .from('empresas')
        .select('API Dify')
        .eq('id', empresaId)
        .single()

      if (fetchError || !empresa['API Dify']) {
        throw new Error('Failed to fetch Dify API key for empresa')
      }

      // Atualizar o prompt do agente no Dify
      const response = await fetch(`https://api.dify.ai/v1/applications/${empresa['API Dify']}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        })
      })

      const difyResponse = await response.json()
      console.log('Dify update response:', difyResponse)

      if (!response.ok) {
        throw new Error(`Failed to update Dify agent: ${difyResponse.message}`)
      }

      // Atualizar o prompt na tabela de empresas
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ prompt: prompt })
        .eq('id', empresaId)

      if (updateError) {
        throw updateError
      }

      return new Response(JSON.stringify(difyResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
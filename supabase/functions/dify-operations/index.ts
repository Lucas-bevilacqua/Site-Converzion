import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const DIFY_API_BASE_URL = "https://api.dify.ai/v1"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, empresaId, prompt } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'create') {
      console.log('Creating new Dify agent...')
      
      // Create new agent logic here
      const response = await fetch(`${DIFY_API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('DIFY_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Agent ${empresaId}`,
          mode: 'completion',
          opening_statement: prompt || "Hello! How can I help you today?"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error creating Dify agent:', error)
        throw new Error(`Failed to create Dify agent: ${error.message}`)
      }

      const data = await response.json()
      
      // Update empresa with Dify API key
      const { error: updateError } = await supabaseClient
        .from('empresas')
        .update({ 'API Dify': data.api_key })
        .eq('id', empresaId)

      if (updateError) {
        console.error('Error updating empresa:', updateError)
        throw updateError
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'update') {
      console.log('Updating Dify agent prompt...')
      
      // Get empresa Dify API key
      const { data: empresa, error: fetchError } = await supabaseClient
        .from('empresas')
        .select('API Dify')
        .eq('id', empresaId)
        .single()

      if (fetchError || !empresa) {
        console.error('Error fetching empresa:', fetchError)
        throw new Error('Empresa not found')
      }

      // Update agent prompt
      const response = await fetch(`${DIFY_API_BASE_URL}/parameters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${empresa['API Dify']}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opening_statement: prompt
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error updating Dify prompt:', error)
        throw new Error(`Failed to update Dify prompt: ${error.message}`)
      }

      // Update prompt in database
      const { error: updateError } = await supabaseClient
        .from('empresas')
        .update({ prompt })
        .eq('id', empresaId)

      if (updateError) {
        console.error('Error updating prompt in database:', updateError)
        throw updateError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Error in dify-operations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
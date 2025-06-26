
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { chatId, isTyping } = await req.json()
    
    console.log('Received typing status request:', { chatId, isTyping })
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get API key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      throw new Error('No API key provided')
    }

    // Verify API key and get woman
    const { data: apiKeyData, error: apiKeyError } = await supabaseClient
      .from('women_api_keys')
      .select('woman_id, active')
      .eq('api_key', apiKey)
      .eq('active', true)
      .single()

    if (apiKeyError || !apiKeyData) {
      throw new Error('Invalid API key')
    }

    const womanId = apiKeyData.woman_id

    // Update last_used_at for the API key
    await supabaseClient
      .from('women_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey)

    // Verify chat exists and belongs to the woman
    const { data: chat, error: chatError } = await supabaseClient
      .from('chats')
      .select('id, woman_id')
      .eq('id', chatId)
      .eq('woman_id', womanId)
      .single()

    if (chatError || !chat) {
      throw new Error('Chat not found or access denied')
    }

    // Send typing status via real-time channel
    const channel = supabaseClient.channel(`typing-${chatId}`)
    
    if (isTyping) {
      await channel.send({
        type: 'broadcast',
        event: 'typing_start',
        payload: { chatId, womanId }
      })
      console.log('Typing started for chat:', chatId)
    } else {
      await channel.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { chatId, womanId }
      })
      console.log('Typing stopped for chat:', chatId)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Typing status ${isTyping ? 'started' : 'stopped'} for chat ${chatId}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

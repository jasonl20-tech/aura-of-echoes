
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
    const { chatId, content, womanId } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user has subscription to this woman
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('woman_id', womanId)
      .eq('active', true)
      .single()

    if (!subscription) {
      throw new Error('No active subscription found')
    }

    // Insert user message
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_type: 'user',
        content: content
      })

    if (messageError) {
      throw messageError
    }

    // Get woman's webhook URL
    const { data: woman, error: womanError } = await supabaseClient
      .from('women')
      .select('webhook_url, name, personality')
      .eq('id', womanId)
      .single()

    if (womanError || !woman) {
      throw new Error('Woman not found')
    }

    // Send message to woman's AI API
    try {
      const aiResponse = await fetch(woman.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          character: {
            name: woman.name,
            personality: woman.personality
          },
          user_id: user.id
        })
      })

      if (!aiResponse.ok) {
        throw new Error('AI API request failed')
      }

      const aiData = await aiResponse.json()
      const aiMessage = aiData.response || 'Entschuldigung, ich kann gerade nicht antworten.'

      // Insert AI response
      const { error: aiMessageError } = await supabaseClient
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_type: 'ai',
          content: aiMessage
        })

      if (aiMessageError) {
        throw aiMessageError
      }

      return new Response(
        JSON.stringify({ success: true, aiMessage }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (aiError) {
      console.error('AI API Error:', aiError)
      
      // Insert fallback message
      const fallbackMessage = 'Entschuldigung, ich bin gerade nicht verfügbar. Versuchen Sie es später erneut.'
      
      await supabaseClient
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_type: 'ai',
          content: fallbackMessage
        })

      return new Response(
        JSON.stringify({ success: true, aiMessage: fallbackMessage }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

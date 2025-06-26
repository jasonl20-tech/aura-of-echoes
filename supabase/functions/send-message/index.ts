

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
    const { chatId, content, womanId, audioData, audioType } = await req.json()
    
    console.log('Received request:', { chatId, womanId, hasContent: !!content, hasAudio: !!audioData })
    
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

    console.log('Checking access for user:', user.id, 'woman:', womanId)

    // Check subscription or free access
    const { data: hasAccess, error: accessError } = await supabaseClient.rpc('has_subscription_or_free_access', {
      user_id: user.id,
      woman_id: womanId
    })

    if (accessError) {
      console.error('Error checking access:', accessError)
      throw new Error('Failed to check access permissions')
    }

    if (!hasAccess) {
      console.log('No active subscription or free access found for user:', user.id, 'woman:', womanId)
      throw new Error('No active subscription or free access found')
    }

    console.log('Access confirmed for user:', user.id, 'woman:', womanId)

    // Determine message type and content
    const messageType = audioData ? 'audio' : 'text'
    const messageContent = audioData ? '[Audio-Nachricht]' : content

    console.log('Inserting message:', { type: messageType, content: messageContent })

    // Insert user message with correct message_type
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_type: 'user',
        content: messageContent,
        message_type: messageType
      })

    if (messageError) {
      console.error('Error inserting message:', messageError)
      throw messageError
    }

    console.log('Message inserted successfully, type:', messageType)

    // Get woman's webhook URL
    const { data: woman, error: womanError } = await supabaseClient
      .from('women')
      .select('webhook_url, name, personality')
      .eq('id', womanId)
      .single()

    if (womanError || !woman) {
      console.error('Error getting woman data:', womanError)
      throw new Error('Woman not found')
    }

    console.log('Calling webhook for woman:', woman.name, 'URL:', woman.webhook_url)

    // Send message to woman's AI API
    try {
      console.log('Starting webhook request...')
      
      let webhookResponse;
      
      if (audioData) {
        // For audio messages, send as binary data with multipart/form-data
        console.log('Preparing binary audio webhook payload')
        
        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
        
        // Create FormData for multipart upload
        const formData = new FormData();
        const audioBlob = new Blob([binaryData], { type: audioType || 'audio/webm;codecs=opus' });
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('chatId', chatId);
        formData.append('character', JSON.stringify({
          name: woman.name,
          personality: woman.personality
        }));
        formData.append('user_id', user.id);
        formData.append('messageType', 'audio');
        
        console.log('Sending binary audio data, size:', binaryData.length, 'bytes');
        
        webhookResponse = await fetch(woman.webhook_url, {
          method: 'POST',
          body: formData
        });
      } else {
        // For text messages, send as JSON
        const webhookPayload = {
          chatId: chatId,
          character: {
            name: woman.name,
            personality: woman.personality
          },
          user_id: user.id,
          message: content,
          messageType: 'text'
        };
        
        console.log('Prepared text webhook payload');
        
        webhookResponse = await fetch(woman.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });
      }

      console.log('Webhook response status:', webhookResponse.status)
      
      const responseText = await webhookResponse.text()
      console.log('Webhook response body length:', responseText.length)

      if (!webhookResponse.ok) {
        console.error('Webhook returned error status:', webhookResponse.status, responseText)
      } else {
        console.log('Webhook called successfully for woman:', woman.name)
      }
    } catch (webhookError) {
      console.error('Webhook call failed with error:', webhookError)
      // Don't throw error - user message was saved successfully
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully' }),
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


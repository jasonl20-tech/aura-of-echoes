
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  console.log('Create Woman Profile API called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get API key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      console.log('Missing API key')
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify API key belongs to an admin user
    const { data: adminKey, error: keyError } = await supabase
      .from('women_api_keys')
      .select('woman_id')
      .eq('api_key', apiKey)
      .eq('active', true)
      .single()

    if (keyError || !adminKey) {
      console.log('Invalid API key:', keyError)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body = await req.json()
    console.log('Request body:', body)

    // Validate required fields
    const requiredFields = ['name', 'age', 'webhook_url']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing_fields: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate data types
    if (typeof body.age !== 'number' || body.age < 18 || body.age > 99) {
      return new Response(
        JSON.stringify({ error: 'Age must be a number between 18 and 99' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (body.price && (typeof body.price !== 'number' || body.price < 0)) {
      return new Response(
        JSON.stringify({ error: 'Price must be a positive number' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (body.height && (typeof body.height !== 'number' || body.height < 100 || body.height > 250)) {
      return new Response(
        JSON.stringify({ error: 'Height must be a number between 100 and 250 cm' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare woman data
    const womanData = {
      name: body.name,
      age: body.age,
      webhook_url: body.webhook_url,
      description: body.description || null,
      personality: body.personality || null,
      image_url: body.image_url || null,
      images: body.images || [],
      price: body.price || 3.99,
      pricing_interval: body.pricing_interval || 'monthly',
      interests: body.interests || [],
      height: body.height || null,
      origin: body.origin || null,
      nsfw: body.nsfw || false,
      exclusive: body.exclusive || false,
      exclusive_label: body.exclusive_label || 'EXCLUSIVE'
    }

    console.log('Creating woman profile with data:', womanData)

    // Create woman profile
    const { data: woman, error: womanError } = await supabase
      .from('women')
      .insert(womanData)
      .select()
      .single()

    if (womanError) {
      console.error('Error creating woman profile:', womanError)
      return new Response(
        JSON.stringify({ error: 'Failed to create woman profile', details: womanError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Woman profile created successfully:', woman)

    // Get the automatically generated API key for this woman
    const { data: newApiKey, error: apiKeyError } = await supabase
      .from('women_api_keys')
      .select('api_key')
      .eq('woman_id', woman.id)
      .eq('active', true)
      .single()

    if (apiKeyError) {
      console.error('Error fetching API key:', apiKeyError)
    }

    const response = {
      success: true,
      message: 'Woman profile created successfully',
      data: {
        id: woman.id,
        name: woman.name,
        age: woman.age,
        api_key: newApiKey?.api_key || null,
        created_at: woman.created_at
      }
    }

    console.log('Sending response:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

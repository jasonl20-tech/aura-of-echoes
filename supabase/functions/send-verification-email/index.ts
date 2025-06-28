
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, documentPath, userId } = await req.json()

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found, skipping email notification')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    const emailData = {
      from: 'noreply@yourdomain.com',
      to: ['lohrejason5@gmail.com'],
      subject: 'Neue Benutzer-Verifizierung eingegangen',
      html: `
        <h2>Neue Benutzer-Verifizierung</h2>
        <p>Ein Benutzer hat eine Verifizierung beantragt:</p>
        <ul>
          <li><strong>E-Mail:</strong> ${userEmail}</li>
          <li><strong>User ID:</strong> ${userId}</li>
          <li><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</li>
        </ul>
        <p>Das Ausweisdokument wurde hochgeladen und kann im Admin-Dashboard eingesehen werden.</p>
        <p>Bitte loggen Sie sich in das Admin-Dashboard ein, um die Verifizierung zu bearbeiten.</p>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send email:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

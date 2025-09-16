import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface SendEmailRequest {
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📧 Email Verification Function Called');

    // Initialize Supabase client with service key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request
    const { email }: SendEmailRequest = await req.json();

    if (!email) {
      return Response.json({
        success: false,
        error: 'Email is required'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('📧 Sending verification email to:', email);

    // Send magic link email (OTP-based verification)
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/verify-email`
      }
    });

    if (error) {
      console.error('❌ Supabase email error:', error);
      return Response.json({
        success: false,
        error: error.message
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ Email verification sent successfully');

    return Response.json({
      success: true,
      message: 'Verification email sent successfully',
      data: {
        email: email,
        actionLink: data.properties?.action_link // For testing purposes
      }
    }, { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('💥 Edge Function error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
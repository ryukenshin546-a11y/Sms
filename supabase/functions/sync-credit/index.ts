import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSUpTokenResponse {
  token?: string
  access_token?: string
  [key: string]: any
}

interface SMSUpCreditResponse {
  id: number
  paytype: number
  balance: number
  errormsg: string | null
}

interface CreditSyncRequest {
  userId?: string
  forceSync?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    let requestData: CreditSyncRequest = {}
    if (req.method === 'POST') {
      try {
        requestData = await req.json()
      } catch {
        // Use defaults if parsing fails
      }
    }

    const userId = requestData.userId || user.id
    const forceSync = requestData.forceSync || false

    console.log(`🚀 Starting credit sync for user: ${userId}`)

    // Check if we need to sync (avoid too frequent syncs unless forced)
    if (!forceSync) {
      const { data: lastProfile } = await supabaseClient
        .from('user_profiles')
        .select('updated_at, credit_balance')
        .eq('user_id', userId)
        .single()

      if (lastProfile?.updated_at) {
        const lastUpdateTime = new Date(lastProfile.updated_at)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60)
        
        // Don't sync if last update was less than 5 minutes ago
        if (diffMinutes < 5) {
          console.log('⏭️ Skipping sync - too recent')
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Using cached data',
              data: {
                user_id: userId,
                balance: lastProfile.credit_balance || 0,
                last_sync_at: lastProfile.updated_at,
                api_response: null
              },
              fromCache: true
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
    }

    // Step 1: Get user's SMS account credentials
    console.log('👤 Step 1: Getting user SMS account credentials...')
    
    const { data: smsAccount, error: smsError } = await supabaseClient
      .from('sms_accounts')
      .select('api_credentials')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Get the latest account
      .limit(1)
      .single()

    if (smsError || !smsAccount?.api_credentials) {
      console.error('❌ No SMS account found for user:', userId)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'ไม่พบบัญชี SMS ของผู้ใช้ กรุณาสร้างบัญชี SMS ก่อน',
          error: 'SMS_ACCOUNT_NOT_FOUND'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const credentials = smsAccount.api_credentials
    const { username, password, final_password } = credentials
    
    // Use final_password if available (newer accounts), fallback to password
    let workingPassword = final_password || password
    
    // If password looks like Base64 encoded, try to decode it
    if (workingPassword && !final_password) {
      try {
        // Check if it's base64 encoded (basic check)
        if (workingPassword.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(workingPassword)) {
          const decoded = atob(workingPassword);
          if (decoded && decoded.length > 6) { // Reasonable password length
            workingPassword = decoded;
            console.log('🔓 Decoded base64 password successfully');
          }
        }
      } catch (e) {
        console.log('⚠️ Could not decode password, using as-is');
      }
    }
    
    if (!username || !workingPassword) {
      console.error('❌ Invalid SMS credentials for user:', userId)
      console.log('Available credentials keys:', Object.keys(credentials))
      console.log('Username:', username ? 'available' : 'missing')
      console.log('Working password:', workingPassword ? 'available' : 'missing')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'ข้อมูล SMS account ไม่สมบูรณ์',
          error: 'INVALID_SMS_CREDENTIALS'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Using SMS credentials for user: ${username}`)

    // Step 2: Get access token from SMSUP API using user credentials
    console.log('📡 Step 2: Getting access token...')
    
    const tokenPayload = {
      username: username,           // Use user's SMS account username
      password: workingPassword,    // Use decoded/plain text password
      expireMinutes: "60",
      ip: "58.8.213.44",
      device: ""
    }

    const tokenResponse = await fetch('https://web.smsup-plus.com/api/Token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify(tokenPayload)
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token API failed: ${tokenResponse.status} ${tokenResponse.statusText}`)
    }

    const tokenText = await tokenResponse.text()
    // Remove quotes if the response is just a quoted string
    const accessToken = tokenText.replace(/^"|"$/g, '')
    
    console.log('✅ Access token obtained')

    // Step 3: Get credit balance using the token
    console.log('💰 Step 3: Getting credit balance...')
    
    const creditResponse = await fetch('https://web.smsup-plus.com/api/credit/get_credit_byuser', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      }
    })

    if (!creditResponse.ok) {
      throw new Error(`Credit API failed: ${creditResponse.status} ${creditResponse.statusText}`)
    }

    const creditData: SMSUpCreditResponse = await creditResponse.json()
    
    if (creditData.errormsg) {
      throw new Error(`SMSUP API Error: ${creditData.errormsg}`)
    }

    console.log(`💎 Credit balance: ${creditData.balance}`)

    // Step 4: Save to database (user_profiles table)
    console.log('💾 Step 4: Saving to user_profiles table...')
    
    const { data: savedData, error: saveError } = await supabaseClient
      .from('user_profiles')
      .update({
        credit_balance: creditData.balance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (saveError) {
      console.error('❌ Database save error:', saveError)
      throw new Error(`Database error: ${saveError.message}`)
    }

    console.log('✅ Credit balance updated successfully in user_profiles')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Credit balance synced successfully',
        data: {
          user_id: userId,
          balance: creditData.balance,
          last_sync_at: new Date().toISOString(),
          api_response: creditData,
          profile_data: savedData
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Credit sync error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
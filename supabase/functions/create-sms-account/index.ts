import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SMS-UP API Base URL
const SMS_UP_BASE_URL = 'https://web.smsup-plus.com'

// SMS-UP Credentials - ควรเก็บใน environment variables
const SMS_UP_USERNAME = 'Landingpage'
const SMS_UP_PASSWORD = '@Atoz123'

// Available senders for random selection
const AVAILABLE_SENDERS = ['Averin', 'Brivon', 'Clyrex']

interface SMSUpTokenResponse {
  token?: string
  access_token?: string
  [key: string]: any
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  username: string
  account_type: string
  credit_balance?: number
}

interface SMSAccountRequest {
  userId?: string
  username?: string  // Allow custom username from frontend
  creditAmount?: number
}

interface SMSUpAccountCreateRequest {
  name: string
  email: string
  username: string
  password: string
  paytype: number
  status: number
  createsubaccount: boolean
  generateToken: boolean
  twoFactor: boolean
  senderlist: string[]
}

interface SMSUpAccountCreateResponse {
  resultCode: string
  description: string
  message: string
  data: any
}

interface SMSUpAccountListRequest {
  name: string
  date: [null, null]
  startrow: number
  endrow: number
}

// SMS-UP API returns array directly, not nested in data object
interface SMSUpAccountListResponse extends Array<{
  RowNum: number
  key: number
  name: string
  email: string
  createdate: string
  status: boolean
  cost: number
  pay_type: number
  parent: string
  creactsubeaccount: boolean
  totalpage: number
  id: number
  balance: number
  [key: string]: any
}> {}

interface SMSUpAccountDetailRequest {
  accountId: number
}

// AccountDetail API returns object directly, not nested in data
interface SMSUpAccountDetailResponse {
  key: number
  name: string
  email: string
  createdate: string
  status: number
  pay_type: number
  parent: string
  username: string
  totalpage: number
  creactsubeaccount: boolean
  userGenToken: boolean
  user2Fa: boolean
  balance: number
  level: number
  createChildGenToken: boolean
  createChild2Fa: boolean
  [key: string]: any
}

interface SMSUpAccountUpdateRequest {
  accountId: number
  name: string
  email: string
  username: string
  password: string
  paytype: number
  status: number
  creactsubeaccount: boolean  // Fixed typo to match Postman documentation
  generateToken: boolean
  twoFactor: boolean
}

// Generate random password for SMS account
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Select random sender
function getRandomSender(): string {
  return AVAILABLE_SENDERS[Math.floor(Math.random() * AVAILABLE_SENDERS.length)]
}

// Get SMS-UP Bearer Token
async function getSMSUpToken(): Promise<string> {
  console.log('🔑 Getting SMS-UP Token...')
  
  const response = await fetch(`${SMS_UP_BASE_URL}/api/Token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({
      username: SMS_UP_USERNAME,
      password: SMS_UP_PASSWORD,
      expireMinutes: "60",
      ip: "0.0.0.0", // Edge function IP will be dynamic
      device: "EdgeFunction"
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Token request failed:', response.status, errorText)
    throw new Error(`Failed to get SMS-UP token: ${response.status} ${errorText}`)
  }

  const tokenData = await response.text()
  console.log('✅ SMS-UP Token obtained')
  
  // Remove quotes if the token is wrapped in quotes
  return tokenData.replace(/"/g, '')
}

// Check if username already exists - Returns true if duplicate, false if available
async function checkUsernameDuplicate(token: string, username: string): Promise<boolean> {
  console.log(`🔍 Checking username duplicate: ${username}`)
  
  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/CheckUserDuplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({
      username: username
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Username check API failed:', response.status, errorText)
    throw new Error(`Failed to check username: ${response.status} ${errorText}`)
  }

  // Get response body (should be true/false)
  const responseText = await response.text()
  console.log(`📋 CheckUserDuplicate API Response: ${responseText}`)
  
  // Parse response - could be boolean true/false or string "true"/"false"
  const isDuplicate = responseText.toLowerCase().includes('true') || responseText === 'true'
  
  if (isDuplicate) {
    console.log('⚠️ Username already exists (duplicate)')
    return true // true = duplicate exists, username not available
  } else {
    console.log('✅ Username is available (not duplicate)')
    return false // false = no duplicate, username is available
  }
}

// Create SMS account
async function createSMSAccount(token: string, userProfile: UserProfile): Promise<SMSUpAccountCreateResponse> {
  console.log(`🏗️ Creating SMS account for user: ${userProfile.username}`)
  
  // Generate random password for the SMS account
  const smsPassword = generateRandomPassword(12)
  
  // Select random sender
  const selectedSender = getRandomSender()
  
  const accountData: SMSUpAccountCreateRequest = {
    name: userProfile.username, // ใช้ Username เดียวกันตาม Postman Collection
    email: userProfile.email,
    username: userProfile.username,
    password: smsPassword,
    paytype: 1, // Fixed as requested
    status: 1, // Fixed as requested
    createsubaccount: true, // Fixed as requested
    generateToken: false, // Fixed as requested
    twoFactor: true, // Fixed as requested
    senderlist: [selectedSender] // Random sender selection
  }

  console.log('📊 Account creation data:', {
    ...accountData,
    password: '[HIDDEN]'
  })

  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/AccountCreate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(accountData)
  })

  const responseText = await response.text()
  
  if (!response.ok) {
    console.error('❌ Account creation failed:', response.status, responseText)
    throw new Error(`Failed to create SMS account: ${response.status} ${responseText}`)
  }

  let result: SMSUpAccountCreateResponse
  try {
    result = JSON.parse(responseText)
  } catch (e) {
    // Some APIs return success without JSON body
    result = {
      resultCode: '000',
      description: 'Account created successfully',
      message: 'Success',
      data: {
        username: accountData.username,
        email: accountData.email,
        password: smsPassword,
        sender: selectedSender
      }
    }
  }

  console.log('✅ SMS account created successfully')
  
  // Store account credentials securely in database
  return {
    ...result,
    data: {
      ...result.data,
      username: accountData.username,
      email: accountData.email,
      password: smsPassword, // This will be encrypted when stored
      sender: selectedSender,
      createdAt: new Date().toISOString()
    }
  }
}

// Get account list to find accountId
async function getAccountList(token: string, username: string): Promise<number> {
  console.log(`📋 Getting account list for user: ${username}`)
  
  // Add small delay to ensure account is available in list
  console.log('⏱️ Waiting 2 seconds for account to be available in list...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const requestData: SMSUpAccountListRequest = {
    name: username,
    date: [null, null],
    startrow: 1,
    endrow: 10
  }

  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/AccountList`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(requestData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Account list failed:', response.status, errorText)
    throw new Error(`Failed to get account list: ${response.status} ${errorText}`)
  }

  const result: SMSUpAccountListResponse = await response.json()
  
  console.log('📋 AccountList API Response:', JSON.stringify(result, null, 2))
  
  // SMS-UP API returns array directly
  const accounts = result // result is already an array
  
  if (accounts.length === 0) {
    throw new Error('No accounts found in account list response')
  }

  console.log('📊 Found accounts:', accounts.length)
  
  // Find the account with matching username (use 'name' field which contains username)
  const account = accounts.find(acc => acc.name === username)
  if (!account) {
    console.log('⚠️ Account not found with username:', username)
    console.log('📊 Available usernames:', accounts.map(acc => acc.name))
    throw new Error(`Account with username ${username} not found in list`)
  }

  console.log('✅ Account found in list, accountId:', account.id)
  return account.id
}

// Get complete account list response for new flow
async function getAccountListComplete(token: string, username: string): Promise<SMSUpAccountListResponse> {
  console.log(`📋 Getting complete account list for user: ${username}`)
  
  // Add small delay to ensure account is available in list
  console.log('⏱️ Waiting 2 seconds for account to be available in list...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const requestData: SMSUpAccountListRequest = {
    name: username,
    date: [null, null],
    startrow: 1,
    endrow: 10
  }

  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/AccountList`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(requestData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Account list failed:', response.status, errorText)
    throw new Error(`Failed to get account list: ${response.status} ${errorText}`)
  }

  const result: SMSUpAccountListResponse = await response.json()
  console.log('📋 AccountList Complete API Response:', JSON.stringify(result, null, 2))
  
  return result
}

// Get account details
async function getAccountDetail(token: string, accountId: number): Promise<SMSUpAccountDetailResponse> {
  console.log(`🔍 Getting account details for ID: ${accountId}`)
  
  const requestData: SMSUpAccountDetailRequest = {
    accountId: accountId
  }

  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/AccountDetail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(requestData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Account detail failed:', response.status, errorText)
    throw new Error(`Failed to retrieve SMS account details: ${response.status} ${errorText}. Please contact support with error code: ACCOUNT_DETAIL_FAILED`)
  }

  const result: SMSUpAccountDetailResponse = await response.json()
  console.log('✅ Account details retrieved')
  return result
}

// Update account with new password
async function updateAccount(
  token: string, 
  accountId: number, 
  accountDetails: SMSUpAccountDetailResponse,
  newPassword: string
): Promise<void> {
  console.log(`🔧 Updating account ID: ${accountId}`)
  
  // AccountDetail API returns data directly (no nested data object)
  const updateData: SMSUpAccountUpdateRequest = {
    accountId: accountId,
    name: accountDetails.name,        // Direct access
    email: accountDetails.email,      // Direct access  
    username: accountDetails.username, // Direct access
    password: newPassword, // New generated password
    paytype: 1, // Fixed as requested
    status: 1, // Fixed as requested
    creactsubeaccount: true, // Fixed typo to match Postman documentation  
    generateToken: false, // Fixed as requested
    twoFactor: true // Fixed as requested
  }

  const response = await fetch(`${SMS_UP_BASE_URL}/api/usersmanage/AccountUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(updateData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Account update failed:', response.status, errorText)
    throw new Error(`Failed to update SMS account password: ${response.status} ${errorText}. Please contact support with error code: ACCOUNT_UPDATE_FAILED`)
  }

  console.log('✅ Account updated successfully')
}

// Add credit to account (if needed)
async function addCreditToAccount(token: string, accountId: number, amount: number): Promise<void> {
  if (!amount || amount <= 0) {
    console.log('⏭️ No credit to add, skipping...')
    return
  }

  console.log(`💰 Adding ${amount} credits to account ${accountId}`)
  
  const response = await fetch(`${SMS_UP_BASE_URL}/api/creditmovement/AddCreditMovement`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({
      accountId: accountId,
      amount: amount,
      remark: `Initial credit from Auto-Bot system - ${new Date().toISOString()}`
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Credit addition failed:', response.status, errorText)
    throw new Error(`Failed to add initial credit to SMS account: ${response.status} ${errorText}. Please contact support with error code: CREDIT_ADD_FAILED`)
  }

  console.log('✅ Credit added successfully')
}

// Save SMS account to database
async function saveSMSAccountToDatabase(
  supabaseClient: any,
  userId: string,
  accountData: any,
  userProfile: UserProfile,
  createResponse?: any
): Promise<any> {
  console.log('💾 Saving SMS account to database...')

  // Use the final password (from account update) for encryption
  const passwordToEncrypt = accountData.finalPassword || accountData.password
  const encryptedPassword = btoa(passwordToEncrypt) // Simple base64 encoding - should use proper encryption in production

  // Format phone number for database
  const formatPhoneNumber = (phone: string): { phone_number: string, formatted_phone: string } => {
    const numbers = phone.replace(/\D/g, '')
    
    if (numbers.length === 9 && !numbers.startsWith('66')) {
      return {
        phone_number: `0${numbers}`,
        formatted_phone: `66${numbers}`
      }
    }
    if (numbers.length === 10 && numbers.startsWith('0')) {
      return {
        phone_number: numbers,
        formatted_phone: `66${numbers.slice(1)}`
      }
    }
    
    return {
      phone_number: numbers,
      formatted_phone: numbers.startsWith('66') ? numbers : `66${numbers}`
    }
  }

  // Get phone info (use profile phone or generate a default)
  const phoneInfo = userProfile.phone 
    ? formatPhoneNumber(userProfile.phone)
    : {
        phone_number: '0800000000', // Default placeholder
        formatted_phone: '66800000000'
      }

  // Create SMS account record that matches database schema
  const smsAccountRecord = {
    user_id: userId,
    account_name: userProfile.username,             // Use username for consistency
    phone_number: phoneInfo.phone_number,           // Required field
    formatted_phone: phoneInfo.formatted_phone,     // Required field
    country_code: '+66',                             // Default
    service_provider: 'sms_up_plus',                // Updated provider name
    api_credentials: {                               // Store credentials as JSONB
      username: accountData.username,
      email: accountData.email,
      password: encryptedPassword,
      original_email: userProfile.email,
      final_password: passwordToEncrypt,           // Store the working password separately
      account_id: accountData.accountId
    },
    status: 'active',                               // Default status
    balance_credits: 0,                             // Default balance
    usage_count: 0,                                 // Default usage
    last_used_at: null,                             // Not used yet
    sender_name: accountData.sender,                // Sender name
    api_account_id: accountData.accountId || null,  // Account ID from AccountList
    api_response_data: {                           // Store comprehensive API response data
      create_response: createResponse?.data || {},
      account_details: accountData.accountDetails || {},
      final_account_data: accountData
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabaseClient
    .from('sms_accounts')
    .insert([smsAccountRecord])
    .select()

  if (error) {
    console.error('❌ Database save failed:', error)
    throw new Error(`Failed to save to database: ${error.message}`)
  }

  console.log('✅ SMS account saved to database')
  return data?.[0]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 SMS Account Creation Edge Function started')

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

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Get request body safely
    let requestBody: Partial<SMSAccountRequest> = {}
    try {
      const bodyText = await req.text()
      console.log('📥 Request body raw:', bodyText)
      
      if (bodyText.trim()) {
        requestBody = JSON.parse(bodyText)
      } else {
        console.log('ℹ️ Empty request body, using defaults')
        requestBody = {}
      }
    } catch (e) {
      console.error('⚠️ Invalid JSON in request body, using defaults:', e)
      requestBody = {}
    }
    
    const userId = requestBody.userId || user.id

    // Get user profile from database - ใช้ user_id field ไม่ใช่ id
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('❌ User profile not found:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'User profile not found',
          userId: userId,
          details: profileError?.message || 'No profile data'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User profile loaded:', userProfile.username)

    // Determine which username to use (from request body or user profile)
    const targetUsername = requestBody.username || userProfile.username
    console.log(`🎯 Target username for SMS account: ${targetUsername}`)

    // Step 1: Get SMS-UP API Token
    const smsUpToken = await getSMSUpToken()

    // Step 2: Check if username is available
    const isDuplicateUsername = await checkUsernameDuplicate(smsUpToken, targetUsername)
    if (isDuplicateUsername) {
      console.log(`❌ Username ${targetUsername} already exists in SMS-UP system`)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'USERNAME_ALREADY_EXISTS',
          message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว',
          details: 'กรุณาเลือกชื่อผู้ใช้อื่น',
          username: targetUsername,
          requiresNewUsername: true
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Create SMS Account with target username
    const createResult = await createSMSAccount(smsUpToken, {
      ...userProfile,
      username: targetUsername  // Use the target username instead of profile username
    })

    // Step 4: Get Account List to find the newly created account
    console.log('🔍 Getting account list to find newly created account...')
    const accountList = await getAccountListComplete(smsUpToken, targetUsername)
    
    if (!accountList || accountList.length === 0) {
      // Critical error - AccountList failed after successful account creation
      console.error('🚨 CRITICAL ERROR: AccountList returned empty after successful account creation')
      console.error('📊 AccountList Response:', JSON.stringify(accountList, null, 2))
      console.error('🔍 Expected username:', targetUsername)
      console.error('⚠️ This indicates a serious issue with SMS-UP API or timing problems')
      
      throw new Error(
        'SMS account creation failed: Unable to retrieve newly created account from SMS-UP system. ' +
        'The account may have been created but cannot be verified. Please contact technical support ' +
        'with this error code: ACCOUNT_LIST_EMPTY_AFTER_CREATE'
      )
      
    } else {
      // Complete flow - account was found in list
      const newAccount = accountList[0] // Get first account (should be the newly created one)
      console.log('✅ Found newly created account:', newAccount)
      
      // Step 5: Get detailed account information
      console.log('📋 Getting account details...')
      const accountDetails = await getAccountDetail(smsUpToken, newAccount.id)
      
      
      // Step 6: Update account with new generated password
      console.log('🔧 Updating account with new password...')
      const newPassword = generateRandomPassword()
      await updateAccount(smsUpToken, newAccount.id, accountDetails, newPassword)
      
      // Step 7: Add initial credit (default 1 credit as per Postman Collection)
      const creditAmount = requestBody.creditAmount || 1 // Default 1 credit if not specified
      console.log(`💰 Adding ${creditAmount} credit(s) to account...`)
      await addCreditToAccount(smsUpToken, newAccount.id, creditAmount)
      
      // Step 8: Save to our database with complete information
      const finalAccountData = {
        ...createResult.data,
        accountId: newAccount.id,
        finalPassword: newPassword, // Use the updated password
        complete_flow: true // Mark as complete flow
      }
      
      const savedRecord = await saveSMSAccountToDatabase(supabaseClient, userId, finalAccountData, userProfile, createResult)
    
      // Return success response with credentials
      const response = {
        success: true,
        message: 'SMS account created successfully with complete flow',
        data: {
          username: targetUsername,  // Use the actual username that was created
          password: finalAccountData.finalPassword, // Include password from scope
          email: userProfile.email,
          accountId: savedRecord?.id, // Include database record ID
          status: 'active',
          createdAt: new Date().toISOString(),
          flowType: 'complete_flow',
          hasCredentials: true
        }
      }

      console.log('🎉 SMS Account creation completed successfully')

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR in SMS Account creation:', error)
    console.error('🔍 Error details:', {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      requestInfo: 'SMS Account Creation'
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    // Determine if it's a user-facing error or system error
    const isAccountListError = errorMessage.includes('ACCOUNT_LIST_EMPTY_AFTER_CREATE')
    const isAPIError = errorMessage.includes('Failed to') || errorMessage.includes('API')
    
    let userFriendlyMessage = 'เกิดข้อผิดพลาดในการสร้างบัญชี SMS'
    let supportMessage = 'กรุณาติดต่อทีมซัพพอร์ตพร้อมแจ้งรหัสข้อผิดพลาด'
    
    if (isAccountListError) {
      userFriendlyMessage = 'ระบบสร้างบัญชีสำเร็จแต่ไม่สามารถยืนยันได้'
      supportMessage = 'กรุณาติดต่อทีมซัพพอร์ตเพื่อตรวจสอบสถานะบัญชี (รหัส: ACCOUNT_LIST_EMPTY_AFTER_CREATE)'
    } else if (isAPIError) {
      userFriendlyMessage = 'เกิดปัญหาในการเชื่อมต่อกับระบบ SMS'
      supportMessage = 'กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อทีมซัพพอร์ต'
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'SMS_ACCOUNT_CREATION_FAILED', 
        message: userFriendlyMessage,
        supportMessage: supportMessage,
        details: errorMessage,
        timestamp: new Date().toISOString(),
        contactSupport: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
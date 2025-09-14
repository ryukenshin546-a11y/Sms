/**
 * OTP Analytics API
 * Provides comprehensive OTP usage statistics and insights
 * Created: September 14, 2025
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mnhdueclyzwtfkmwttkc.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop()
    const params = Object.fromEntries(url.searchParams.entries())

    console.log('🔍 Analytics API Request:', { 
      endpoint, 
      params, 
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    })

    // Initialize Supabase client with service key (bypasses RLS for service role)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let result = {}

    switch (endpoint) {
      case 'test':
        result = { 
          message: 'Analytics API is working!', 
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(req.headers.entries())
        }
        break
      case 'overview':
        result = await getOverviewStats(supabase, params)
        break
      case 'success-rate':
        result = await getSuccessRate(supabase, params)
        break
      case 'hourly-usage':
        result = await getHourlyUsage(supabase, params)
        break
      case 'error-patterns':
        result = await getErrorPatterns(supabase, params)
        break
      case 'peak-times':
        result = await getPeakTimes(supabase, params)
        break
      case 'user-behavior':
        result = await getUserBehavior(supabase, params)
        break
      case 'performance':
        result = await getPerformanceMetrics(supabase, params)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 400, headers: corsHeaders }
        )
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Analytics API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})

/**
 * Get overview statistics
 */
async function getOverviewStats(supabase: any, params: any) {
  const timeRange = params.range || '24h'
  const timeClause = getTimeClause(timeRange)

  console.log('📊 Getting overview stats for:', timeRange)

  // Total OTP requests
  const { data: totalRequests, error: totalError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('event_type', 'otp_send')
    .gte('timestamp', timeClause)

  if (totalError) throw totalError

  // Successful OTP sends
  const { data: successfulSends, error: sendsError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('event_type', 'otp_send')
    .eq('success', true)
    .gte('timestamp', timeClause)

  if (sendsError) throw sendsError

  // Successful verifications
  const { data: successfulVerifications, error: verificationsError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('event_type', 'otp_verify')
    .eq('success', true)
    .gte('timestamp', timeClause)

  if (verificationsError) throw verificationsError

  // Rate limit incidents
  const { data: rateLimits, error: rateLimitError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('event_type', 'rate_limit_exceeded')
    .gte('timestamp', timeClause)

  if (rateLimitError) throw rateLimitError

  // Average response time
  const { data: avgResponseTime, error: responseError } = await supabase
    .from('audit_logs')
    .select('response_time_ms')
    .not('response_time_ms', 'is', null)
    .gte('timestamp', timeClause)

  if (responseError) throw responseError

  const avgTime = avgResponseTime.length > 0
    ? avgResponseTime.reduce((sum, record) => sum + record.response_time_ms, 0) / avgResponseTime.length
    : 0

  return {
    timeRange,
    totalRequests: totalRequests?.length || 0,
    successfulSends: successfulSends?.length || 0,
    successfulVerifications: successfulVerifications?.length || 0,
    rateLimitIncidents: rateLimits?.length || 0,
    sendSuccessRate: totalRequests?.length > 0 
      ? ((successfulSends?.length || 0) / totalRequests.length * 100).toFixed(1)
      : '0.0',
    averageResponseTime: Math.round(avgTime),
    generatedAt: new Date().toISOString()
  }
}

/**
 * Get success rate trends
 */
async function getSuccessRate(supabase: any, params: any) {
  const timeRange = params.range || '7d'
  const timeClause = getTimeClause(timeRange)

  console.log('📈 Getting success rate for:', timeRange)

  // Get success rate by hour for the last 24h or by day for longer periods
  const interval = timeRange === '24h' ? '1 hour' : '1 day'
  
  const { data, error } = await supabase.rpc('get_success_rate_trends', {
    start_time: timeClause,
    time_interval: interval
  })

  if (error) {
    console.log('⚠️ RPC function not found, using basic query')
    
    // Fallback to basic query
    const { data: basicData, error: basicError } = await supabase
      .from('audit_logs')
      .select('timestamp, event_type, success')
      .in('event_type', ['otp_send', 'otp_verify'])
      .gte('timestamp', timeClause)
      .order('timestamp', { ascending: true })

    if (basicError) throw basicError

    return processSuccessRateData(basicData, interval)
  }

  return data
}

/**
 * Get hourly usage patterns
 */
async function getHourlyUsage(supabase: any, params: any) {
  const timeRange = params.range || '7d'
  const timeClause = getTimeClause(timeRange)

  console.log('⏰ Getting hourly usage for:', timeRange)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('timestamp, event_type')
    .eq('event_type', 'otp_send')
    .gte('timestamp', timeClause)
    .order('timestamp', { ascending: true })

  if (error) throw error

  // Group by hour
  const hourlyData = {}
  data.forEach(record => {
    const hour = new Date(record.timestamp).getHours()
    hourlyData[hour] = (hourlyData[hour] || 0) + 1
  })

  // Convert to array format
  const result = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    requests: hourlyData[hour] || 0
  }))

  return {
    timeRange,
    data: result,
    peakHour: Object.keys(hourlyData).reduce((a, b) => 
      hourlyData[a] > hourlyData[b] ? a : b, '0'
    ),
    totalRequests: data.length
  }
}

/**
 * Get error patterns analysis
 */
async function getErrorPatterns(supabase: any, params: any) {
  const timeRange = params.range || '7d'
  const timeClause = getTimeClause(timeRange)

  console.log('🐛 Getting error patterns for:', timeRange)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('error_code, error_message, event_type, timestamp')
    .not('error_code', 'is', null)
    .gte('timestamp', timeClause)
    .order('timestamp', { ascending: false })

  if (error) throw error

  // Analyze error patterns
  const errorStats = {}
  data.forEach(record => {
    const key = record.error_code || 'UNKNOWN_ERROR'
    if (!errorStats[key]) {
      errorStats[key] = {
        code: key,
        count: 0,
        lastSeen: record.timestamp,
        eventTypes: new Set()
      }
    }
    errorStats[key].count++
    errorStats[key].eventTypes.add(record.event_type)
  })

  // Convert to array and sort by frequency
  const errorArray = Object.values(errorStats).map((stat: any) => ({
    ...stat,
    eventTypes: Array.from(stat.eventTypes)
  })).sort((a: any, b: any) => b.count - a.count)

  return {
    timeRange,
    totalErrors: data.length,
    uniqueErrorTypes: errorArray.length,
    topErrors: errorArray.slice(0, 10),
    errorTrends: groupErrorsByTime(data)
  }
}

/**
 * Get peak usage times
 */
async function getPeakTimes(supabase: any, params: any) {
  const timeRange = params.range || '30d'
  const timeClause = getTimeClause(timeRange)

  console.log('🚀 Getting peak times for:', timeRange)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('timestamp, event_type')
    .eq('event_type', 'otp_send')
    .gte('timestamp', timeClause)

  if (error) throw error

  // Analyze by day of week and hour
  const weeklyPattern = Array(7).fill(0).map(() => Array(24).fill(0))
  const dailyTotals = Array(7).fill(0)

  data.forEach(record => {
    const date = new Date(record.timestamp)
    const dayOfWeek = date.getDay()
    const hour = date.getHours()
    
    weeklyPattern[dayOfWeek][hour]++
    dailyTotals[dayOfWeek]++
  })

  // Find peak day and hour
  const peakDay = dailyTotals.indexOf(Math.max(...dailyTotals))
  const peakHourCounts = weeklyPattern.flat()
  const peakHour = peakHourCounts.indexOf(Math.max(...peakHourCounts)) % 24

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return {
    timeRange,
    weeklyPattern,
    dailyTotals,
    peakDay: {
      day: peakDay,
      name: dayNames[peakDay],
      requests: dailyTotals[peakDay]
    },
    peakHour: {
      hour: peakHour,
      requests: Math.max(...peakHourCounts)
    },
    totalRequests: data.length
  }
}

/**
 * Get user behavior insights
 */
async function getUserBehavior(supabase: any, params: any) {
  const timeRange = params.range || '7d'
  const timeClause = getTimeClause(timeRange)

  console.log('👥 Getting user behavior for:', timeRange)

  // Resend patterns
  const { data: resendData, error: resendError } = await supabase
    .from('audit_logs')
    .select('phone_number, timestamp, event_type')
    .eq('event_type', 'otp_resend')
    .gte('timestamp', timeClause)

  if (resendError) throw resendError

  // Verification attempts
  const { data: verifyData, error: verifyError } = await supabase
    .from('audit_logs')
    .select('phone_number, success, timestamp')
    .eq('event_type', 'otp_verify')
    .gte('timestamp', timeClause)

  if (verifyError) throw verifyError

  // Analysis
  const phonePatterns = {}
  
  // Analyze verification success rates per phone
  verifyData.forEach(record => {
    const phone = record.phone_number || 'unknown'
    if (!phonePatterns[phone]) {
      phonePatterns[phone] = { attempts: 0, successes: 0 }
    }
    phonePatterns[phone].attempts++
    if (record.success) phonePatterns[phone].successes++
  })

  // Calculate stats
  const userCount = Object.keys(phonePatterns).length
  const avgAttempts = userCount > 0 
    ? Object.values(phonePatterns).reduce((sum: number, user: any) => sum + user.attempts, 0) / userCount 
    : 0
  const avgSuccessRate = userCount > 0
    ? Object.values(phonePatterns).reduce((sum: number, user: any) => 
        sum + (user.successes / user.attempts * 100), 0) / userCount
    : 0

  return {
    timeRange,
    uniqueUsers: userCount,
    totalVerificationAttempts: verifyData.length,
    totalResendRequests: resendData.length,
    averageAttemptsPerUser: Math.round(avgAttempts * 100) / 100,
    averageSuccessRate: Math.round(avgSuccessRate * 100) / 100,
    resendPattern: analyzeResendPattern(resendData)
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(supabase: any, params: any) {
  const timeRange = params.range || '24h'
  const timeClause = getTimeClause(timeRange)

  console.log('⚡ Getting performance metrics for:', timeRange)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('response_time_ms, database_query_time_ms, event_type, timestamp')
    .not('response_time_ms', 'is', null)
    .gte('timestamp', timeClause)

  if (error) throw error

  // Calculate percentiles and averages
  const responseTimes = data.map(r => r.response_time_ms).sort((a, b) => a - b)
  const dbTimes = data.filter(r => r.database_query_time_ms).map(r => r.database_query_time_ms).sort((a, b) => a - b)

  const getPercentile = (arr: number[], p: number) => {
    const index = Math.ceil(arr.length * p / 100) - 1
    return arr[index] || 0
  }

  return {
    timeRange,
    responseTime: {
      average: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) || 0,
      p50: getPercentile(responseTimes, 50),
      p95: getPercentile(responseTimes, 95),
      p99: getPercentile(responseTimes, 99),
      min: responseTimes[0] || 0,
      max: responseTimes[responseTimes.length - 1] || 0
    },
    databaseTime: dbTimes.length > 0 ? {
      average: Math.round(dbTimes.reduce((a, b) => a + b, 0) / dbTimes.length),
      p50: getPercentile(dbTimes, 50),
      p95: getPercentile(dbTimes, 95),
      p99: getPercentile(dbTimes, 99)
    } : null,
    totalRequests: data.length
  }
}

/**
 * Helper functions
 */
function getTimeClause(range: string): string {
  const now = new Date()
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  }
}

function processSuccessRateData(data: any[], interval: string) {
  // Basic processing for success rate trends
  const grouped = {}
  
  data.forEach(record => {
    const date = new Date(record.timestamp)
    const key = interval === '1 hour' 
      ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    
    if (!grouped[key]) {
      grouped[key] = { total: 0, successful: 0 }
    }
    
    grouped[key].total++
    if (record.success) grouped[key].successful++
  })
  
  return Object.entries(grouped).map(([key, stats]: [string, any]) => ({
    timestamp: key,
    successRate: (stats.successful / stats.total * 100).toFixed(1),
    total: stats.total,
    successful: stats.successful
  }))
}

function groupErrorsByTime(data: any[]) {
  const grouped = {}
  data.forEach(record => {
    const hour = new Date(record.timestamp).getHours()
    grouped[hour] = (grouped[hour] || 0) + 1
  })
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    errors: grouped[hour] || 0
  }))
}

function analyzeResendPattern(data: any[]) {
  const hourly = Array(24).fill(0)
  data.forEach(record => {
    const hour = new Date(record.timestamp).getHours()
    hourly[hour]++
  })
  
  return hourly.map((count, hour) => ({ hour, count }))
}
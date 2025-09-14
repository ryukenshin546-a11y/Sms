/**
 * Analytics Service
 * Handles all OTP analytics API calls
 * Created: September 14, 2025
 */

interface AnalyticsOverview {
  timeRange: string
  totalRequests: number
  successfulSends: number
  successfulVerifications: number
  rateLimitIncidents: number
  sendSuccessRate: string
  averageResponseTime: number
  generatedAt: string
}

interface SuccessRateData {
  timestamp: string
  successRate: string
  total: number
  successful: number
}

interface HourlyUsageData {
  timeRange: string
  data: Array<{
    hour: number
    requests: number
  }>
  peakHour: string
  totalRequests: number
}

interface ErrorPattern {
  code: string
  count: number
  lastSeen: string
  eventTypes: string[]
}

interface ErrorPatternsData {
  timeRange: string
  totalErrors: number
  uniqueErrorTypes: number
  topErrors: ErrorPattern[]
  errorTrends: Array<{
    hour: number
    errors: number
  }>
}

interface PeakTimesData {
  timeRange: string
  weeklyPattern: number[][]
  dailyTotals: number[]
  peakDay: {
    day: number
    name: string
    requests: number
  }
  peakHour: {
    hour: number
    requests: number
  }
  totalRequests: number
}

interface UserBehaviorData {
  timeRange: string
  uniqueUsers: number
  totalVerificationAttempts: number
  totalResendRequests: number
  averageAttemptsPerUser: number
  averageSuccessRate: number
  resendPattern: Array<{
    hour: number
    count: number
  }>
}

interface PerformanceMetrics {
  timeRange: string
  responseTime: {
    average: number
    p50: number
    p95: number
    p99: number
    min: number
    max: number
  }
  databaseTime: {
    average: number
    p50: number
    p95: number
    p99: number
  } | null
  totalRequests: number
}

class AnalyticsService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = 'https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-analytics'
    this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGR1ZWNseXp3dGZrbXd0dGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwODgyMDEsImV4cCI6MjA0MDY2NDIwMX0.0_0gowVIH5pJW4XTUx8HJuB-aVL0WI1wpWmjc-zQU4g' // Using anon key for frontend
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}/${endpoint}`)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      console.log('🔍 Analytics API Request:', url.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Analytics API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        })
        throw new Error(`Analytics API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('✅ Analytics API Response:', data)
      return data
    } catch (error) {
      console.error('❌ Analytics Service Error:', error)
      throw error
    }
  }

  /**
   * Get overview statistics
   */
  async getOverview(timeRange: string = '24h'): Promise<AnalyticsOverview> {
    return this.makeRequest<AnalyticsOverview>('overview', { range: timeRange })
  }

  /**
   * Get success rate trends
   */
  async getSuccessRate(timeRange: string = '7d'): Promise<SuccessRateData[]> {
    return this.makeRequest<SuccessRateData[]>('success-rate', { range: timeRange })
  }

  /**
   * Get hourly usage patterns
   */
  async getHourlyUsage(timeRange: string = '7d'): Promise<HourlyUsageData> {
    return this.makeRequest<HourlyUsageData>('hourly-usage', { range: timeRange })
  }

  /**
   * Get error patterns analysis
   */
  async getErrorPatterns(timeRange: string = '7d'): Promise<ErrorPatternsData> {
    return this.makeRequest<ErrorPatternsData>('error-patterns', { range: timeRange })
  }

  /**
   * Get peak usage times
   */
  async getPeakTimes(timeRange: string = '30d'): Promise<PeakTimesData> {
    return this.makeRequest<PeakTimesData>('peak-times', { range: timeRange })
  }

  /**
   * Get user behavior insights
   */
  async getUserBehavior(timeRange: string = '7d'): Promise<UserBehaviorData> {
    return this.makeRequest<UserBehaviorData>('user-behavior', { range: timeRange })
  }

  /**
   * Get performance metrics
   */
  async getPerformance(timeRange: string = '24h'): Promise<PerformanceMetrics> {
    return this.makeRequest<PerformanceMetrics>('performance', { range: timeRange })
  }

  /**
   * Get all analytics data at once
   */
  async getAllAnalytics(timeRange: string = '24h'): Promise<{
    overview: AnalyticsOverview
    successRate: SuccessRateData[]
    hourlyUsage: HourlyUsageData
    errorPatterns: ErrorPatternsData
    peakTimes: PeakTimesData
    userBehavior: UserBehaviorData
    performance: PerformanceMetrics
  }> {
    try {
      console.log('🚀 Fetching all analytics data for timeRange:', timeRange)

      const [
        overview,
        successRate,
        hourlyUsage,
        errorPatterns,
        peakTimes,
        userBehavior,
        performance
      ] = await Promise.allSettled([
        this.getOverview(timeRange),
        this.getSuccessRate(timeRange),
        this.getHourlyUsage(timeRange),
        this.getErrorPatterns(timeRange),
        this.getPeakTimes(timeRange),
        this.getUserBehavior(timeRange),
        this.getPerformance(timeRange)
      ])

      // Extract successful results or provide fallbacks
      const result = {
        overview: overview.status === 'fulfilled' ? overview.value : {
          timeRange,
          totalRequests: 0,
          successfulSends: 0,
          successfulVerifications: 0,
          rateLimitIncidents: 0,
          sendSuccessRate: '0.0',
          averageResponseTime: 0,
          generatedAt: new Date().toISOString()
        },
        successRate: successRate.status === 'fulfilled' ? successRate.value : [],
        hourlyUsage: hourlyUsage.status === 'fulfilled' ? hourlyUsage.value : {
          timeRange,
          data: [],
          peakHour: '0',
          totalRequests: 0
        },
        errorPatterns: errorPatterns.status === 'fulfilled' ? errorPatterns.value : {
          timeRange,
          totalErrors: 0,
          uniqueErrorTypes: 0,
          topErrors: [],
          errorTrends: []
        },
        peakTimes: peakTimes.status === 'fulfilled' ? peakTimes.value : {
          timeRange,
          weeklyPattern: Array(7).fill(0).map(() => Array(24).fill(0)),
          dailyTotals: Array(7).fill(0),
          peakDay: { day: 0, name: 'Sunday', requests: 0 },
          peakHour: { hour: 0, requests: 0 },
          totalRequests: 0
        },
        userBehavior: userBehavior.status === 'fulfilled' ? userBehavior.value : {
          timeRange,
          uniqueUsers: 0,
          totalVerificationAttempts: 0,
          totalResendRequests: 0,
          averageAttemptsPerUser: 0,
          averageSuccessRate: 0,
          resendPattern: []
        },
        performance: performance.status === 'fulfilled' ? performance.value : {
          timeRange,
          responseTime: {
            average: 0,
            p50: 0,
            p95: 0,
            p99: 0,
            min: 0,
            max: 0
          },
          databaseTime: null,
          totalRequests: 0
        }
      }

      // Log any failures for debugging
      const failed = [
        { name: 'overview', result: overview },
        { name: 'successRate', result: successRate },
        { name: 'hourlyUsage', result: hourlyUsage },
        { name: 'errorPatterns', result: errorPatterns },
        { name: 'peakTimes', result: peakTimes },
        { name: 'userBehavior', result: userBehavior },
        { name: 'performance', result: performance }
      ].filter(({ result }) => result.status === 'rejected')

      if (failed.length > 0) {
        console.warn('⚠️ Some analytics requests failed:', failed.map(f => ({
          name: f.name,
          reason: f.result.status === 'rejected' ? f.result.reason : 'Unknown'
        })))
      }

      console.log('✅ All analytics data fetched successfully')
      return result

    } catch (error) {
      console.error('❌ Failed to fetch all analytics:', error)
      throw error
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

// Export types
export type {
  AnalyticsOverview,
  SuccessRateData,
  HourlyUsageData,
  ErrorPatternsData,
  PeakTimesData,
  UserBehaviorData,
  PerformanceMetrics,
  ErrorPattern
}
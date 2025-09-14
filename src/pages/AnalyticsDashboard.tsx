/**
 * OTP Analytics Dashboard Page
 * Comprehensive analytics and monitoring for OTP system
 * Created: September 14, 2025
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  OverviewStats, 
  MetricCard, 
  SimpleBarChart, 
  SimpleLineChart, 
  ErrorPatterns,
  RealTimeStatus 
} from '@/components/analytics/AnalyticsCharts'
import { analyticsService, type AnalyticsOverview, type HourlyUsageData, type ErrorPatternsData, type UserBehaviorData, type PerformanceMetrics } from '@/services/analyticsService'

interface AnalyticsDashboardProps {}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  // State management
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString())
  
  // Analytics data state
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [hourlyUsage, setHourlyUsage] = useState<HourlyUsageData | null>(null)
  const [errorPatterns, setErrorPatterns] = useState<ErrorPatternsData | null>(null)
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)

  /**
   * Load analytics data
   */
  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Loading analytics for timeRange:', timeRange)

      const data = await analyticsService.getAllAnalytics(timeRange)
      
      setOverview(data.overview)
      setHourlyUsage(data.hourlyUsage)
      setErrorPatterns(data.errorPatterns)
      setUserBehavior(data.userBehavior)
      setPerformance(data.performance)
      setLastUpdate(new Date().toISOString())
      
      console.log('✅ Analytics loaded successfully')
      
    } catch (err) {
      console.error('❌ Analytics loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initialize dashboard
   */
  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  /**
   * Auto-refresh every 5 minutes for real-time data
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadAnalytics()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [loading, timeRange])

  /**
   * Prepare chart data
   */
  const getHourlyChartData = () => {
    if (!hourlyUsage?.data) return []
    
    return hourlyUsage.data.map(item => ({
      label: `${item.hour}:00`,
      value: item.requests,
      color: item.requests > (hourlyUsage.totalRequests / 24 * 1.5) ? 'red' : 'blue'
    }))
  }

  const getPerformanceChartData = () => {
    if (!performance?.responseTime) return []
    
    const { responseTime } = performance
    return [
      { label: 'Min', value: responseTime.min },
      { label: 'P50', value: responseTime.p50 },
      { label: 'Avg', value: responseTime.average },
      { label: 'P95', value: responseTime.p95 },
      { label: 'P99', value: responseTime.p99 },
      { label: 'Max', value: responseTime.max }
    ]
  }

  const getUserBehaviorChartData = () => {
    if (!userBehavior?.resendPattern) return []
    
    return userBehavior.resendPattern.map(item => ({
      label: `${item.hour}:00`,
      value: item.count,
      timestamp: `Hour ${item.hour}`
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 OTP Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive monitoring and insights for SMS OTP system
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Real-time Status */}
        <RealTimeStatus
          isLive={!loading && !error}
          lastUpdate={lastUpdate}
          onRefresh={loadAnalytics}
        />

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="font-semibold text-red-800">Analytics Error</h3>
                  <p className="text-red-600">{error}</p>
                  <Button 
                    onClick={loadAnalytics} 
                    className="mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">📊</div>
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        {overview && !loading && (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">📈 Overview Statistics</h2>
              <OverviewStats data={overview} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Hourly Usage */}
              {hourlyUsage && (
                <SimpleBarChart
                  title="📅 Hourly Usage Pattern"
                  description={`Peak hour: ${hourlyUsage.peakHour}:00 with ${Math.max(...hourlyUsage.data.map(d => d.requests))} requests`}
                  data={getHourlyChartData()}
                  height={300}
                />
              )}

              {/* Performance Metrics */}
              {performance && (
                <SimpleBarChart
                  title="⚡ Response Time Distribution"
                  description={`Average: ${performance.responseTime.average}ms, P95: ${performance.responseTime.p95}ms`}
                  data={getPerformanceChartData()}
                  height={300}
                />
              )}

              {/* User Behavior - Resend Pattern */}
              {userBehavior && userBehavior.resendPattern.length > 0 && (
                <SimpleLineChart
                  title="🔄 OTP Resend Patterns"
                  description={`${userBehavior.totalResendRequests} total resend requests from ${userBehavior.uniqueUsers} users`}
                  data={getUserBehaviorChartData()}
                  height={300}
                />
              )}

              {/* Error Patterns */}
              {errorPatterns && (
                <div className="lg:col-span-1">
                  <ErrorPatterns data={errorPatterns} />
                </div>
              )}

            </div>

            {/* Detailed Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* User Behavior Metrics */}
              {userBehavior && (
                <>
                  <MetricCard
                    title="Unique Users"
                    value={userBehavior.uniqueUsers.toLocaleString()}
                    description={`${userBehavior.totalVerificationAttempts} total attempts`}
                    color="purple"
                  />
                  
                  <MetricCard
                    title="Avg Attempts/User"
                    value={userBehavior.averageAttemptsPerUser.toFixed(1)}
                    description="Verification attempts per user"
                    color={userBehavior.averageAttemptsPerUser < 2 ? 'green' : 
                           userBehavior.averageAttemptsPerUser < 3 ? 'yellow' : 'red'}
                  />
                  
                  <MetricCard
                    title="User Success Rate"
                    value={`${userBehavior.averageSuccessRate.toFixed(1)}%`}
                    description="Average per-user success rate"
                    color={userBehavior.averageSuccessRate > 80 ? 'green' : 
                           userBehavior.averageSuccessRate > 60 ? 'yellow' : 'red'}
                  />
                  
                  <MetricCard
                    title="Resend Requests"
                    value={userBehavior.totalResendRequests}
                    description="Total OTP resend requests"
                    color="blue"
                  />
                </>
              )}

              {/* Performance Metrics */}
              {performance && (
                <>
                  <MetricCard
                    title="P95 Response Time"
                    value={`${performance.responseTime.p95}ms`}
                    description="95th percentile response time"
                    color={performance.responseTime.p95 < 1000 ? 'green' : 
                           performance.responseTime.p95 < 2000 ? 'yellow' : 'red'}
                  />
                  
                  <MetricCard
                    title="P99 Response Time"
                    value={`${performance.responseTime.p99}ms`}
                    description="99th percentile response time"
                    color={performance.responseTime.p99 < 2000 ? 'green' : 
                           performance.responseTime.p99 < 5000 ? 'yellow' : 'red'}
                  />
                  
                  {performance.databaseTime && (
                    <>
                      <MetricCard
                        title="DB Query Time"
                        value={`${performance.databaseTime.average}ms`}
                        description="Average database query time"
                        color={performance.databaseTime.average < 100 ? 'green' : 
                               performance.databaseTime.average < 300 ? 'yellow' : 'red'}
                      />
                      
                      <MetricCard
                        title="DB P95 Time"
                        value={`${performance.databaseTime.p95}ms`}
                        description="95th percentile DB time"
                        color={performance.databaseTime.p95 < 200 ? 'green' : 
                               performance.databaseTime.p95 < 500 ? 'yellow' : 'red'}
                      />
                    </>
                  )}
                </>
              )}

            </div>

            {/* System Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle>🏥 System Health Summary</CardTitle>
                <CardDescription>
                  Overall system status and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Performance Health */}
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-3xl mb-2">
                      {performance && performance.responseTime.average < 500 ? '🟢' : 
                       performance && performance.responseTime.average < 1000 ? '🟡' : '🔴'}
                    </div>
                    <h3 className="font-semibold">Performance</h3>
                    <p className="text-sm text-gray-600">
                      {performance && performance.responseTime.average < 500 ? 'Excellent' :
                       performance && performance.responseTime.average < 1000 ? 'Good' : 'Needs Attention'}
                    </p>
                  </div>
                  
                  {/* Success Rate Health */}
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-3xl mb-2">
                      {overview && parseFloat(overview.sendSuccessRate) > 95 ? '🟢' :
                       overview && parseFloat(overview.sendSuccessRate) > 90 ? '🟡' : '🔴'}
                    </div>
                    <h3 className="font-semibold">Success Rate</h3>
                    <p className="text-sm text-gray-600">
                      {overview && parseFloat(overview.sendSuccessRate) > 95 ? 'Excellent' :
                       overview && parseFloat(overview.sendSuccessRate) > 90 ? 'Good' : 'Needs Attention'}
                    </p>
                  </div>
                  
                  {/* Error Rate Health */}
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-3xl mb-2">
                      {errorPatterns && errorPatterns.totalErrors === 0 ? '🟢' :
                       errorPatterns && errorPatterns.totalErrors < 10 ? '🟡' : '🔴'}
                    </div>
                    <h3 className="font-semibold">Error Rate</h3>
                    <p className="text-sm text-gray-600">
                      {errorPatterns && errorPatterns.totalErrors === 0 ? 'No Errors' :
                       errorPatterns && errorPatterns.totalErrors < 10 ? 'Low' : 'High'}
                    </p>
                  </div>
                  
                </div>

                {/* Recommendations */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {overview && parseFloat(overview.sendSuccessRate) < 95 && (
                      <li>• Consider investigating SMS delivery issues - success rate below 95%</li>
                    )}
                    {performance && performance.responseTime.p95 > 2000 && (
                      <li>• Performance optimization needed - P95 response time over 2s</li>
                    )}
                    {errorPatterns && errorPatterns.totalErrors > 10 && (
                      <li>• High error rate detected - review error patterns for common issues</li>
                    )}
                    {userBehavior && userBehavior.averageAttemptsPerUser > 3 && (
                      <li>• Users requiring multiple attempts - consider UX improvements</li>
                    )}
                    {overview && overview.rateLimitIncidents > 0 && (
                      <li>• Rate limiting incidents detected - monitor for abuse patterns</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Freshness Info */}
            <div className="text-center text-sm text-gray-500 py-4">
              <p>
                📅 Data generated: {overview.generatedAt ? new Date(overview.generatedAt).toLocaleString() : 'Unknown'}
                {' | '}
                🔄 Auto-refresh every 5 minutes
                {' | '}
                📊 Time range: {overview.timeRange}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default AnalyticsDashboard
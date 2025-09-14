/**
 * Analytics Chart Components
 * Created: September 14, 2025
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface LineChartData {
  label: string
  value: number
  timestamp?: string
}

interface OverviewStatsProps {
  data: {
    totalRequests: number
    successfulSends: number
    successfulVerifications: number
    sendSuccessRate: string
    averageResponseTime: number
    rateLimitIncidents: number
    timeRange: string
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple'
}

interface SimpleBarChartProps {
  data: ChartData[]
  title: string
  description?: string
  height?: number
}

interface SimpleLineChartProps {
  data: LineChartData[]
  title: string
  description?: string
  height?: number
}

/**
 * Metric Card Component
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  color = 'blue'
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'text-green-600 border-green-200 bg-green-50'
      case 'red': return 'text-red-600 border-red-200 bg-red-50'
      case 'yellow': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'purple': return 'text-purple-600 border-purple-200 bg-purple-50'
      default: return 'text-blue-600 border-blue-200 bg-blue-50'
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↗️'
    if (trend === 'down') return '↘️'
    return '→'
  }

  return (
    <Card className={`${getColorClass()} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {title}
          {trend && <span className="ml-2">{getTrendIcon()}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Overview Stats Component
 */
export const OverviewStats: React.FC<OverviewStatsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title="Total Requests"
        value={data.totalRequests.toLocaleString()}
        description={`in last ${data.timeRange}`}
        color="blue"
      />
      
      <MetricCard
        title="Success Rate"
        value={`${data.sendSuccessRate}%`}
        description={`${data.successfulSends} successful sends`}
        color={parseFloat(data.sendSuccessRate) > 95 ? 'green' : 
               parseFloat(data.sendSuccessRate) > 90 ? 'yellow' : 'red'}
        trend={parseFloat(data.sendSuccessRate) > 95 ? 'up' : 
               parseFloat(data.sendSuccessRate) < 90 ? 'down' : 'neutral'}
      />
      
      <MetricCard
        title="Avg Response Time"
        value={`${data.averageResponseTime}ms`}
        description="API response time"
        color={data.averageResponseTime < 500 ? 'green' : 
               data.averageResponseTime < 1000 ? 'yellow' : 'red'}
      />
      
      <MetricCard
        title="Verifications"
        value={data.successfulVerifications.toLocaleString()}
        description="Successful OTP verifications"
        color="green"
      />
      
      <MetricCard
        title="Rate Limits"
        value={data.rateLimitIncidents}
        description="Rate limit incidents"
        color={data.rateLimitIncidents === 0 ? 'green' : 'red'}
      />
      
      <MetricCard
        title="Time Range"
        value={data.timeRange}
        description="Analytics period"
        color="purple"
      />
    </div>
  )
}

/**
 * Simple Bar Chart Component
 */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  description,
  height = 300
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 text-right">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    item.color === 'red' ? 'bg-red-500' :
                    item.color === 'yellow' ? 'bg-yellow-500' :
                    item.color === 'green' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-right">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Simple Line Chart Component
 */
export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  description,
  height = 300
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Data line */}
            {data.length > 1 && (
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100
                  const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 80
                  return `${x}%,${y}%`
                }).join(' ')}
              />
            )}
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 80
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${point.label}: ${point.value}`}</title>
                </circle>
              )
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-10">
            <span>{maxValue.toLocaleString()}</span>
            <span>{Math.round((maxValue + minValue) / 2).toLocaleString()}</span>
            <span>{minValue.toLocaleString()}</span>
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
            {data.map((point, index) => (
              <span key={index} className="text-center">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Error Pattern Display
 */
interface ErrorPatternsProps {
  data: {
    totalErrors: number
    uniqueErrorTypes: number
    topErrors: Array<{
      code: string
      count: number
      lastSeen: string
      eventTypes: string[]
    }>
  }
}

export const ErrorPatterns: React.FC<ErrorPatternsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Patterns</CardTitle>
        <CardDescription>
          {data.totalErrors} total errors, {data.uniqueErrorTypes} unique types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.topErrors.map((error, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-red-600">{error.code}</div>
                <div className="text-sm text-gray-500">
                  Last seen: {new Date(error.lastSeen).toLocaleString()}
                </div>
                <div className="flex gap-1 mt-1">
                  {error.eventTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{error.count}</div>
                <div className="text-xs text-gray-500">occurrences</div>
              </div>
            </div>
          ))}
          
          {data.topErrors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              🎉 No errors found in the selected time period!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Real-time Status Component
 */
interface RealTimeStatusProps {
  isLive: boolean
  lastUpdate: string
  onRefresh: () => void
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
  isLive,
  lastUpdate,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm font-medium">
          {isLive ? 'Live Data' : 'Offline'}
        </span>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdate).toLocaleString()}
        </span>
      </div>
      
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        🔄 Refresh
      </button>
    </div>
  )
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity,
  Database,
  Zap,
  TrendingUp,
  Clock,
  Server,
  MemoryStick,
  CheckCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';

/**
 * Performance Dashboard Component
 * Phase 5.1: Database Optimization and Caching
 * 
 * Real-time monitoring of:
 * - Database performance metrics
 * - Cache hit rates and efficiency
 * - Connection pool utilization
 * - Query optimization results
 * - System resource usage
 */

interface PerformanceMetrics {
  totalRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  poolUtilization: number;
  queryOptimizations: number;
  errorRate: number;
  uptime: number;
}

interface ConnectionPoolStats {
  activeConnections: number;
  maxConnections: number;
  idleConnections: number;
  totalCreated: number;
  totalDestroyed: number;
  utilization: number;
}

interface CacheStatistics {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  maxSize: number;
  hitRate: number;
}

interface QueryPerformance {
  query: string;
  averageTime: number;
  executionCount: number;
  cacheHits: number;
  optimized: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  lastUpdated: Date;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [connectionStats, setConnectionStats] = useState<ConnectionPoolStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStatistics | null>(null);
  const [queryPerf, setQueryPerf] = useState<QueryPerformance[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Mock data for development - replace with actual API calls
  const mockMetrics: PerformanceMetrics = {
    totalRequests: 15847,
    cacheHitRate: 84.5,
    averageResponseTime: 245,
    poolUtilization: 67.8,
    queryOptimizations: 1247,
    errorRate: 1.2,
    uptime: 99.97
  };

  const mockConnectionStats: ConnectionPoolStats = {
    activeConnections: 14,
    maxConnections: 20,
    idleConnections: 6,
    totalCreated: 156,
    totalDestroyed: 142,
    utilization: 70.0
  };

  const mockCacheStats: CacheStatistics = {
    hits: 13421,
    misses: 2426,
    evictions: 45,
    totalSize: 850,
    maxSize: 1000,
    hitRate: 84.7
  };

  const mockQueryPerf: QueryPerformance[] = [
    { query: 'SELECT OTP verification', averageTime: 15, executionCount: 8934, cacheHits: 7123, optimized: true },
    { query: 'INSERT OTP generation', averageTime: 28, executionCount: 6421, cacheHits: 0, optimized: true },
    { query: 'UPDATE rate limits', averageTime: 22, executionCount: 3214, cacheHits: 2156, optimized: true },
    { query: 'SELECT audit logs', averageTime: 45, executionCount: 1842, cacheHits: 1654, optimized: false },
  ];

  const mockSystemHealth: SystemHealth = {
    status: 'healthy',
    uptime: 99.97,
    memoryUsage: 68.4,
    cpuUsage: 23.7,
    lastUpdated: new Date()
  };

  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // In production, replace with actual API calls
      setTimeout(() => {
        setMetrics(mockMetrics);
        setConnectionStats(mockConnectionStats);
        setCacheStats(mockCacheStats);
        setQueryPerf(mockQueryPerf);
        setSystemHealth(mockSystemHealth);
        setIsLoading(false);
      }, 1000);

      // TODO: Replace with actual API calls
      // const response = await fetch('/api/performance/metrics');
      // const data = await response.json();
      // setMetrics(data.metrics);
      // setConnectionStats(data.connectionPool);
      // setCacheStats(data.memoryCache);
      
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setIsLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Performance status indicators
  const getHealthStatus = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'critical';
    if (value >= thresholds[0]) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Performance chart data
  const responseTimeData = [
    { time: '14:00', responseTime: 234, cacheHit: 156, dbQuery: 78 },
    { time: '14:05', responseTime: 245, cacheHit: 189, dbQuery: 56 },
    { time: '14:10', responseTime: 198, cacheHit: 167, dbQuery: 31 },
    { time: '14:15', responseTime: 267, cacheHit: 134, dbQuery: 133 },
    { time: '14:20', responseTime: 223, cacheHit: 145, dbQuery: 78 },
    { time: '14:25', responseTime: 234, cacheHit: 178, dbQuery: 56 },
  ];

  const cachePerformanceData = [
    { name: 'Cache Hits', value: cacheStats?.hits || 0, color: '#10B981' },
    { name: 'Cache Misses', value: cacheStats?.misses || 0, color: '#F59E0B' },
    { name: 'Evictions', value: cacheStats?.evictions || 0, color: '#EF4444' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCcw className="w-6 h-6 animate-spin" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">Phase 5.1: Database Optimization & Caching Monitor</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
            disabled={isLoading}
          >
            <RefreshCcw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          <Badge 
            className={`${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
                  {systemHealth.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemHealth.uptime}%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemHealth.memoryUsage}%</div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemHealth.cpuUsage}%</div>
                <div className="text-sm text-gray-600">CPU Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cacheHitRate}%</div>
            <div className="flex items-center">
              <Badge className={getStatusBadge(getHealthStatus(metrics?.cacheHitRate || 0, [70, 90]))}>
                {getHealthStatus(metrics?.cacheHitRate || 0, [70, 90])}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageResponseTime}ms</div>
            <div className="flex items-center">
              <Badge className={getStatusBadge(getHealthStatus(metrics?.averageResponseTime || 0, [500, 1000]))}>
                {getHealthStatus(metrics?.averageResponseTime || 0, [500, 1000])}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Utilization</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.poolUtilization}%</div>
            <div className="flex items-center">
              <Badge className={getStatusBadge(getHealthStatus(metrics?.poolUtilization || 0, [80, 95]))}>
                {getHealthStatus(metrics?.poolUtilization || 0, [80, 95])}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Charts</TabsTrigger>
          <TabsTrigger value="database">Database Pool</TabsTrigger>
          <TabsTrigger value="cache">Memory Cache</TabsTrigger>
          <TabsTrigger value="queries">Query Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Real-time performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Total Response Time"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cacheHit" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Cache Hit Response"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dbQuery" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Database Query Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Connection Pool Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Active Connections</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {connectionStats?.activeConnections}/{connectionStats?.maxConnections}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Idle Connections</div>
                    <div className="text-2xl font-bold text-green-600">
                      {connectionStats?.idleConnections}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Created</div>
                    <div className="text-xl font-semibold">{connectionStats?.totalCreated}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Destroyed</div>
                    <div className="text-xl font-semibold">{connectionStats?.totalDestroyed}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Pool Utilization</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${connectionStats?.utilization}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{connectionStats?.utilization}%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Pool Health</span>
                    <Badge className={getStatusBadge(getHealthStatus(connectionStats?.utilization || 0, [80, 95]))}>
                      {getHealthStatus(connectionStats?.utilization || 0, [80, 95])}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Connection Leaks</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-600">None Detected</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Average Wait Time</span>
                    <span className="font-semibold">12ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MemoryStick className="w-5 h-5 mr-2" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cachePerformanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {cachePerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Cache Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Hit Rate</div>
                    <div className="text-2xl font-bold text-green-600">{cacheStats?.hitRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Hits</div>
                    <div className="text-2xl font-bold">{cacheStats?.hits?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Misses</div>
                    <div className="text-xl font-semibold">{cacheStats?.misses?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Evictions</div>
                    <div className="text-xl font-semibold">{cacheStats?.evictions}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Memory Usage</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${((cacheStats?.totalSize || 0) / (cacheStats?.maxSize || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {cacheStats?.totalSize}/{cacheStats?.maxSize} items
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Query Performance Analysis</CardTitle>
              <CardDescription>Database query optimization results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queryPerf.map((query, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{query.query}</h4>
                      <div className="flex items-center space-x-2">
                        {query.optimized ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Optimized
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Can Optimize
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Avg Time</div>
                        <div className="font-semibold">{query.averageTime}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Executions</div>
                        <div className="font-semibold">{query.executionCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Cache Hits</div>
                        <div className="font-semibold">{query.cacheHits.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Cache Rate</div>
                        <div className="font-semibold">
                          {query.executionCount > 0 ? ((query.cacheHits / query.executionCount) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
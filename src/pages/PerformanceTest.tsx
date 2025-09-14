/**
 * Performance Test Page Component
 * Interactive UI for running performance tests
 */

import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SimplePerformanceTest, type PerformanceResult } from '../test/simplePerformanceTest';

interface TestResults {
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    averageResponseTime: number;
    testDuration: number;
  };
  byOperation: Record<string, {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
    errors: string[];
  }>;
  performance_insights: string[];
  recommendations: string[];
}

const PerformanceTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    }, 100);
  };

  const runPerformanceTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setResults(null);
    setLogs([]);
    addLog('🚀 Starting Performance Tests...');

    const tester = new SimplePerformanceTest();
    
    try {
      // Test 1: Database Basics (25%)
      setCurrentTest('Testing Database Basic Operations...');
      addLog('🗄️ Testing Database Basic Operations...');
      await tester.testDatabaseBasics(3);
      setProgress(25);

      // Test 2: OTP Operations (50%)
      setCurrentTest('Testing OTP Operations...');
      addLog('📱 Testing OTP Operations...');
      await tester.testOTPOperations(2);
      setProgress(50);

      // Test 3: Table Performance (75%)
      setCurrentTest('Testing Table Performance...');
      addLog('📊 Testing Table Performance...');
      await tester.testTablePerformance();
      setProgress(75);

      // Test 4: Concurrent Access (100%)
      setCurrentTest('Testing Concurrent Access...');
      addLog('👥 Testing Concurrent Access...');
      await tester.testConcurrentAccess(3);
      setProgress(100);

      // Generate Report
      addLog('📋 Generating Report...');
      const report = tester.generateReport();
      setResults(report);
      
      addLog('✅ All tests completed successfully!');
      setCurrentTest('Tests completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Test failed: ${errorMessage}`);
      setCurrentTest('Tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceColor = (avgTime: number): string => {
    if (avgTime < 100) return 'bg-green-500';
    if (avgTime < 300) return 'bg-blue-500';
    if (avgTime < 1000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceText = (avgTime: number): string => {
    if (avgTime < 100) return 'Excellent';
    if (avgTime < 300) return 'Good';
    if (avgTime < 1000) return 'Fair';
    return 'Needs Optimization';
  };

  const getInsightEmoji = (insight: string): string => {
    if (insight.includes('✅')) return '✅';
    if (insight.includes('⚡')) return '⚡';
    if (insight.includes('⚠️')) return '⚠️';
    if (insight.includes('🐌')) return '🐌';
    return '📊';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OTP System Performance Testing</h1>
        <p className="text-muted-foreground">
          Test your OTP system performance to identify bottlenecks and optimization opportunities
        </p>
      </div>

      {/* Test Control */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Test Control</CardTitle>
          <CardDescription>
            Run comprehensive performance tests on your OTP system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runPerformanceTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Testing in Progress...' : '🚀 Start Performance Tests'}
          </Button>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentTest}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Test Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{results.summary.totalTests}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{results.summary.successfulTests}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{results.summary.failedTests}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{results.summary.averageResponseTime.toFixed(1)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={getPerformanceColor(results.summary.averageResponseTime)}>
                    {getPerformanceText(results.summary.averageResponseTime)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Average response time: {results.summary.averageResponseTime.toFixed(2)}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Results Tab */}
          <TabsContent value="detailed" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(results.byOperation).map(([operation, stats]) => (
                <Card key={operation}>
                  <CardHeader>
                    <CardTitle className="text-lg">{operation}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Count</div>
                        <div className="text-muted-foreground">{stats.count}</div>
                      </div>
                      <div>
                        <div className="font-medium">Average</div>
                        <div className="text-muted-foreground">{stats.averageTime.toFixed(2)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Min</div>
                        <div className="text-muted-foreground">{stats.minTime.toFixed(2)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Max</div>
                        <div className="text-muted-foreground">{stats.maxTime.toFixed(2)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Success Rate</div>
                        <div className="text-muted-foreground">{stats.successRate.toFixed(1)}%</div>
                      </div>
                    </div>
                    {stats.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium text-red-600">Errors:</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.errors.join(', ')}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Analysis of your system's performance characteristics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.performance_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 rounded bg-muted/50">
                    <span className="text-lg">{getInsightEmoji(insight)}</span>
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  Suggested improvements based on test results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.recommendations.length > 0 ? (
                  results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 rounded border-l-4 border-orange-500 bg-orange-50">
                      <span className="text-lg">💡</span>
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 p-3 rounded border-l-4 border-green-500 bg-green-50">
                    <span className="text-lg">✅</span>
                    <span className="text-sm">No performance issues detected! Your system is performing well.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logsRef}
            className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto"
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">Click "Start Performance Tests" to begin...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTestPage;
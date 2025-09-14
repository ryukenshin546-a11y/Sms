/**
 * Database Connection Pool Manager
 * Optimizes database connections for better performance and scalability
 * Created: September 14, 2025
 */

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'

interface PoolConfig {
  maxConnections: number
  idleTimeout: number
  connectionTimeout: number
  retryAttempts: number
}

interface ConnectionStats {
  activeConnections: number
  idleConnections: number
  totalCreated: number
  totalErrors: number
  averageResponseTime: number
}

interface PooledConnection {
  client: SupabaseClient
  id: string
  createdAt: number
  lastUsed: number
  inUse: boolean
  errorCount: number
}

class DatabaseConnectionPool {
  private pool: PooledConnection[] = []
  private config: PoolConfig
  private supabaseUrl: string
  private supabaseKey: string
  private stats: ConnectionStats
  private cleanupTimer?: number

  constructor(supabaseUrl: string, supabaseKey: string, config: Partial<PoolConfig> = {}) {
    this.supabaseUrl = supabaseUrl
    this.supabaseKey = supabaseKey
    this.config = {
      maxConnections: config.maxConnections || 10,
      idleTimeout: config.idleTimeout || 60000, // 1 minute
      connectionTimeout: config.connectionTimeout || 5000, // 5 seconds
      retryAttempts: config.retryAttempts || 3
    }
    this.stats = {
      activeConnections: 0,
      idleConnections: 0,
      totalCreated: 0,
      totalErrors: 0,
      averageResponseTime: 0
    }

    // Start cleanup timer
    this.startCleanupTimer()
    console.log('🔄 Database Connection Pool initialized:', {
      maxConnections: this.config.maxConnections,
      idleTimeout: this.config.idleTimeout
    })
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<{ connection: PooledConnection; release: () => void }> {
    const startTime = Date.now()

    try {
      // Try to get an idle connection
      let connection = this.getIdleConnection()
      
      if (!connection) {
        // Create new connection if under limit
        if (this.pool.length < this.config.maxConnections) {
          connection = await this.createConnection()
        } else {
          // Wait for a connection to become available
          connection = await this.waitForConnection()
        }
      }

      // Mark as in use
      connection.inUse = true
      connection.lastUsed = Date.now()
      this.updateStats()

      const responseTime = Date.now() - startTime
      this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2

      console.log(`🔗 Connection acquired: ${connection.id} (${responseTime}ms)`)

      return {
        connection,
        release: () => this.releaseConnection(connection)
      }

    } catch (error) {
      this.stats.totalErrors++
      console.error('❌ Failed to get database connection:', error)
      throw error
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async execute<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T> {
    const { connection, release } = await this.getConnection()
    
    try {
      const result = await operation(connection.client)
      return result
    } catch (error) {
      connection.errorCount++
      throw error
    } finally {
      release()
    }
  }

  /**
   * Get idle connection from pool
   */
  private getIdleConnection(): PooledConnection | null {
    return this.pool.find(conn => !conn.inUse) || null
  }

  /**
   * Create new connection
   */
  private async createConnection(): Promise<PooledConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const client = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const connection: PooledConnection = {
        client,
        id: connectionId,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        errorCount: 0
      }

      this.pool.push(connection)
      this.stats.totalCreated++

      console.log(`✅ New database connection created: ${connectionId}`)
      return connection

    } catch (error) {
      this.stats.totalErrors++
      console.error(`❌ Failed to create connection ${connectionId}:`, error)
      throw error
    }
  }

  /**
   * Wait for connection to become available
   */
  private async waitForConnection(): Promise<PooledConnection> {
    const timeout = this.config.connectionTimeout
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkForConnection = () => {
        const idleConnection = this.getIdleConnection()
        
        if (idleConnection) {
          resolve(idleConnection)
          return
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Connection timeout after ${timeout}ms`))
          return
        }

        // Check again in 10ms
        setTimeout(checkForConnection, 10)
      }

      checkForConnection()
    })
  }

  /**
   * Release connection back to pool
   */
  private releaseConnection(connection: PooledConnection): void {
    connection.inUse = false
    connection.lastUsed = Date.now()
    this.updateStats()
    
    console.log(`🔄 Connection released: ${connection.id}`)
  }

  /**
   * Update connection statistics
   */
  private updateStats(): void {
    this.stats.activeConnections = this.pool.filter(conn => conn.inUse).length
    this.stats.idleConnections = this.pool.filter(conn => !conn.inUse).length
  }

  /**
   * Start cleanup timer for idle connections
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleConnections()
    }, 30000) // Clean up every 30 seconds
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now()
    const before = this.pool.length

    this.pool = this.pool.filter(connection => {
      const idleTime = now - connection.lastUsed
      const shouldRemove = !connection.inUse && idleTime > this.config.idleTimeout

      if (shouldRemove) {
        console.log(`🧹 Removing idle connection: ${connection.id} (idle for ${idleTime}ms)`)
      }

      return !shouldRemove
    })

    const removed = before - this.pool.length
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} idle connections`)
      this.updateStats()
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): ConnectionStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * Close all connections and cleanup
   */
  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    console.log(`🔒 Closing ${this.pool.length} database connections`)
    this.pool = []
    this.updateStats()
  }
}

// Global pool instance
let globalPool: DatabaseConnectionPool | null = null

/**
 * Get or create global connection pool
 */
export function getConnectionPool(supabaseUrl?: string, supabaseKey?: string): DatabaseConnectionPool {
  if (!globalPool && supabaseUrl && supabaseKey) {
    globalPool = new DatabaseConnectionPool(supabaseUrl, supabaseKey, {
      maxConnections: 15,
      idleTimeout: 120000, // 2 minutes
      connectionTimeout: 8000 // 8 seconds
    })
  }

  if (!globalPool) {
    throw new Error('Database connection pool not initialized')
  }

  return globalPool
}

/**
 * Execute database operation with connection pooling
 */
export async function executeWithPool<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<T> {
  const pool = getConnectionPool(supabaseUrl, supabaseKey)
  return pool.execute(operation)
}

export { DatabaseConnectionPool }
export type { PoolConfig, ConnectionStats, PooledConnection }
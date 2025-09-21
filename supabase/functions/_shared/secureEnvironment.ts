// Security Configuration Manager
// Created: September 21, 2025
// Purpose: Secure handling of environment variables and secrets

/// <reference types="https://deno.land/x/types/index.d.ts" />

interface SMSUpCredentials {
  username: string
  password: string
}

interface EncryptionConfig {
  key: string
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
}

interface SecurityConfig {
  smsUp: SMSUpCredentials
  encryption: EncryptionConfig
  rateLimit: RateLimitConfig
  production: boolean
}

/**
 * Secure configuration manager for SMS system
 * Handles environment variables, secrets, and security settings
 */
export class SecureEnvironmentManager {
  private config: SecurityConfig | null = null
  
  /**
   * Initialize configuration from environment variables
   */
  async initialize(): Promise<void> {
    try {
      this.config = {
        smsUp: {
          username: this.getRequiredEnv('SMS_UP_PLUS_USERNAME'),
          password: this.getRequiredEnv('SMS_UP_PLUS_PASSWORD')
        },
        encryption: {
          key: this.getRequiredEnv('SMS_CREDENTIAL_ENCRYPTION_KEY')
        },
        rateLimit: {
          windowMs: parseInt(this.getEnv('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
          maxRequests: parseInt(this.getEnv('RATE_LIMIT_MAX_REQUESTS', '10')),
          skipSuccessfulRequests: false
        },
        production: this.getEnv('ENVIRONMENT', 'development') === 'production'
      }

      // Validate configuration
      await this.validateConfiguration()
      
      console.log('✅ Secure environment configuration initialized')
    } catch (error) {
      console.error('❌ Failed to initialize secure environment:', error)
      throw new Error('Security configuration initialization failed')
    }
  }

  /**
   * Get SMS-UP Plus credentials
   */
  getSMSUpCredentials(): SMSUpCredentials {
    this.ensureInitialized()
    return { ...this.config!.smsUp } // Return copy to prevent modification
  }

  /**
   * Get encryption configuration
   */
  getEncryptionConfig(): EncryptionConfig {
    this.ensureInitialized()
    return { ...this.config!.encryption }
  }

  /**
   * Get rate limiting configuration
   */
  getRateLimitConfig(): RateLimitConfig {
    this.ensureInitialized()
    return { ...this.config!.rateLimit }
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    this.ensureInitialized()
    return this.config!.production
  }

  /**
   * Get required environment variable
   */
  private getRequiredEnv(key: string): string {
    const value = Deno.env.get(key)
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value
  }

  /**
   * Get optional environment variable with default
   */
  private getEnv(key: string, defaultValue: string): string {
    return Deno.env.get(key) || defaultValue
  }

  /**
   * Validate configuration values
   */
  private async validateConfiguration(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not initialized')
    }

    // Validate SMS-UP credentials
    if (this.config.smsUp.username.length < 3) {
      throw new Error('SMS-UP username is too short')
    }

    if (this.config.smsUp.password.length < 8) {
      throw new Error('SMS-UP password is too weak')
    }

    // Validate encryption key (should be 64 hex characters for 256-bit key)
    if (!/^[0-9a-fA-F]{64}$/.test(this.config.encryption.key)) {
      throw new Error('Encryption key must be a 64-character hex string (256-bit)')
    }

    // Validate rate limiting
    if (this.config.rateLimit.windowMs < 60000) { // Minimum 1 minute
      throw new Error('Rate limit window must be at least 1 minute')
    }

    if (this.config.rateLimit.maxRequests < 1) {
      throw new Error('Max requests must be at least 1')
    }
  }

  /**
   * Ensure configuration is initialized
   */
  private ensureInitialized(): void {
    if (!this.config) {
      throw new Error('SecureEnvironmentManager not initialized. Call initialize() first.')
    }
  }

  /**
   * Get sanitized configuration for logging
   */
  getSanitizedConfig(): any {
    this.ensureInitialized()
    
    return {
      smsUp: {
        username: this.config!.smsUp.username, // Username is not sensitive
        password: '***REDACTED***'
      },
      encryption: {
        key: '***REDACTED***'
      },
      rateLimit: { ...this.config!.rateLimit },
      production: this.config!.production
    }
  }

  /**
   * Generate new encryption key (for initial setup)
   */
  static generateEncryptionKey(): string {
    const key = crypto.getRandomValues(new Uint8Array(32)) // 256 bits
    return Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate environment setup and provide setup instructions
   */
  static validateEnvironmentSetup(): { valid: boolean; missing: string[]; instructions: string[] } {
    const required = [
      'SMS_UP_PLUS_USERNAME',
      'SMS_UP_PLUS_PASSWORD', 
      'SMS_CREDENTIAL_ENCRYPTION_KEY'
    ]

    const missing = required.filter(key => !Deno.env.get(key))
    
    const instructions = []
    
    if (missing.includes('SMS_CREDENTIAL_ENCRYPTION_KEY')) {
      const newKey = SecureEnvironmentManager.generateEncryptionKey()
      instructions.push(`Set SMS_CREDENTIAL_ENCRYPTION_KEY=${newKey}`)
    }

    if (missing.includes('SMS_UP_PLUS_USERNAME')) {
      instructions.push('Set SMS_UP_PLUS_USERNAME to your SMS-UP Plus username')
    }

    if (missing.includes('SMS_UP_PLUS_PASSWORD')) {
      instructions.push('Set SMS_UP_PLUS_PASSWORD to your SMS-UP Plus password')
    }

    return {
      valid: missing.length === 0,
      missing,
      instructions
    }
  }
}

// Export singleton instance
export const secureEnvironment = new SecureEnvironmentManager()

// Initialize on module load in production
if (Deno.env.get('ENVIRONMENT') === 'production') {
  secureEnvironment.initialize().catch(error => {
    console.error('❌ Critical: Failed to initialize secure environment in production:', error)
    Deno.exit(1)
  })
}
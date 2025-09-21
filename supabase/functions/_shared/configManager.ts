/**
 * Environment Configuration และ Secrets Management
 * สำหรับจัดการข้อมูลสำคัญอย่างปลอดภัย
 */

export interface EnvironmentConfig {
  // Environment info
  environment: 'development' | 'staging' | 'production';
  region: string;
  
  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  
  // SMS UP Plus configuration
  smsUpPlus: {
    baseUrl: string;
    username: string;
    password: string;
    allowedIP: string;
  };
  
  // Security configuration
  security: {
    encryptionKey: string;
    jwtSecret: string;
    corsOrigins: string[];
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
  };
  
  // Logging configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableAudit: boolean;
    retentionDays: number;
  };
}

/**
 * Configuration Manager - จัดการ environment variables อย่างปลอดภัย
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: EnvironmentConfig;
  
  private constructor() {
    this.config = this.loadConfiguration();
  }
  
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  /**
   * Load configuration จาก environment variables
   */
  private loadConfiguration(): EnvironmentConfig {
    // ตรวจสอบ required environment variables
    this.validateRequiredEnvVars();
    
    return {
      environment: (Deno.env.get('ENVIRONMENT') as any) || 'development',
      region: Deno.env.get('SUPABASE_REGION') || 'ap-southeast-1',
      
      supabase: {
        url: this.getRequiredEnv('SUPABASE_URL'),
        anonKey: this.getRequiredEnv('SUPABASE_CLIENT_API_KEY'),
        serviceKey: this.getRequiredEnv('SUPABASE_SERVICE_KEY'),
      },
      
      smsUpPlus: {
        baseUrl: this.getRequiredEnv('SMS_UP_PLUS_URL', 'https://web.smsup-plus.com'),
        username: this.getRequiredEnv('SMS_UP_PLUS_USERNAME'),
        password: this.getRequiredEnv('SMS_UP_PLUS_PASSWORD'),
        allowedIP: this.getRequiredEnv('SMS_UP_PLUS_IP'),
      },
      
      security: {
        encryptionKey: this.getRequiredEnv('ENCRYPTION_KEY'),
        jwtSecret: this.getRequiredEnv('JWT_SECRET'),
        corsOrigins: this.parseCorsOrigins(Deno.env.get('CORS_ORIGINS') || '*'),
        rateLimiting: {
          enabled: Deno.env.get('RATE_LIMITING_ENABLED') === 'true',
          windowMs: parseInt(Deno.env.get('RATE_LIMITING_WINDOW_MS') || '60000'),
          maxRequests: parseInt(Deno.env.get('RATE_LIMITING_MAX_REQUESTS') || '10'),
        },
      },
      
      logging: {
        level: (Deno.env.get('LOG_LEVEL') as any) || 'info',
        enableAudit: Deno.env.get('ENABLE_AUDIT_LOGGING') !== 'false',
        retentionDays: parseInt(Deno.env.get('LOG_RETENTION_DAYS') || '90'),
      },
    };
  }
  
  /**
   * Get required environment variable with optional default
   */
  private getRequiredEnv(key: string, defaultValue?: string): string {
    const value = Deno.env.get(key) || defaultValue;
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }
  
  /**
   * Parse CORS origins from string
   */
  private parseCorsOrigins(corsString: string): string[] {
    if (corsString === '*') {
      return ['*'];
    }
    return corsString.split(',').map(origin => origin.trim());
  }
  
  /**
   * Validate required environment variables
   */
  private validateRequiredEnvVars(): void {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_CLIENT_API_KEY', 
      'SUPABASE_SERVICE_KEY',
      'SMS_UP_PLUS_USERNAME',
      'SMS_UP_PLUS_PASSWORD',
      'SMS_UP_PLUS_IP',
      'ENCRYPTION_KEY',
      'JWT_SECRET',
    ];
    
    const missing = required.filter(key => !Deno.env.get(key));
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  /**
   * Get configuration
   */
  public getConfig(): EnvironmentConfig {
    return this.config;
  }
  
  /**
   * Get specific configuration section
   */
  public getSupabaseConfig() {
    return this.config.supabase;
  }
  
  public getSMSUpPlusConfig() {
    return this.config.smsUpPlus;
  }
  
  public getSecurityConfig() {
    return this.config.security;
  }
  
  public getLoggingConfig() {
    return this.config.logging;
  }
  
  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.config.environment === 'production';
  }
  
  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }
  
  /**
   * Mask sensitive data for logging
   */
  public maskSensitiveData(data: any): any {
    const masked = { ...data };
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'serviceKey'];
    
    for (const key in masked) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        if (typeof masked[key] === 'string' && masked[key].length > 8) {
          masked[key] = masked[key].substring(0, 4) + '***' + masked[key].substring(masked[key].length - 4);
        } else {
          masked[key] = '***';
        }
      }
    }
    
    return masked;
  }
}

/**
 * Helper function to get config instance
 */
export function getConfig(): EnvironmentConfig {
  return ConfigManager.getInstance().getConfig();
}

/**
 * Helper functions for specific configs
 */
export function getSupabaseConfig() {
  return ConfigManager.getInstance().getSupabaseConfig();
}

export function getSMSUpPlusConfig() {
  return ConfigManager.getInstance().getSMSUpPlusConfig();
}

export function getSecurityConfig() {
  return ConfigManager.getInstance().getSecurityConfig();
}

export function getLoggingConfig() {
  return ConfigManager.getInstance().getLoggingConfig();
}
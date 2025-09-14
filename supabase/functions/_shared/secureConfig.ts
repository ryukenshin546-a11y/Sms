/**
 * Secure Configuration Management for OTP System
 * Version: 2.3
 * Date: September 14, 2025
 */

export interface SecureConfig {
  // SMS UP Plus API Configuration
  smsUpPlus: {
    apiUrl: string;
    tokenEndpoint: string;
    otpEndpoint: string;
    verifyEndpoint: string;
  };
  
  // Encryption Configuration
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
  
  // Security Settings
  security: {
    tokenExpiry: number;
    maxRetries: number;
    encryptionEnabled: boolean;
  };
}

export class SecureConfigManager {
  private static instance: SecureConfigManager;
  private config: SecureConfig;
  
  private constructor() {
    this.config = {
      smsUpPlus: {
        apiUrl: this.getEnvVar('SMS_UP_PLUS_API_URL', 'https://web.smsup-plus.com'),
        tokenEndpoint: this.getEnvVar('SMS_UP_PLUS_TOKEN_ENDPOINT', '/api/Token'),
        otpEndpoint: this.getEnvVar('SMS_UP_PLUS_OTP_ENDPOINT', '/OTP/requestOTP'),
        verifyEndpoint: this.getEnvVar('SMS_UP_PLUS_VERIFY_ENDPOINT', '/OTP/verifyOTP'),
      },
      encryption: {
        algorithm: this.getEnvVar('ENCRYPTION_ALGORITHM', 'AES-256-GCM'),
        keySize: parseInt(this.getEnvVar('ENCRYPTION_KEY_SIZE', '32')),
        ivSize: parseInt(this.getEnvVar('ENCRYPTION_IV_SIZE', '12')),
      },
      security: {
        tokenExpiry: parseInt(this.getEnvVar('TOKEN_EXPIRY_MINUTES', '60')),
        maxRetries: parseInt(this.getEnvVar('MAX_RETRY_ATTEMPTS', '3')),
        encryptionEnabled: this.getEnvVar('ENCRYPTION_ENABLED', 'true') === 'true',
      }
    };
  }
  
  public static getInstance(): SecureConfigManager {
    if (!SecureConfigManager.instance) {
      SecureConfigManager.instance = new SecureConfigManager();
    }
    return SecureConfigManager.instance;
  }
  
  private getEnvVar(key: string, defaultValue: string): string {
    return Deno.env.get(key) || defaultValue;
  }
  
  public getConfig(): SecureConfig {
    return { ...this.config }; // Return copy to prevent mutation
  }
  
  public getSMSUpPlusCredentials(): { username: string; password: string } {
    const username = this.getSecureSecret('SMS_UP_PLUS_USERNAME');
    const password = this.getSecureSecret('SMS_UP_PLUS_PASSWORD');
    
    if (!username || !password) {
      throw new Error('SMS UP Plus credentials not configured properly');
    }
    
    return { username, password };
  }
  
  public getSupabaseCredentials(): { url: string; serviceKey: string } {
    const url = this.getSecureSecret('SUPABASE_URL');
    const serviceKey = this.getSecureSecret('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!url || !serviceKey) {
      throw new Error('Supabase credentials not configured properly');
    }
    
    return { url, serviceKey };
  }
  
  public getEncryptionKey(): string {
    const key = this.getSecureSecret('ENCRYPTION_MASTER_KEY');
    if (!key) {
      throw new Error('Encryption master key not configured');
    }
    return key;
  }
  
  private getSecureSecret(key: string): string | undefined {
    // First try to get from Deno environment
    let value = Deno.env.get(key);
    
    // If not found, try Supabase secrets (if available)
    if (!value) {
      value = this.getFromSupabaseVault(key);
    }
    
    return value;
  }
  
  private getFromSupabaseVault(key: string): string | undefined {
    // Placeholder for Supabase Vault integration
    // In production, this would connect to Supabase Vault API
    console.log(`Attempting to retrieve ${key} from Supabase Vault...`);
    return undefined;
  }
  
  public validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      this.getSMSUpPlusCredentials();
    } catch (error) {
      errors.push('SMS UP Plus credentials not configured');
    }
    
    try {
      this.getSupabaseCredentials();
    } catch (error) {
      errors.push('Supabase credentials not configured');
    }
    
    if (this.config.security.encryptionEnabled) {
      try {
        this.getEncryptionKey();
      } catch (error) {
        errors.push('Encryption key not configured');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  public sanitizeForLogging(): Partial<SecureConfig> {
    // Return config with sensitive data removed for safe logging
    return {
      smsUpPlus: {
        apiUrl: this.config.smsUpPlus.apiUrl,
        tokenEndpoint: this.config.smsUpPlus.tokenEndpoint,
        otpEndpoint: this.config.smsUpPlus.otpEndpoint,
        verifyEndpoint: this.config.smsUpPlus.verifyEndpoint,
      },
      encryption: this.config.encryption,
      security: {
        ...this.config.security,
        // Don't log actual values, just show if they're configured
      }
    };
  }
}
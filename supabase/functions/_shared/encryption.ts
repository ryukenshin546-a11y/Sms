// Security Utility: Proper Encryption for SMS Credentials
// Created: September 21, 2025

interface EncryptionResult {
  encrypted: string
  iv: string
}

interface DecryptionResult {
  decrypted: string
  success: boolean
  error?: string
}

/**
 * Secure encryption/decryption utility using Web Crypto API
 * Uses AES-256-GCM for strong encryption
 */
export class SecureCredentialManager {
  private readonly algorithm = 'AES-GCM'
  private readonly keyLength = 256

  /**
   * Get encryption key from environment variable
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    const keyString = Deno.env.get('SMS_CREDENTIAL_ENCRYPTION_KEY')
    
    if (!keyString) {
      throw new Error('SMS_CREDENTIAL_ENCRYPTION_KEY environment variable is required')
    }

    // Convert hex string to array buffer
    const keyData = new Uint8Array(keyString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Generate a new encryption key (for setup only)
   */
  static generateNewKey(): string {
    const key = crypto.getRandomValues(new Uint8Array(32)) // 256 bits
    return Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Encrypt sensitive data (passwords, tokens)
   */
  async encryptCredential(plaintext: string): Promise<EncryptionResult> {
    try {
      const key = await this.getEncryptionKey()
      const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )

      return {
        encrypted: Array.from(new Uint8Array(encrypted), byte => 
          byte.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv, byte => 
          byte.toString(16).padStart(2, '0')).join('')
      }
    } catch (error) {
      console.error('❌ Encryption failed:', error)
      throw new Error('Failed to encrypt credential')
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptCredential(encryptedHex: string, ivHex: string): Promise<DecryptionResult> {
    try {
      const key = await this.getEncryptionKey()
      
      // Convert hex strings back to arrays
      const encrypted = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encrypted
      )

      const decoder = new TextDecoder()
      const plaintext = decoder.decode(decrypted)

      return {
        decrypted: plaintext,
        success: true
      }
    } catch (error) {
      console.error('❌ Decryption failed:', error)
      return {
        decrypted: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown decryption error'
      }
    }
  }

  /**
   * Migrate from Base64 to proper encryption
   * For backwards compatibility during transition
   */
  async migrateFromBase64(base64Password: string): Promise<EncryptionResult> {
    try {
      // First decode base64
      const plaintext = atob(base64Password)
      // Then properly encrypt
      return await this.encryptCredential(plaintext)
    } catch (error) {
      console.error('❌ Base64 migration failed:', error)
      throw new Error('Failed to migrate from Base64 encoding')
    }
  }

  /**
   * Safe credential handling - never log actual values
   */
  static sanitizeCredentialForLogging(credential: any): any {
    if (typeof credential === 'string') {
      return credential.length > 0 ? '***REDACTED***' : 'empty'
    }
    
    if (typeof credential === 'object' && credential !== null) {
      const sanitized: any = {}
      
      for (const [key, value] of Object.entries(credential)) {
        if (this.isSensitiveKey(key)) {
          sanitized[key] = typeof value === 'string' && value.length > 0 ? '***REDACTED***' : value
        } else {
          sanitized[key] = value
        }
      }
      
      return sanitized
    }
    
    return credential
  }

  /**
   * Check if a key contains sensitive information
   */
  private static isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'pass', 'pwd', 'secret', 'token', 'key', 
      'credential', 'auth', 'final_password', 'encrypted'
    ]
    return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
  }
}

// Export singleton instance
export const credentialManager = new SecureCredentialManager()

// Utility functions for backward compatibility
export async function encryptPassword(password: string): Promise<EncryptionResult> {
  return credentialManager.encryptCredential(password)
}

export async function decryptPassword(encrypted: string, iv: string): Promise<DecryptionResult> {
  return credentialManager.decryptCredential(encrypted, iv)
}
/**
 * Data Encryption Utility for OTP System
 * Provides AES-256-GCM encryption for sensitive data
 * Version: 2.3
 * Date: September 14, 2025
 */

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface DecryptedData {
  data: string;
  success: boolean;
  error?: string;
}

export class DataEncryption {
  private algorithm = 'AES-GCM';
  private keyLength = 256;
  
  /**
   * Generate a new encryption key
   */
  public async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Import encryption key from base64 string
   */
  public async importKey(keyBase64: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyBase64);
    
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Export encryption key to base64 string
   */
  public async exportKey(key: CryptoKey): Promise<string> {
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(keyBuffer);
  }
  
  /**
   * Encrypt sensitive data
   */
  public async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    try {
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data
      const encodedData = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encodedData
      );
      
      // Split encrypted data and auth tag (GCM mode)
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encrypted = encryptedArray.slice(0, -16); // All but last 16 bytes
      const authTag = encryptedArray.slice(-16); // Last 16 bytes
      
      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Decrypt sensitive data
   */
  public async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<DecryptedData> {
    try {
      // Convert base64 back to arrays
      const encrypted = this.base64ToArrayBuffer(encryptedData.encrypted);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const authTag = this.base64ToArrayBuffer(encryptedData.authTag);
      
      // Combine encrypted data and auth tag for GCM
      const combinedBuffer = new Uint8Array(encrypted.byteLength + authTag.byteLength);
      combinedBuffer.set(new Uint8Array(encrypted), 0);
      combinedBuffer.set(new Uint8Array(authTag), encrypted.byteLength);
      
      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: new Uint8Array(iv),
        },
        key,
        combinedBuffer
      );
      
      const decryptedData = new TextDecoder().decode(decryptedBuffer);
      
      return {
        data: decryptedData,
        success: true,
      };
    } catch (error) {
      return {
        data: '',
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed',
      };
    }
  }
  
  /**
   * Encrypt phone number with consistent padding
   */
  public async encryptPhoneNumber(phoneNumber: string, key: CryptoKey): Promise<EncryptedData> {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    return await this.encrypt(normalizedPhone, key);
  }
  
  /**
   * Hash data for non-reversible storage (for indexing)
   */
  public async hashForIndex(data: string): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    return this.arrayBufferToBase64(hashBuffer);
  }
  
  /**
   * Generate secure random token
   */
  public generateSecureToken(length: number = 32): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(length));
    return this.arrayBufferToBase64(randomBytes);
  }
  
  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }
  
  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Secure Data Manager - High-level interface for encrypted data operations
 */
export class SecureDataManager {
  private encryption: DataEncryption;
  private masterKey: CryptoKey | null = null;
  
  constructor() {
    this.encryption = new DataEncryption();
  }
  
  /**
   * Initialize with master key
   */
  public async initialize(masterKeyBase64: string): Promise<void> {
    this.masterKey = await this.encryption.importKey(masterKeyBase64);
  }
  
  /**
   * Encrypt sensitive user data
   */
  public async encryptUserData(data: {
    phoneNumber?: string;
    userId?: string;
    otpId?: string;
  }): Promise<{ [key: string]: EncryptedData }> {
    if (!this.masterKey) {
      throw new Error('SecureDataManager not initialized');
    }
    
    const encrypted: { [key: string]: EncryptedData } = {};
    
    if (data.phoneNumber) {
      encrypted.phoneNumber = await this.encryption.encryptPhoneNumber(data.phoneNumber, this.masterKey);
    }
    
    if (data.userId) {
      encrypted.userId = await this.encryption.encrypt(data.userId, this.masterKey);
    }
    
    if (data.otpId) {
      encrypted.otpId = await this.encryption.encrypt(data.otpId, this.masterKey);
    }
    
    return encrypted;
  }
  
  /**
   * Decrypt sensitive user data
   */
  public async decryptUserData(encryptedData: { [key: string]: EncryptedData }): Promise<{ [key: string]: string }> {
    if (!this.masterKey) {
      throw new Error('SecureDataManager not initialized');
    }
    
    const decrypted: { [key: string]: string } = {};
    
    for (const [key, value] of Object.entries(encryptedData)) {
      const result = await this.encryption.decrypt(value, this.masterKey);
      if (result.success) {
        decrypted[key] = result.data;
      } else {
        console.error(`Failed to decrypt ${key}: ${result.error}`);
      }
    }
    
    return decrypted;
  }
  
  /**
   * Generate hash for searchable fields
   */
  public async generateSearchHash(data: string): Promise<string> {
    return await this.encryption.hashForIndex(data);
  }
}
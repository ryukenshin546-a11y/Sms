/**
 * Data Encryption Utility
 * เข้ารหัสและถอดรหัสข้อมูลสำคัญอย่างปลอดภัย
 */

export interface EncryptionOptions {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
}

/**
 * Encryption Service สำหรับเข้ารหัสข้อมูลสำคัญ
 */
export class EncryptionService {
  private encryptionKey: string;
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 12; // 96 bits for GCM

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
    this.validateKey();
  }

  /**
   * ตรวจสอบความถูกต้องของ encryption key
   */
  private validateKey(): void {
    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long');
    }
  }

  /**
   * สร้าง CryptoKey จาก string key
   */
  private async createCryptoKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.encryptionKey.substring(0, this.keyLength));
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * เข้ารหัสข้อมูล
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      
      // สร้าง initialization vector (IV)
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // สร้าง crypto key
      const key = await this.createCryptoKey();
      
      // เข้ารหัส
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );
      
      // รวม IV และ encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64
      return this.arrayBufferToBase64(combined);
      
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * ถอดรหัสข้อมูล
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      // Convert from base64
      const combined = this.base64ToArrayBuffer(encryptedData);
      
      // แยก IV และ encrypted data
      const iv = combined.slice(0, this.ivLength);
      const encrypted = combined.slice(this.ivLength);
      
      // สร้าง crypto key
      const key = await this.createCryptoKey();
      
      // ถอดรหัส
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encrypted
      );
      
      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
      
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash ข้อมูลด้วย SHA-256
   */
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * สร้าง secure random string
   */
  generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array).substring(0, length);
  }

  /**
   * เข้ารหัสเบอร์โทรศัพท์ (รองรับการค้นหาได้)
   */
  async encryptPhoneNumber(phoneNumber: string): Promise<{
    encrypted: string;
    searchHash: string;
  }> {
    const sanitized = this.sanitizePhoneNumber(phoneNumber);
    
    return {
      encrypted: await this.encrypt(sanitized),
      searchHash: await this.hash(sanitized) // สำหรับการค้นหา
    };
  }

  /**
   * ถอดรหัสเบอร์โทรศัพท์
   */
  async decryptPhoneNumber(encryptedPhone: string): Promise<string> {
    return await this.decrypt(encryptedPhone);
  }

  /**
   * ทำความสะอาดเบอร์โทรศัพท์
   */
  private sanitizePhoneNumber(phoneNumber: string): string {
    // ลบอักขระที่ไม่ใช่ตัวเลขและเครื่องหมาย +
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Mask sensitive data for display/logging
   */
  maskSensitiveData(data: string, showLength: number = 4): string {
    if (!data || data.length <= showLength * 2) {
      return '***';
    }
    
    const start = data.substring(0, showLength);
    const end = data.substring(data.length - showLength);
    return `${start}***${end}`;
  }
}

/**
 * Phone Number Encryption Helper
 */
export class PhoneEncryption {
  private encryptionService: EncryptionService;

  constructor(encryptionKey: string) {
    this.encryptionService = new EncryptionService(encryptionKey);
  }

  /**
   * เข้ารหัสเบอร์โทรสำหรับเก็บในฐานข้อมูล
   */
  async encryptForStorage(phoneNumber: string): Promise<{
    encrypted_phone: string;
    phone_hash: string;
    display_phone: string;
  }> {
    const { encrypted, searchHash } = await this.encryptionService.encryptPhoneNumber(phoneNumber);
    
    return {
      encrypted_phone: encrypted,
      phone_hash: searchHash,
      display_phone: this.encryptionService.maskSensitiveData(phoneNumber, 3)
    };
  }

  /**
   * ถอดรหัสเบอร์โทรจากฐานข้อมูล
   */
  async decryptFromStorage(encryptedPhone: string): Promise<string> {
    return await this.encryptionService.decryptPhoneNumber(encryptedPhone);
  }

  /**
   * สร้าง hash สำหรับการค้นหา
   */
  async createSearchHash(phoneNumber: string): Promise<string> {
    const sanitized = phoneNumber.replace(/[^\d+]/g, '');
    return await this.encryptionService.hash(sanitized);
  }
}

/**
 * Helper functions
 */
export async function createEncryptionService(encryptionKey?: string): Promise<EncryptionService> {
  // ใช้ encryption key จาก environment หรือสร้างใหม่
  const key = encryptionKey || await generateEncryptionKey();
  return new EncryptionService(key);
}

export async function generateEncryptionKey(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Data masking utilities
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 ? 
    local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : 
    '***';
  
  return `${maskedLocal}@${domain}`;
}

export function maskCreditCard(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 8) return '***';
  
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}
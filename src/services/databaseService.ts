// Database Models สำหรับ SMS Account Management

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  businessType?: string;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSAccount {
  id: string;
  userId: string;
  username: string;
  email: string;
  encryptedPassword: string;
  originalEmail: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface GenerationJob {
  id: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Database Operations (Mock implementations)
export class DatabaseService {
  // User operations
  static async getUserById(userId: string): Promise<User | null> {
    // Mock user data
    return {
      id: userId,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      email: 'somchai@example.com',
      phone: '0812345678',
      company: 'บริษัท ABC จำกัด',
      businessType: 'ค้าปลีก',
      creditBalance: 100,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date()
    };
  }

  static async updateUserCredits(userId: string, newBalance: number): Promise<void> {
    console.log(`💰 อัปเดตเครดิต User ${userId}: ${newBalance} เครดิต`);
  }

  // SMS Account operations
  static async getSMSAccountByUserId(userId: string): Promise<SMSAccount | null> {
    // Mock: บางครั้งมี SMS account บางครั้งไม่มี
    const hasAccount = Math.random() > 0.3;
    
    if (!hasAccount) return null;

    return {
      id: `sms_${userId}`,
      userId: userId,
      username: 'existing_user123',
      email: 'existing@gmail.com',
      encryptedPassword: 'encrypted_password_here',
      originalEmail: 'somchai@example.com',
      isActive: true,
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date(),
      lastUsed: new Date()
    };
  }

  static async createSMSAccount(smsAccountData: Omit<SMSAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<SMSAccount> {
    const newAccount: SMSAccount = {
      id: `sms_${Date.now()}`,
      ...smsAccountData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 สร้าง SMS Account:', newAccount.username);
    return newAccount;
  }

  static async updateSMSAccount(id: string, updates: Partial<SMSAccount>): Promise<void> {
    console.log(`🔄 อัปเดต SMS Account ${id}:`, updates);
  }

  static async deleteSMSAccount(id: string): Promise<void> {
    console.log(`🗑️ ลบ SMS Account ${id}`);
  }

  // Generation Job operations
  static async createGenerationJob(userId: string): Promise<GenerationJob> {
    const job: GenerationJob = {
      id: `job_${userId}_${Date.now()}`,
      userId: userId,
      status: 'pending',
      progress: 0,
      currentStep: 'เตรียมระบบ',
      startedAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    console.log('🚀 สร้าง Generation Job:', job.id);
    return job;
  }

  static async getGenerationJob(jobId: string): Promise<GenerationJob | null> {
    // Mock job data
    return {
      id: jobId,
      userId: 'user123',
      status: 'running',
      progress: 75,
      currentStep: 'สร้างบัญชีผู้ใช้',
      startedAt: new Date(Date.now() - 60000),
      retryCount: 0,
      maxRetries: 3
    };
  }

  static async updateGenerationJob(jobId: string, updates: Partial<GenerationJob>): Promise<void> {
    console.log(`📊 อัปเดต Generation Job ${jobId}:`, updates);
  }

  // Activity Log operations
  static async logActivity(userId: string, action: string, description: string, metadata?: Record<string, any>): Promise<void> {
    const log: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: userId,
      action: action,
      description: description,
      metadata: metadata,
      createdAt: new Date()
    };

    console.log('📋 บันทึก Activity:', log.action, '-', log.description);
  }

  static async getUserActivityLogs(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    // Mock activity logs
    return [
      {
        id: 'log1',
        userId: userId,
        action: 'sms_account_created',
        description: 'สร้างบัญชี SMS สำเร็จ',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 ชั่วโมงที่แล้ว
      },
      {
        id: 'log2',
        userId: userId,
        action: 'credits_added',
        description: 'เติมเครดิต 100 เครดิต',
        metadata: { amount: 100 },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 วันที่แล้ว
      },
      {
        id: 'log3',
        userId: userId,
        action: 'login',
        description: 'เข้าสู่ระบบ',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 วันที่แล้ว
      }
    ];
  }
}

// Encryption utilities
export class EncryptionService {
  static encrypt(plaintext: string): string {
    // Mock encryption - ในโปรดักชั่นจะใช้ crypto library
    return btoa(plaintext + '_encrypted');
  }

  static decrypt(ciphertext: string): string {
    // Mock decryption
    return atob(ciphertext).replace('_encrypted', '');
  }
}

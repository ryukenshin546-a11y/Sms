// Error Handling และ Retry Mechanism สำหรับ SMS Bot Service

export class BotError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string, 
    code: string, 
    retryable: boolean = true, 
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;
  }
}

// Error Types
export enum ErrorCodes {
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED', 
  USER_CREATION_FAILED = 'USER_CREATION_FAILED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  PAGE_LOAD_FAILED = 'PAGE_LOAD_FAILED',
  FORM_SUBMISSION_FAILED = 'FORM_SUBMISSION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error Handler Class
export class ErrorHandler {
  private static errorMessages: Record<string, string> = {
    [ErrorCodes.NETWORK_TIMEOUT]: 'ไม่สามารถเชื่อมต่อระบบ SMS ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    [ErrorCodes.AUTHENTICATION_FAILED]: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ',
    [ErrorCodes.USER_CREATION_FAILED]: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้ อาจมีชื่อผู้ใช้นี้อยู่แล้ว',
    [ErrorCodes.SYSTEM_MAINTENANCE]: 'ระบบ SMS อยู่ในช่วงปรับปรุง กรุณาลองใหม่ในภายหลัง',
    [ErrorCodes.SELECTOR_NOT_FOUND]: 'ไม่พบองค์ประกอบที่ต้องการในหน้าเว็บ อาจมีการอัปเดต UI',
    [ErrorCodes.PAGE_LOAD_FAILED]: 'ไม่สามารถโหลดหน้าเว็บได้ กรุณาลองใหม่',
    [ErrorCodes.FORM_SUBMISSION_FAILED]: 'ไม่สามารถส่งข้อมูลฟอร์มได้ กรุณาตรวจสอบข้อมูล',
    [ErrorCodes.UNKNOWN_ERROR]: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาติดต่อฝ่ายสนับสนุน'
  };

  static getErrorMessage(code: string): string {
    return this.errorMessages[code] || this.errorMessages[ErrorCodes.UNKNOWN_ERROR];
  }

  static isRetryable(error: BotError): boolean {
    const nonRetryableErrors = [
      ErrorCodes.AUTHENTICATION_FAILED,
      ErrorCodes.USER_CREATION_FAILED // หากชื่อผู้ใช้ซ้ำแล้ว
    ];
    
    return error.retryable && !nonRetryableErrors.includes(error.code as ErrorCodes);
  }

  static categorizeError(error: Error): BotError {
    const message = error.message.toLowerCase();

    // Network related errors
    if (message.includes('timeout') || message.includes('network')) {
      return new BotError(
        this.getErrorMessage(ErrorCodes.NETWORK_TIMEOUT),
        ErrorCodes.NETWORK_TIMEOUT,
        true,
        { originalError: error.message }
      );
    }

    // Authentication errors
    if (message.includes('authentication') || message.includes('login')) {
      return new BotError(
        this.getErrorMessage(ErrorCodes.AUTHENTICATION_FAILED),
        ErrorCodes.AUTHENTICATION_FAILED,
        false,
        { originalError: error.message }
      );
    }

    // User creation errors
    if (message.includes('user creation') || message.includes('duplicate')) {
      return new BotError(
        this.getErrorMessage(ErrorCodes.USER_CREATION_FAILED),
        ErrorCodes.USER_CREATION_FAILED,
        false,
        { originalError: error.message }
      );
    }

    // Page/selector errors
    if (message.includes('selector') || message.includes('element')) {
      return new BotError(
        this.getErrorMessage(ErrorCodes.SELECTOR_NOT_FOUND),
        ErrorCodes.SELECTOR_NOT_FOUND,
        true,
        { originalError: error.message }
      );
    }

    // Default to unknown error
    return new BotError(
      this.getErrorMessage(ErrorCodes.UNKNOWN_ERROR),
      ErrorCodes.UNKNOWN_ERROR,
      true,
      { originalError: error.message }
    );
  }
}

// Retry Configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 30000,      // 30 seconds
  backoffFactor: 2      // Exponential backoff
};

// Retry Mechanism
export class RetryManager {
  private config: RetryConfig;

  constructor(config: RetryConfig = defaultRetryConfig) {
    this.config = config;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: BotError) => void
  ): Promise<T> {
    let lastError: BotError;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        console.log(`🔄 ความพยายามครั้งที่ ${attempt}/${this.config.maxAttempts}`);
        return await operation();

      } catch (error) {
        lastError = error instanceof BotError ? error : ErrorHandler.categorizeError(error as Error);
        
        console.error(`❌ ความพยายามครั้งที่ ${attempt} ล้มเหลว:`, lastError.message);

        // ตรวจสอบว่าควร retry หรือไม่
        if (attempt >= this.config.maxAttempts || !ErrorHandler.isRetryable(lastError)) {
          console.error(`🛑 หยุดการ retry: ${!ErrorHandler.isRetryable(lastError) ? 'Non-retryable error' : 'Max attempts reached'}`);
          break;
        }

        // คำนวณ delay สำหรับการ retry
        const delay = this.calculateDelay(attempt);
        console.log(`⏱️ รอ ${delay}ms ก่อน retry...`);

        // เรียก callback สำหรับแจ้ง UI
        onRetry?.(attempt, lastError);

        // รอตาม delay ที่คำนวณ
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffFactor, attempt - 1);
    
    // เพิ่ม jitter เพื่อป้องกัน thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    return Math.min(exponentialDelay + jitter, this.config.maxDelay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global Retry Manager Instance
export const retryManager = new RetryManager();

// Enhanced SMS Bot Service with Error Handling
export class EnhancedSMSBotClient {
  private retryManager: RetryManager;

  constructor(retryConfig?: RetryConfig) {
    this.retryManager = new RetryManager(retryConfig);
  }

  async generateSMSAccountWithRetry(
    userId: string,
    userInfo: any,
    onProgress?: (step: string, progress: number) => void,
    onRetry?: (attempt: number, error: BotError) => void
  ): Promise<any> {
    return this.retryManager.executeWithRetry(
      async () => {
        const { generateSMSAccount } = await import('./smsBotService');
        return await generateSMSAccount(userId, userInfo, onProgress);
      },
      onRetry
    );
  }
}

// Error Recovery Strategies
export class ErrorRecovery {
  static async handleAuthenticationError(): Promise<void> {
    console.log('🔧 กำลังพยายามแก้ไขปัญหาการเข้าสู่ระบบ...');
    // สามารถเพิ่มการ refresh token หรือ re-authenticate
  }

  static async handleNetworkError(): Promise<void> {
    console.log('🌐 กำลังตรวจสอบการเชื่อมต่อเครือข่าย...');
    // สามารถเพิ่มการตรวจสอบ network connectivity
  }

  static async handleSelectorError(): Promise<void> {
    console.log('🔍 กำลังอัปเดต selectors...');
    // สามารถเพิ่มการ fallback ไปยัง alternative selectors
  }
}

// Monitoring และ Alerting
export class ErrorMonitor {
  private static errorCounts: Map<string, number> = new Map();
  private static readonly ERROR_THRESHOLD = 5;
  
  static recordError(error: BotError): void {
    const count = this.errorCounts.get(error.code) || 0;
    this.errorCounts.set(error.code, count + 1);
    
    // ส่ง alert หากมี error เกินเกณฑ์
    if (count + 1 >= this.ERROR_THRESHOLD) {
      this.sendAlert(error.code, count + 1);
    }
  }
  
  private static sendAlert(errorCode: string, count: number): void {
    console.warn(`🚨 ALERT: Error ${errorCode} occurred ${count} times`);
    // ส่ง notification ไปยัง admin หรือ monitoring system
  }
  
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
  
  static resetStats(): void {
    this.errorCounts.clear();
  }
}

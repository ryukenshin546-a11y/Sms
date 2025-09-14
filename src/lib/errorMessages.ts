/**
 * Enhanced Error Message System
 * ระบบจัดการข้อความแสดงข้อผิดพลาดที่เป็นมิตรกับผู้ใช้
 * Created: September 14, 2025
 */

export interface ErrorContext {
  action: 'send' | 'verify' | 'resend' | 'check';
  phoneNumber?: string;
  otpCode?: string;
  attempt?: number;
  remainingAttempts?: number;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion: string;
  actionable: boolean;
  actionText?: string;
  actionType?: 'retry' | 'reset' | 'contact' | 'navigate';
  severity: 'info' | 'warning' | 'error' | 'critical';
  icon?: string;
}

export class ErrorMessageService {
  /**
   * จัดการข้อความแสดงข้อผิดพลาดตามประเภทและบริบท
   */
  static getEnhancedError(
    errorCode: string, 
    context: ErrorContext, 
    originalMessage?: string
  ): UserFriendlyError {
    
    const errorMap: Record<string, (ctx: ErrorContext) => UserFriendlyError> = {
      // Phone Number Validation Errors
      'INVALID_PHONE_FORMAT': (ctx) => ({
        title: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
        message: 'กรุณาใส่หมายเลขโทรศัพท์ที่ถูกต้อง (เริ่มต้นด้วย 08 หรือ 09)',
        suggestion: 'ตัวอย่าง: 089-123-4567 หรือ 0891234567',
        actionable: true,
        actionText: 'แก้ไขเบอร์',
        actionType: 'retry',
        severity: 'warning',
        icon: '📱'
      }),

      'PHONE_NOT_SUPPORTED': (ctx) => ({
        title: 'เบอร์โทรไม่รองรับ',
        message: 'เบอร์โทรศัพท์นี้ไม่อยู่ในเครือข่ายที่รองรับ',
        suggestion: 'กรุณาใช้เบอร์โทรในเครือข่าย AIS, dtac, หรือ TrueMove',
        actionable: true,
        actionText: 'เปลี่ยนเบอร์',
        actionType: 'reset',
        severity: 'error',
        icon: '🚫'
      }),

      // OTP Send Errors
      'RATE_LIMIT_EXCEEDED': (ctx) => ({
        title: 'ส่ง OTP บ่อยเกินไป',
        message: `กรุณารอ ${this.formatWaitTime()} ก่อนขอรหัสใหม่`,
        suggestion: 'เพื่อความปลอดภัย เราจำกัดการส่ง OTP ไม่เกิน 3 ครั้งต่อชั่วโมง',
        actionable: false,
        severity: 'warning',
        icon: '⏰'
      }),

      'SMS_SEND_FAILED': (ctx) => ({
        title: 'ไม่สามารถส่ง SMS ได้',
        message: 'เกิดปัญหาในระบบส่งข้อความ กรุณาลองใหม่อีกครั้ง',
        suggestion: 'ตรวจสอบว่าเบอร์โทรสามารถรับ SMS ได้ และสัญญาณแรง',
        actionable: true,
        actionText: 'ลองใหม่',
        actionType: 'retry',
        severity: 'error',
        icon: '📨'
      }),

      'DAILY_LIMIT_REACHED': (ctx) => ({
        title: 'ครบจำนวนการส่งรายวัน',
        message: 'คุณได้ใช้สิทธิ์ส่ง OTP ครบจำนวนวันนี้แล้ว',
        suggestion: 'กรุณาลองใหม่อีกครั้งในวันพรุ่งนี้ หรือติดต่อฝ่ายสนับสนุน',
        actionable: true,
        actionText: 'ติดต่อสนับสนุน',
        actionType: 'contact',
        severity: 'error',
        icon: '📅'
      }),

      // OTP Verification Errors
      'INVALID_OTP_CODE': (ctx) => ({
        title: 'รหัส OTP ไม่ถูกต้อง',
        message: `รหัสที่ใส่ไม่ตรงกับที่เราส่งให้ ${ctx.remainingAttempts ? `(เหลือ ${ctx.remainingAttempts} ครั้ง)` : ''}`,
        suggestion: 'กรุณาตรวจสอบรหัส 4-6 หลักในข้อความ SMS หรือขอรหัสใหม่',
        actionable: true,
        actionText: ctx.remainingAttempts && ctx.remainingAttempts > 0 ? 'ลองใหม่' : 'ขอรหัสใหม่',
        actionType: ctx.remainingAttempts && ctx.remainingAttempts > 0 ? 'retry' : 'reset',
        severity: ctx.remainingAttempts && ctx.remainingAttempts <= 1 ? 'error' : 'warning',
        icon: '🔢'
      }),

      'OTP_EXPIRED': (ctx) => ({
        title: 'รหัส OTP หมดอายุ',
        message: 'รหัสยืนยันหมดอายุแล้ว (ใช้ได้เพียง 5 นาที)',
        suggestion: 'กรุณาขอรหัสใหม่และใส่รหัสภายใน 5 นาที',
        actionable: true,
        actionText: 'ขอรหัสใหม่',
        actionType: 'reset',
        severity: 'warning',
        icon: '⏱️'
      }),

      'MAX_ATTEMPTS_EXCEEDED': (ctx) => ({
        title: 'ใส่รหัสผิดหลายครั้ง',
        message: 'คุณได้ใส่รหัส OTP ผิด 3 ครั้งแล้ว เพื่อความปลอดภัย',
        suggestion: 'กรุณาขอรหัสใหม่และตรวจสอบให้ถูกต้องก่อนยืนยัน',
        actionable: true,
        actionText: 'ขอรหัสใหม่',
        actionType: 'reset',
        severity: 'error',
        icon: '🔒'
      }),

      // Resend Errors
      'RESEND_LIMIT_REACHED': (ctx) => ({
        title: 'ครบจำนวนการส่งซ้ำ',
        message: 'คุณได้ส่ง OTP ซ้ำครบ 3 ครั้งแล้ว',
        suggestion: 'กรุณารอ 1 ชั่วโมงก่อนขอรหัสใหม่ หรือติดต่อฝ่ายสนับสนุน',
        actionable: true,
        actionText: 'ติดต่อสนับสนุน',
        actionType: 'contact',
        severity: 'warning',
        icon: '🔄'
      }),

      'RESEND_TOO_SOON': (ctx) => ({
        title: 'ส่งซ้ำเร็วเกินไป',
        message: 'กรุณารอสักครู่ก่อนขอรหัสใหม่',
        suggestion: 'เพื่อป้องกันการใช้งานผิดปกติ กรุณารอ 30 วินาทีระหว่างการส่ง',
        actionable: false,
        severity: 'info',
        icon: '⏳'
      }),

      // System Errors
      'NETWORK_ERROR': (ctx) => ({
        title: 'เกิดปัญหาการเชื่อมต่อ',
        message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้',
        suggestion: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง',
        actionable: true,
        actionText: 'ลองใหม่',
        actionType: 'retry',
        severity: 'error',
        icon: '🌐'
      }),

      'SERVER_ERROR': (ctx) => ({
        title: 'เกิดปัญหาระบบ',
        message: 'ระบบมีปัญหาชั่วคราว กรุณาลองใหม่ใน 1-2 นาที',
        suggestion: 'หากปัญหายังคงเกิดขึ้น กรุณาติดต่อฝ่ายสนับสนุน',
        actionable: true,
        actionText: 'ลองใหม่',
        actionType: 'retry',
        severity: 'error',
        icon: '⚠️'
      }),

      'MAINTENANCE_MODE': (ctx) => ({
        title: 'ระบบอยู่ระหว่างปรับปรุง',
        message: 'ขออภัย ระบบกำลังปรับปรุงเพื่อให้บริการที่ดีขึ้น',
        suggestion: 'กรุณาลองใหม่ใน 10-15 นาที หรือตรวจสอบประกาศในเว็บไซต์',
        actionable: false,
        severity: 'info',
        icon: '🔧'
      })
    };

    // ถ้าไม่มี error code ที่ตรงกัน ให้ใช้ generic error
    if (!errorMap[errorCode]) {
      return this.getGenericError(originalMessage, context);
    }

    return errorMap[errorCode](context);
  }

  /**
   * สร้าง error message แบบ generic สำหรับ error ที่ไม่คาดคิด
   */
  private static getGenericError(message?: string, context?: ErrorContext): UserFriendlyError {
    return {
      title: 'เกิดข้อผิดพลาด',
      message: message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
      suggestion: 'หากปัญหายังคงเกิดขึ้น กรุณาติดต่อฝ่ายสนับสนุนพร้อมแจ้งรายละเอียด',
      actionable: true,
      actionText: 'ลองใหม่',
      actionType: 'retry',
      severity: 'error',
      icon: '❗'
    };
  }

  /**
   * จัดรูปแบบเวลารอ
   */
  private static formatWaitTime(): string {
    // TODO: Implement dynamic wait time calculation
    return '15 นาที';
  }

  /**
   * แปลง error จาก API response เป็น error code ที่เข้าใจได้
   */
  static mapApiErrorToCode(error: any): string {
    if (!error) return 'UNKNOWN_ERROR';
    
    const message = error.message || error.error || '';
    const code = error.code || error.statusCode;

    // Map specific API errors to error codes
    if (message.includes('rate limit') || code === 429) {
      return 'RATE_LIMIT_EXCEEDED';
    }
    
    if (message.includes('invalid phone') || message.includes('phone format')) {
      return 'INVALID_PHONE_FORMAT';
    }
    
    if (message.includes('invalid otp') || message.includes('wrong code')) {
      return 'INVALID_OTP_CODE';
    }
    
    if (message.includes('expired') || message.includes('timeout')) {
      return 'OTP_EXPIRED';
    }
    
    if (message.includes('max attempts') || message.includes('too many attempts')) {
      return 'MAX_ATTEMPTS_EXCEEDED';
    }
    
    if (message.includes('sms send failed') || message.includes('delivery failed')) {
      return 'SMS_SEND_FAILED';
    }
    
    if (message.includes('network') || code >= 500) {
      return code >= 500 ? 'SERVER_ERROR' : 'NETWORK_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * สร้าง success message ที่เป็นมิตรกับผู้ใช้
   */
  static getSuccessMessage(action: ErrorContext['action'], context: ErrorContext) {
    const successMap: Record<ErrorContext['action'], (ctx: ErrorContext) => UserFriendlyError> = {
      'send': (ctx) => ({
        title: 'ส่ง OTP สำเร็จ! 📱',
        message: 'เราได้ส่งรหัสยืนยัน 4-6 หลักไปที่เบอร์ของคุณแล้ว',
        suggestion: 'กรุณาตรวจสอบข้อความ SMS และใส่รหัสภายใน 5 นาที',
        actionable: false,
        severity: 'info',
        icon: '✅'
      }),
      
      'verify': (ctx) => ({
        title: 'ยืนยันสำเร็จ! 🎉',
        message: 'เบอร์โทรศัพท์ของคุณได้รับการยืนยันแล้ว',
        suggestion: 'คุณสามารถใช้งานระบบได้เต็มประสิทธิภาพแล้ว',
        actionable: false,
        severity: 'info',
        icon: '🎊'
      }),
      
      'resend': (ctx) => ({
        title: 'ส่งรหัสซ้ำแล้ว 🔄',
        message: `เราได้ส่งรหัสใหม่ไปที่เบอร์ของคุณแล้ว (ครั้งที่ ${ctx.attempt || 1})`,
        suggestion: 'กรุณาตรวจสอบข้อความ SMS ล่าสุดและใส่รหัสใหม่',
        actionable: false,
        severity: 'info',
        icon: '📨'
      }),
      
      'check': (ctx) => ({
        title: 'ตรวจสอบสำเร็จ ✅',
        message: 'เบอร์โทรศัพท์นี้ได้รับการยืนยันแล้ว',
        suggestion: 'สถานะการยืนยันของคุณเป็นปัจจุบัน',
        actionable: false,
        severity: 'info',
        icon: '🔍'
      })
    };

    return successMap[action](context);
  }
}

/**
 * Type definitions for error handling
 */
export type ErrorCode = 
  | 'INVALID_PHONE_FORMAT'
  | 'PHONE_NOT_SUPPORTED' 
  | 'RATE_LIMIT_EXCEEDED'
  | 'SMS_SEND_FAILED'
  | 'DAILY_LIMIT_REACHED'
  | 'INVALID_OTP_CODE'
  | 'OTP_EXPIRED'
  | 'MAX_ATTEMPTS_EXCEEDED'
  | 'RESEND_LIMIT_REACHED'
  | 'RESEND_TOO_SOON'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'MAINTENANCE_MODE'
  | 'UNKNOWN_ERROR';

export type ActionType = 'retry' | 'reset' | 'contact' | 'navigate';
export type SeverityType = 'info' | 'warning' | 'error' | 'critical';
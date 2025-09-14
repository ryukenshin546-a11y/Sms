/**
 * Enhanced Error Response Helper for Edge Functions
 * Created: September 14, 2025
 */

export interface ErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  suggestion?: string;
  retryAfter?: number;
  remainingAttempts?: number;
  context?: Record<string, any>;
}

export interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
  [key: string]: any;
}

export type ApiResponse = ErrorResponse | SuccessResponse;

export class EdgeFunctionErrors {
  
  /**
   * Phone validation errors
   */
  static invalidPhoneFormat(phoneNumber?: string): ErrorResponse {
    return {
      success: false,
      errorCode: 'INVALID_PHONE_FORMAT',
      message: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
      suggestion: 'กรุณาใส่หมายเลขโทรศัพท์ที่ถูกต้อง เช่น 089-123-4567 หรือ 0891234567',
      context: { phoneNumber }
    };
  }

  static phoneNotSupported(): ErrorResponse {
    return {
      success: false,
      errorCode: 'PHONE_NOT_SUPPORTED',
      message: 'เบอร์โทรศัพท์นี้ไม่อยู่ในเครือข่ายที่รองรับ',
      suggestion: 'กรุณาใช้เบอร์โทรในเครือข่าย AIS, dtac, หรือ TrueMove'
    };
  }

  /**
   * Rate limiting errors
   */
  static rateLimitExceeded(retryAfterSeconds: number, remainingAttempts?: number): ErrorResponse {
    const retryMinutes = Math.ceil(retryAfterSeconds / 60);
    
    return {
      success: false,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'ส่ง OTP บ่อยเกินไป',
      suggestion: `กรุณารอ ${retryMinutes} นาที ก่อนขอรหัสใหม่ เพื่อความปลอดภัย`,
      retryAfter: retryAfterSeconds,
      remainingAttempts
    };
  }

  static dailyLimitReached(): ErrorResponse {
    return {
      success: false,
      errorCode: 'DAILY_LIMIT_REACHED',
      message: 'คุณได้ใช้สิทธิ์ส่ง OTP ครบจำนวนวันนี้แล้ว',
      suggestion: 'กรุณาลองใหม่อีกครั้งในวันพรุ่งนี้ หรือติดต่อฝ่ายสนับสนุน'
    };
  }

  /**
   * SMS sending errors
   */
  static smsSendFailed(reason?: string): ErrorResponse {
    return {
      success: false,
      errorCode: 'SMS_SEND_FAILED',
      message: 'ไม่สามารถส่ง SMS ได้',
      suggestion: 'กรุณาตรวจสอบว่าเบอร์โทรสามารถรับ SMS ได้ และลองใหม่อีกครั้ง',
      context: { reason }
    };
  }

  /**
   * OTP verification errors
   */
  static invalidOtpCode(remainingAttempts?: number): ErrorResponse {
    const message = remainingAttempts !== undefined && remainingAttempts > 0
      ? `รหัส OTP ไม่ถูกต้อง (เหลือ ${remainingAttempts} ครั้ง)`
      : 'รหัส OTP ไม่ถูกต้อง';

    const suggestion = remainingAttempts !== undefined && remainingAttempts > 0
      ? 'กรุณาตรวจสอบรหัส 4-6 หลักในข้อความ SMS'
      : 'กรุณาขอรหัสใหม่และตรวจสอบให้ถูกต้อง';

    return {
      success: false,
      errorCode: 'INVALID_OTP_CODE',
      message,
      suggestion,
      remainingAttempts
    };
  }

  static otpExpired(): ErrorResponse {
    return {
      success: false,
      errorCode: 'OTP_EXPIRED',
      message: 'รหัส OTP หมดอายุแล้ว',
      suggestion: 'กรุณาขอรหัสใหม่และใส่รหัสภายใน 5 นาที'
    };
  }

  static maxAttemptsExceeded(): ErrorResponse {
    return {
      success: false,
      errorCode: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'คุณได้ใส่รหัส OTP ผิดหลายครั้งแล้ว',
      suggestion: 'กรุณาขอรหัสใหม่เพื่อความปลอดภัย'
    };
  }

  /**
   * Resend errors
   */
  static resendLimitReached(maxResends: number = 3): ErrorResponse {
    return {
      success: false,
      errorCode: 'RESEND_LIMIT_REACHED',
      message: `คุณได้ส่ง OTP ซ้ำครบ ${maxResends} ครั้งแล้ว`,
      suggestion: 'กรุณารอ 1 ชั่วโมงก่อนขอรหัสใหม่ หรือติดต่อฝ่ายสนับสนุน'
    };
  }

  static resendTooSoon(waitSeconds: number): ErrorResponse {
    return {
      success: false,
      errorCode: 'RESEND_TOO_SOON',
      message: 'กรุณารอสักครู่ก่อนขอรหัสใหม่',
      suggestion: `เพื่อป้องกันการใช้งานผิดปกติ กรุณารอ ${waitSeconds} วินาทีระหว่างการส่ง`,
      retryAfter: waitSeconds
    };
  }

  /**
   * System errors
   */
  static networkError(): ErrorResponse {
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      message: 'เกิดปัญหาการเชื่อมต่อ',
      suggestion: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง'
    };
  }

  static serverError(details?: string): ErrorResponse {
    return {
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'ระบบมีปัญหาชั่วคราว',
      suggestion: 'กรุณาลองใหม่ใน 1-2 นาที หากปัญหายังคงเกิดขึ้น กรุณาติดต่อฝ่ายสนับสนุน',
      context: { details }
    };
  }

  static maintenanceMode(): ErrorResponse {
    return {
      success: false,
      errorCode: 'MAINTENANCE_MODE',
      message: 'ระบบอยู่ระหว่างปรับปรุง',
      suggestion: 'กรุณาลองใหม่ใน 10-15 นาที หรือตรวจสอบประกาศในเว็บไซต์'
    };
  }

  /**
   * Generic error with custom message
   */
  static generic(message: string, suggestion?: string): ErrorResponse {
    return {
      success: false,
      errorCode: 'UNKNOWN_ERROR',
      message,
      suggestion: suggestion || 'หากปัญหายังคงเกิดขึ้น กรุณาติดต่อฝ่ายสนับสนุนพร้อมแจ้งรายละเอียด'
    };
  }

  /**
   * Success messages
   */
  static otpSentSuccess(referenceCode: string, phoneNumber?: string): SuccessResponse {
    return {
      success: true,
      message: 'ส่ง OTP สำเร็จแล้ว!',
      data: {
        referenceCode,
        phoneNumber,
        expiryMinutes: 5
      }
    };
  }

  static otpVerifiedSuccess(): SuccessResponse {
    return {
      success: true,
      message: 'ยืนยัน OTP สำเร็จ! เบอร์โทรศัพท์ของคุณได้รับการยืนยันแล้ว'
    };
  }

  static otpResendSuccess(attempt: number, maxResends: number): SuccessResponse {
    return {
      success: true,
      message: `ส่ง OTP ซ้ำสำเร็จ! (ครั้งที่ ${attempt}/${maxResends})`
    };
  }
}

/**
 * Utility to create HTTP Response with proper headers
 */
export function createErrorResponse(
  error: ErrorResponse, 
  statusCode: number = 400,
  additionalHeaders?: Record<string, string>
): Response {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  const headers = { ...corsHeaders, ...additionalHeaders };

  // Add retry-after header for rate limiting
  if (error.retryAfter) {
    headers['Retry-After'] = error.retryAfter.toString();
  }

  return new Response(JSON.stringify(error), {
    status: statusCode,
    headers
  });
}

export function createSuccessResponse(
  data: SuccessResponse,
  statusCode: number = 200,
  additionalHeaders?: Record<string, string>
): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { ...corsHeaders, ...additionalHeaders }
  });
}
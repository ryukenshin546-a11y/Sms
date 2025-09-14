/**
 * Enhanced Logger Utility for OTP System
 * Provides structured logging, audit trails, and performance metrics
 * Version: 1.0
 * Date: September 14, 2025
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type EventCategory = 'security' | 'otp' | 'performance' | 'error' | 'audit';

export interface LogEvent {
  eventType: string;
  eventCategory: EventCategory;
  severity: LogLevel;
  message: string;
  eventData?: Record<string, any>;
  
  // Context information
  clientIP?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  
  // OTP specific
  phoneNumber?: string;
  otpId?: string;
  referenceCode?: string;
  success?: boolean;
  
  // Performance metrics
  responseTimeMs?: number;
  databaseQueryTimeMs?: number;
  
  // Error details
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
}

export class AuditLogger {
  private supabase: any;
  private serviceName: string;
  private serviceVersion: string;

  constructor(supabaseClient: any, serviceName = 'otp-system', serviceVersion = '1.0') {
    this.supabase = supabaseClient;
    this.serviceName = serviceName;
    this.serviceVersion = serviceVersion;
  }

  /**
   * Log an event to the audit log
   */
  async log(event: LogEvent): Promise<void> {
    try {
      // Prepare event data
      const eventData = { ...event.eventData };

      const logEntry = {
        timestamp: new Date().toISOString(),
        event_type: event.eventType,
        event_category: event.eventCategory,
        severity: event.severity,
        
        // Context
        client_ip: event.clientIP,
        user_agent: event.userAgent,
        request_id: event.requestId || this.generateRequestId(),
        session_id: event.sessionId,
        
        // Event details
        event_data: eventData,
        message: event.message,
        
        // OTP fields (now as direct columns)
        phone_number: event.phoneNumber ? this.maskPhoneNumber(event.phoneNumber) : null,
        otp_id: event.otpId || null,
        reference_code: event.referenceCode || null,
        success: event.success || null,
        
        // Performance
        response_time_ms: event.responseTimeMs,
        database_query_time_ms: event.databaseQueryTimeMs,
        
        // Error details
        error_code: event.errorCode,
        error_message: event.errorMessage,
        stack_trace: event.stackTrace,
        
        // Service metadata
        service_name: this.serviceName,
        service_version: this.serviceVersion
      };

      const { error } = await this.supabase
        .from('audit_logs')
        .insert([logEntry]);

      if (error) {
        // Fallback to console if database logging fails
        console.error('Failed to write audit log:', error);
        console.log('Audit log entry:', JSON.stringify(logEntry, null, 2));
      }
      
      // Also log to console for immediate debugging
      if (event.severity === 'error' || event.severity === 'critical') {
        console.error(`[${event.severity.toUpperCase()}] ${event.message}`, event.eventData);
      } else {
        console.log(`[${event.severity.toUpperCase()}] ${event.message}`, event.eventData || '');
      }

    } catch (error) {
      console.error('Logger error:', error);
      console.log('Failed to log event:', JSON.stringify(event, null, 2));
    }
  }

  /**
   * Log OTP send event
   */
  async logOTPSend(data: {
    phoneNumber: string;
    otpId: string;
    referenceCode: string;
    clientIP: string;
    userAgent?: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: 'otp_send',
      eventCategory: 'otp',
      severity: data.success ? 'info' : 'error',
      message: data.success 
        ? `OTP sent successfully to ${this.maskPhoneNumber(data.phoneNumber)}`
        : `Failed to send OTP to ${this.maskPhoneNumber(data.phoneNumber)}: ${data.errorMessage}`,
      eventData: {
        sms_provider: 'SMS_UP_Plus',
        ...(data.errorMessage && { error: data.errorMessage })
      },
      clientIP: data.clientIP,
      userAgent: data.userAgent,
      requestId: data.requestId,
      phoneNumber: data.phoneNumber,
      otpId: data.otpId,
      referenceCode: data.referenceCode,
      responseTimeMs: data.responseTimeMs,
      success: data.success,
      ...(data.errorMessage && {
        errorMessage: data.errorMessage,
        errorCode: 'OTP_SEND_FAILED'
      })
    });
  }

  /**
   * Log OTP verification event
   */
  async logOTPVerify(data: {
    phoneNumber: string;
    otpId: string;
    referenceCode: string;
    clientIP: string;
    userAgent?: string;
    responseTimeMs: number;
    success: boolean;
    attemptsRemaining?: number;
    isExpired?: boolean;
    errorMessage?: string;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: 'otp_verify',
      eventCategory: 'otp',
      severity: data.success ? 'info' : 'warn',
      message: data.success 
        ? `OTP verified successfully for ${this.maskPhoneNumber(data.phoneNumber)}`
        : `OTP verification failed for ${this.maskPhoneNumber(data.phoneNumber)}: ${data.errorMessage}`,
      eventData: {
        attempts_remaining: data.attemptsRemaining,
        is_expired: data.isExpired,
        ...(data.errorMessage && { error: data.errorMessage })
      },
      clientIP: data.clientIP,
      userAgent: data.userAgent,
      requestId: data.requestId,
      phoneNumber: data.phoneNumber,
      otpId: data.otpId,
      referenceCode: data.referenceCode,
      responseTimeMs: data.responseTimeMs,
      success: data.success,
      ...(data.errorMessage && {
        errorMessage: data.errorMessage,
        errorCode: 'OTP_VERIFY_FAILED'
      })
    });
  }

  /**
   * Log rate limiting event
   */
  async logRateLimit(data: {
    limitType: string;
    identifier: string; // IP or phone number
    clientIP: string;
    requestsCount: number;
    limitValue: number;
    windowMs: number;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: 'rate_limit_exceeded',
      eventCategory: 'security',
      severity: 'warn',
      message: `Rate limit exceeded: ${data.limitType} for ${data.limitType.includes('ip') ? data.identifier : this.maskPhoneNumber(data.identifier)}`,
      eventData: {
        limit_type: data.limitType,
        identifier: data.limitType.includes('ip') ? data.identifier : this.maskPhoneNumber(data.identifier),
        requests_count: data.requestsCount,
        limit_value: data.limitValue,
        window_ms: data.windowMs
      },
      clientIP: data.clientIP,
      requestId: data.requestId,
      errorCode: 'RATE_LIMIT_EXCEEDED'
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(data: {
    eventType: string;
    message: string;
    clientIP: string;
    userAgent?: string;
    severity?: LogLevel;
    eventData?: Record<string, any>;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: data.eventType,
      eventCategory: 'security',
      severity: data.severity || 'warn',
      message: data.message,
      eventData: data.eventData || {},
      clientIP: data.clientIP,
      userAgent: data.userAgent,
      requestId: data.requestId,
      errorCode: data.eventType.toUpperCase()
    });
  }

  /**
   * Log performance metrics
   */
  async logPerformance(data: {
    operation: string;
    responseTimeMs: number;
    databaseQueryTimeMs?: number;
    success: boolean;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: 'performance_metric',
      eventCategory: 'performance',
      severity: 'debug',
      message: `${data.operation} completed in ${data.responseTimeMs}ms`,
      eventData: {
        operation: data.operation,
        success: data.success,
        ...(data.databaseQueryTimeMs && { db_query_time_ms: data.databaseQueryTimeMs })
      },
      requestId: data.requestId,
      responseTimeMs: data.responseTimeMs,
      databaseQueryTimeMs: data.databaseQueryTimeMs
    });
  }

  /**
   * Log error event
   */
  async logError(data: {
    error: Error;
    context: string;
    clientIP?: string;
    userAgent?: string;
    eventData?: Record<string, any>;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      eventType: 'system_error',
      eventCategory: 'error',
      severity: 'error',
      message: `Error in ${data.context}: ${data.error.message}`,
      eventData: {
        context: data.context,
        error_name: data.error.name,
        ...data.eventData
      },
      clientIP: data.clientIP,
      userAgent: data.userAgent,
      requestId: data.requestId,
      errorMessage: data.error.message,
      stackTrace: data.error.stack,
      errorCode: 'SYSTEM_ERROR'
    });
  }

  /**
   * Generate request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mask phone number for privacy (keep last 4 digits)
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || phoneNumber.length < 4) return '****';
    const visiblePart = phoneNumber.slice(-4);
    const maskedPart = '*'.repeat(phoneNumber.length - 4);
    return maskedPart + visiblePart;
  }

  /**
   * Get client information from request
   */
  static getClientInfo(request: Request): { ip: string; userAgent: string } {
    // Try various headers for IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    let ip = 'unknown';
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    } else if (cfConnectingIp) {
      ip = cfConnectingIp;
    }
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return { ip, userAgent };
  }
}
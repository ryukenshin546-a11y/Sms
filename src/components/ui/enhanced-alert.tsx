/**
 * Enhanced Error Alert Component
 * แสดงข้อความแสดงข้อผิดพลาดแบบ user-friendly พร้อม action buttons
 * Created: September 14, 2025
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  CheckCircle, 
  RefreshCw, 
  RotateCcw, 
  Phone, 
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { UserFriendlyError, SeverityType, ActionType } from '@/lib/errorMessages';

interface EnhancedErrorAlertProps {
  error: UserFriendlyError;
  onAction?: (actionType: ActionType) => void;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const EnhancedErrorAlert: React.FC<EnhancedErrorAlertProps> = ({
  error,
  onAction,
  className = '',
  showIcon = true,
  compact = false
}) => {
  // สี Alert ตาม severity
  const alertStyles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    critical: 'border-red-500 bg-red-100 text-red-950 border-2'
  };

  // ไอคอนตาม severity
  const SeverityIcon = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    critical: XCircle
  }[error.severity];

  // ไอคอนสำหรับ action button
  const ActionIcon = {
    retry: RefreshCw,
    reset: RotateCcw,
    contact: Phone,
    navigate: ArrowRight
  };

  const handleAction = () => {
    if (error.actionable && error.actionType && onAction) {
      onAction(error.actionType);
    }
  };

  return (
    <Alert className={`${alertStyles[error.severity]} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Icon หลัก */}
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {error.icon ? (
              <span className="text-lg" role="img" aria-label="error-icon">
                {error.icon}
              </span>
            ) : (
              <SeverityIcon className="h-4 w-4" />
            )}
          </div>
        )}

        {/* เนื้อหา */}
        <div className="flex-1 min-w-0">
          {/* Title และ Severity Badge */}
          <div className="flex items-center justify-between mb-1">
            <AlertTitle className="text-sm font-medium">
              {error.title}
            </AlertTitle>
            {!compact && (
              <Badge 
                variant={error.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {error.severity === 'info' && '💡'}
                {error.severity === 'warning' && '⚠️'}
                {error.severity === 'error' && '❌'}
                {error.severity === 'critical' && '🚨'}
              </Badge>
            )}
          </div>

          {/* Message */}
          <AlertDescription className="text-sm mb-2">
            {error.message}
          </AlertDescription>

          {/* Suggestion */}
          {!compact && error.suggestion && (
            <div className="bg-white/50 rounded-md p-2 mb-3 text-xs text-gray-600 border-l-2 border-current pl-3">
              💡 <strong>คำแนะนำ:</strong> {error.suggestion}
            </div>
          )}

          {/* Action Button */}
          {error.actionable && error.actionText && error.actionType && (
            <div className="flex items-center justify-between mt-3">
              <Button
                variant={error.severity === 'critical' ? 'destructive' : 'outline'}
                size="sm"
                onClick={handleAction}
                className="text-xs"
              >
                {ActionIcon[error.actionType] && (
                  React.createElement(ActionIcon[error.actionType], { 
                    className: "w-3 h-3 mr-1" 
                  })
                )}
                {error.actionText}
              </Button>

              {/* เวลาหรือข้อมูลเพิ่มเติม */}
              {!compact && (
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date().toLocaleTimeString('th-TH', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

/**
 * Success Alert Component
 */
interface SuccessAlertProps {
  title: string;
  message: string;
  suggestion?: string;
  icon?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  className?: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  title,
  message,
  suggestion,
  icon = '✅',
  onDismiss,
  autoHide = true,
  className = ''
}) => {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000); // Auto hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  return (
    <Alert className={`border-green-200 bg-green-50 text-green-900 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-lg" role="img">
            {icon}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <AlertTitle className="text-sm font-medium text-green-800">
              {title}
            </AlertTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              สำเร็จ
            </Badge>
          </div>
          
          <AlertDescription className="text-sm text-green-700 mt-1">
            {message}
          </AlertDescription>
          
          {suggestion && (
            <div className="bg-white/50 rounded-md p-2 mt-2 text-xs text-green-600 border-l-2 border-green-400 pl-3">
              💡 {suggestion}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

/**
 * Loading Alert Component
 */
interface LoadingAlertProps {
  message?: string;
  details?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  className?: string;
}

export const LoadingAlert: React.FC<LoadingAlertProps> = ({
  message = 'กำลังดำเนินการ...',
  details,
  progress,
  showProgress = false,
  className = ''
}) => {
  return (
    <Alert className={`border-blue-200 bg-blue-50 text-blue-900 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Zap className="w-4 h-4 animate-pulse text-blue-600" />
        </div>
        
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium text-blue-800">
            {message}
          </AlertTitle>
          
          {details && (
            <AlertDescription className="text-sm text-blue-700 mt-1">
              {details}
            </AlertDescription>
          )}
          
          {showProgress && typeof progress === 'number' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>ความคืบหน้า</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

/**
 * Toast-style notification component
 */
interface NotificationToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  type,
  title,
  message,
  duration = 4000,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'border-green-500 bg-green-50 text-green-900',
    error: 'border-red-500 bg-red-50 text-red-900',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    info: 'border-blue-500 bg-blue-50 text-blue-900'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '💡'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out`}>
      <Alert className={`${styles[type]} border-l-4 shadow-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <span className="text-lg">{icons[type]}</span>
            <div>
              <AlertTitle className="text-sm font-medium">
                {title}
              </AlertTitle>
              {message && (
                <AlertDescription className="text-sm mt-1">
                  {message}
                </AlertDescription>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ✕
          </button>
        </div>
      </Alert>
    </div>
  );
};
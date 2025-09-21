import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Coins, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CreditSyncService } from '@/services/creditSyncService';

interface CreditBalanceDisplayProps {
  userId?: string;
  autoSync?: boolean;
  showSyncButton?: boolean;
  className?: string;
}

interface CreditState {
  balance: number;
  lastSync: string | null;
  status: 'loading' | 'success' | 'error' | 'syncing';
  error: string | null;
  fromCache: boolean;
}

const CreditBalanceDisplay: React.FC<CreditBalanceDisplayProps> = ({
  userId,
  autoSync = true,
  showSyncButton = true,
  className = ''
}) => {
  const [creditState, setCreditState] = useState<CreditState>({
    balance: 0,
    lastSync: null,
    status: 'loading',
    error: null,
    fromCache: false
  });

  // Load initial credit data
  useEffect(() => {
    if (autoSync) {
      handleAutoSync();
    } else {
      loadCurrentBalance();
    }
  }, [userId, autoSync]);

  // Set up realtime subscription
  useEffect(() => {
    let subscription: any = null;
    
    const setupSubscription = async () => {
      subscription = await CreditSyncService.subscribeToCreditUpdates((data) => {
        setCreditState(prev => ({
          ...prev,
          balance: data.balance,
          lastSync: data.last_sync_at,
          status: data.sync_status === 'success' ? 'success' : 'error',
          error: null,
          fromCache: false
        }));
      }, userId);
    };
    
    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  const loadCurrentBalance = async () => {
    try {
      setCreditState(prev => ({ ...prev, status: 'loading' }));
      
      const currentBalance = await CreditSyncService.getCurrentCreditBalance(userId);
      
      if (currentBalance) {
        setCreditState({
          balance: currentBalance.balance,
          lastSync: currentBalance.last_sync_at,
          status: 'success',
          error: null,
          fromCache: true
        });
      } else {
        setCreditState(prev => ({
          ...prev,
          status: 'error',
          error: 'ไม่พบข้อมูลเครดิต'
        }));
      }
    } catch (error) {
      setCreditState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      }));
    }
  };

  const handleAutoSync = async () => {
    try {
      setCreditState(prev => ({ ...prev, status: 'syncing' }));
      
      const result = await CreditSyncService.checkAndSyncIfNeeded();
      
      if (result.success && result.data) {
        setCreditState({
          balance: result.data.balance,
          lastSync: result.data.last_sync_at,
          status: 'success',
          error: null,
          fromCache: result.fromCache || false
        });
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'เกิดข้อผิดพลาดในการ sync';
        let displayError = errorMessage;
        
        if (errorMessage.includes('SMS_ACCOUNT_NOT_FOUND') || errorMessage.includes('ไม่พบบัญชี SMS')) {
          displayError = 'กรุณาสร้างบัญชี SMS ก่อนดูยอดเครดิต';
        } else if (errorMessage.includes('INVALID_SMS_CREDENTIALS')) {
          displayError = 'ข้อมูลบัญชี SMS ไม่ถูกต้อง';
        }
        
        setCreditState(prev => ({
          ...prev,
          status: 'error',
          error: displayError
        }));
      }
    } catch (error) {
      setCreditState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      }));
    }
  };

  const handleManualSync = async () => {
    try {
      setCreditState(prev => ({ ...prev, status: 'syncing' }));
      
      const result = await CreditSyncService.syncCreditBalance(true);
      
      if (result.success && result.data) {
        setCreditState({
          balance: result.data.balance,
          lastSync: result.data.last_sync_at,
          status: 'success',
          error: null,
          fromCache: false
        });
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'เกิดข้อผิดพลาดในการ sync';
        let displayError = errorMessage;
        
        if (errorMessage.includes('SMS_ACCOUNT_NOT_FOUND') || errorMessage.includes('ไม่พบบัญชี SMS')) {
          displayError = 'กรุณาสร้างบัญชี SMS ก่อนดูยอดเครดิต';
        } else if (errorMessage.includes('INVALID_SMS_CREDENTIALS')) {
          displayError = 'ข้อมูลบัญชี SMS ไม่ถูกต้อง';
        }
        
        setCreditState(prev => ({
          ...prev,
          status: 'error',
          error: displayError
        }));
      }
    } catch (error) {
      setCreditState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      }));
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'ไม่เคยอัปเดต';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'เมื่อกี้นี้';
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
  };

  const getStatusIcon = () => {
    switch (creditState.status) {
      case 'loading':
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (creditState.status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'loading':
      case 'syncing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Credit Balance Display */}
      <div className="flex items-center justify-between">
        <Badge className={`text-lg px-4 py-2 font-bold ${getStatusColor()}`}>
          <Coins className="h-5 w-5 mr-2" />
          เครดิต: {creditState.balance?.toLocaleString() || '0'}
        </Badge>
        
        {showSyncButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={creditState.status === 'syncing'}
            className="hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            {creditState.status === 'syncing' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {creditState.status === 'syncing' ? 'กำลังอัปเดต...' : 'อัปเดต'}
          </Button>
        )}
      </div>

      {/* Status Information */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {getStatusIcon()}
        <span>
          {creditState.fromCache ? '(จากแคช) ' : ''}
          อัปเดตล่าสุด: {formatLastSync(creditState.lastSync)}
        </span>
      </div>

      {/* Error Alert */}
      {creditState.status === 'error' && creditState.error && (
        <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {creditState.error}
            {showSyncButton && (
              <>
                {creditState.error.includes('กรุณาสร้างบัญชี SMS') ? (
                  <div className="mt-2">
                    <p className="text-sm">หากต้องการดูยอดเครดิต กรุณาสร้างบัญชี SMS ในส่วน "SMS Auto-Bot" ด้านล่าง</p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="link"
                    className="ml-2 p-0 h-auto text-red-600 hover:text-red-800"
                    onClick={handleManualSync}
                  >
                    ลองใหม่
                  </Button>
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CreditBalanceDisplay;
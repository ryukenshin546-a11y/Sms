import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification } from '@/hooks/useNotification';

interface NotificationListProps {
  notifications: Notification[];
  onHide: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onHide 
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={() => onHide(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onHide: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onHide 
}) => {
  const getIcon = () => {
    const iconClasses = "w-4 h-4";
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={cn(iconClasses, "text-green-600")} />;
      case 'error':
        return <XCircle className={cn(iconClasses, "text-red-600")} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClasses, "text-yellow-600")} />;
      case 'info':
        return <Info className={cn(iconClasses, "text-blue-600")} />;
      default:
        return <Info className={cn(iconClasses, "text-gray-600")} />;
    }
  };

  const getAlertClasses = () => {
    switch (notification.type) {
      case 'success':
        return "border-green-200 bg-green-50";
      case 'error':
        return "border-red-200 bg-red-50";
      case 'warning':
        return "border-yellow-200 bg-yellow-50";
      case 'info':
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTextClasses = () => {
    switch (notification.type) {
      case 'success':
        return "text-green-800";
      case 'error':
        return "text-red-800";
      case 'warning':
        return "text-yellow-800";
      case 'info':
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <Alert className={cn(
      "animate-in slide-in-from-right-5 duration-300 shadow-lg",
      getAlertClasses()
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getIcon()}
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-medium leading-5",
              getTextClasses()
            )}>
              {notification.title}
            </h4>
            {notification.message && (
              <AlertDescription className={cn(
                "text-sm mt-1 leading-5",
                getTextClasses()
              )}>
                {notification.message}
              </AlertDescription>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onHide}
          className={cn(
            "h-6 w-6 p-0 hover:bg-black/10 flex-shrink-0",
            getTextClasses()
          )}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </Alert>
  );
};

export default NotificationList;
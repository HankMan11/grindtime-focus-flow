
import { useState, useEffect } from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Bell, 
  Dot, 
  CheckCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: "success" | "warning" | "info" | "error";
}

const NotificationsCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Demo notifications - in a real app, these would come from your backend/Supabase
  useEffect(() => {
    if (user) {
      // Simulate fetching notifications
      const demoNotifications: Notification[] = [
        {
          id: "1",
          title: "Streak Achievement",
          message: "You've reached a 3-day streak! Keep up the good work!",
          read: false,
          timestamp: new Date(),
          type: "success"
        },
        {
          id: "2",
          title: "Daily Goal Reminder",
          message: "Don't forget to complete your daily study goal today.",
          read: false,
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          type: "info"
        },
        {
          id: "3",
          title: "New Feature",
          message: "Check out the new calendar feature to plan your study sessions.",
          read: true,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          type: "info"
        }
      ];
      
      setNotifications(demoNotifications);
    }
  }, [user]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <span className="text-green-500">🎉</span>;
      case "warning": return <span className="text-yellow-500">⚠️</span>;
      case "error": return <span className="text-red-500">❌</span>;
      default: return <span className="text-blue-500">ℹ️</span>;
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-grindtime-purple text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs flex items-center gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        <div className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-md ${notification.read ? 'bg-card' : 'bg-muted'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && <Dot className="h-4 w-4 text-grindtime-purple" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(notification.timestamp, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">No notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsCenter;

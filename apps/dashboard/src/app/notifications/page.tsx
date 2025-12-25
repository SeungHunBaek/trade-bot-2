'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Check, AlertTriangle, Info, XCircle, Bell } from 'lucide-react';

const notifications = [
  {
    id: '1',
    type: 'success',
    title: 'Order Filled',
    message: 'BUY 0.015 BTC @ 87,500,000 KRW executed successfully',
    strategy: 'Momentum Alpha',
    createdAt: '2024-03-20 14:32:15',
    isRead: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Strategy Started',
    message: 'Momentum Alpha strategy has been activated',
    strategy: 'Momentum Alpha',
    createdAt: '2024-03-20 14:00:00',
    isRead: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Daily Loss Limit Warning',
    message: 'You have reached 80% of your daily loss limit',
    strategy: null,
    createdAt: '2024-03-20 13:45:00',
    isRead: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Connection Error',
    message: 'Failed to connect to Bithumb API. Retrying...',
    strategy: null,
    createdAt: '2024-03-20 12:30:00',
    isRead: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Order Filled',
    message: 'SELL 0.5 ETH @ 4,250,000 KRW executed successfully',
    strategy: 'Mean Reversion Beta',
    createdAt: '2024-03-20 11:28:42',
    isRead: true,
  },
  {
    id: '6',
    type: 'info',
    title: 'Backtest Completed',
    message: 'Breakout Gamma backtest completed with +15.3% return',
    strategy: 'Breakout Gamma',
    createdAt: '2024-03-19 18:00:00',
    isRead: true,
  },
];

const typeConfig = {
  success: {
    icon: Check,
    color: 'text-success',
    bgColor: 'bg-success/20',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/20',
  },
  error: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/20',
  },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const filteredNotifications = filter === 'all'
    ? localNotifications
    : filter === 'unread'
    ? localNotifications.filter((n) => !n.isRead)
    : localNotifications.filter((n) => n.type === filter);

  const unreadCount = localNotifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setLocalNotifications(localNotifications.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setLocalNotifications(
      localNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-32"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </Select>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {localNotifications.filter((n) => n.type === 'success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {localNotifications.filter((n) => n.type === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {localNotifications.filter((n) => n.type === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notifications found
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      !notification.isRead ? 'bg-muted/30 border-primary/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`p-2 rounded-full ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{notification.createdAt}</span>
                        {notification.strategy && (
                          <>
                            <span>•</span>
                            <span>{notification.strategy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

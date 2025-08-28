import { useState, useEffect, useCallback } from 'react';
import { SimpleNotification, NotificationPreferences, DEFAULT_PREFERENCES } from '@/lib/simple-notifications';

interface UseSimpleNotificationsReturn {
  notifications: SimpleNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: SimpleNotification) => void;
  clearNotifications: () => void;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export function useSimpleNotifications(userId?: string): UseSimpleNotificationsReturn {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/simple-notifications?userId=${userId}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications.map((n: any) => ({
          ...n,
          dateCreated: new Date(n.dateCreated)
        })));
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/simple-notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationIds: notificationIds || notifications.filter(n => !n.isRead).map(n => n.id)
        })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({
            ...n,
            isRead: notificationIds ? 
              (notificationIds.includes(n.id) ? true : n.isRead) : 
              true
          }))
        );
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [userId, notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    await markAsRead();
  }, [markAsRead]);

  // Add notification to local state
  const addNotification = useCallback((notification: SimpleNotification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/simple-notifications/preferences?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/simple-notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences: { ...preferences, ...newPrefs }
        })
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  }, [userId, preferences]);

  // Fetch data on mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [userId, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    addNotification,
    clearNotifications,
    preferences,
    updatePreferences
  };
}

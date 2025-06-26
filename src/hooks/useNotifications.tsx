
import { useState, useEffect, useCallback } from 'react';

export interface NotificationSettings {
  desktopNotifications: boolean;
  pushNotificationsForMessages: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  desktopNotifications: true,
  pushNotificationsForMessages: true,
};

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }

    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Set up page visibility listener
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  }, [settings]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  }, [permission]);

  // Show notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!settings.desktopNotifications || !settings.pushNotificationsForMessages) {
      return;
    }

    if (isPageVisible) {
      return; // Don't show notification if user is actively viewing the page
    }

    if ('Notification' in window && permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }, [settings, permission, isPageVisible]);

  return {
    settings,
    updateSettings,
    permission,
    requestPermission,
    showNotification,
    isPageVisible,
  };
};

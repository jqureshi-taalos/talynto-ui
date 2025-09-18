import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    type: 'info',
    message: '',
    isVisible: false,
    duration: 3000
  });

  const showNotification = useCallback((type, message, duration = 3000) => {
    setNotification({
      type,
      message,
      isVisible: true,
      duration
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showNotification('success', message, duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    showNotification('error', message, duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    showNotification('warning', message, duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    showNotification('info', message, duration);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
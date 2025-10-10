import { useState, useCallback } from 'react';
import { Notification } from '../components/NotificationSystem';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'success', title: "🚍 Bus en approche", message: "Votre bus part dans 15 minutes." },
    { id: '2', type:'error', title: "⏰ Erreur", message: "Le bus ligne 3 part à 14h30." },
    { id: '3', type:'warning', title: "Attention", message: "Votre action a été effectuée avec succès."},
    { id: '4', type: 'success', title: "🚍 Bus en approche", message: "Votre bus part dans 15 minutes." },
    { id: '5', type:'error', title: "⏰ Erreur", message: "Le bus ligne 3 part à 14h30." },
    { id: '6', type:'warning', title: "Attention", message: "Votre action a été effectuée avec succès."},
    { id: '7', type: 'success', title: "🚍 Bus en approche", message: "Votre bus part dans 15 minutes." },
    { id: '8', type:'error', title: "⏰ Erreur", message: "Le bus ligne 3 part à 14h30." },
    { id: '9', type:'warning', title: "Attention", message: "Votre action a été effectuée avec succès."},
    { id: '10', type: 'success', title: "🚍 Bus en approche", message: "Votre bus part dans 15 minutes." },
    { id: '11', type:'error', title: "⏰ Erreur", message: "Le bus ligne 3 part à 14h30." },
    { id: '12', type:'warning', title: "Attention", message: "Votre action a été effectuée avec succès."}
  ]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    addNotification({ type: 'info', title, message });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
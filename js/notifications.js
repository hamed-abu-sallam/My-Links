/**
 * Notifications Manager - نظام التنبيهات الذكية
 * Handles smart notifications and reminders
 */

class NotificationsManager {
  constructor() {
    this.tasksManager = tasksManager;
    this.notificationQueue = [];
    this.activeNotifications = new Map();
    this.initializeNotifications();
  }

  // Initialize browser notifications permission
  initializeNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Request notification permission
  requestPermission() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%236d28d9" width="100" height="100"/><text x="50" y="50" font-size="60" font-weight="bold" fill="%23fff" text-anchor="middle" dominant-baseline="central">HS</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%236d28d9"/></svg>',
          ...options
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  // Show in-app notification
  showInAppNotification(message, type = 'info') {
    showToast(message, type);
  }

  // Notify task reminder (10 minutes before)
  notifyTaskReminder(task) {
    const message = `تنبيه: مهمة "${task.title}" خلال 10 دقائق`;
    
    this.showBrowserNotification(message, {
      body: `${task.category} | ${task.dueTime}`,
      tag: `task-reminder-${task.id}`,
      requireInteraction: true
    });

    this.showInAppNotification(`⏰ ${message}`, 'warning');
  }

  // Notify new task added
  notifyTaskAdded(task) {
    const categoryEmoji = this.getCategoryEmoji(task.category);
    const message = `${categoryEmoji} تم إضافة مهمة: ${task.title}`;
    
    this.showInAppNotification(message, 'success');
  }

  // Notify task completed
  notifyTaskCompleted(task) {
    const message = `✅ تم إكمال: ${task.title}`;
    this.showInAppNotification(message, 'success');
  }

  // Notify overdue task
  notifyOverdueTask(task) {
    const message = `⚠️ مهمة متأخرة: ${task.title}`;
    
    this.showBrowserNotification(message, {
      body: `كان يجب إكمالها في ${task.dueTime}`,
      tag: `overdue-${task.id}`,
      requireInteraction: true
    });

    this.showInAppNotification(message, 'danger');
  }

  // Notify conflicts
  notifyScheduleConflict(conflict) {
    const message = `❌ ${conflict.message}`;
    this.showInAppNotification(message, 'danger');
  }

  // Get category emoji
  getCategoryEmoji(category) {
    const emojis = {
      company: '🏢',
      freelance: '💼',
      support: '🎟️',
      academy: '🎓',
      project: '📚'
    };
    return emojis[category] || '📌';
  }

  // Daily schedule notification (morning)
  notifyDailySchedule() {
    const schedule = smartScheduler.getRecommendedSchedule();
    const totalTasks = schedule.periods.reduce((sum, p) => sum + p.tasks.length, 0);
    
    const message = `صباح الخير! لديك ${totalTasks} مهمة اليوم`;
    
    this.showBrowserNotification(message, {
      body: 'فتح التطبيق لرؤية جدولك الكامل',
      tag: 'daily-schedule'
    });
  }

  // Check for reminders (run periodically)
  checkReminders() {
    try {
      const now = new Date();
      const todayTasks = this.tasksManager.getTodayTasks();

      if (!todayTasks || !Array.isArray(todayTasks)) {
        return; // Safety check
      }

      todayTasks.forEach(task => {
        try {
          // Check if task has required fields
          if (!task || !task.dueDate || !task.dueTime || !task.id) {
            return; // Skip invalid tasks
          }

          // Check if task is in 10 minutes
          const taskTime = new Date(`${task.dueDate}T${task.dueTime}`);
          
          // Validate date parsing
          if (isNaN(taskTime.getTime())) {
            return; // Skip tasks with invalid times
          }
          
          const minutesUntilTask = (taskTime - now) / (1000 * 60);

          // Notify if 10 minutes before and not already notified
          if (minutesUntilTask > 9 && minutesUntilTask < 11) {
            const alreadyNotified = this.activeNotifications.get(task.id);
            if (!alreadyNotified) {
              this.notifyTaskReminder(task);
              this.activeNotifications.set(task.id, true);
            }
          }

          // Check for overdue
          if (taskTime < now && task.status !== 'completed') {
            const alreadyNotified = this.activeNotifications.get(`overdue-${task.id}`);
            if (!alreadyNotified) {
              this.notifyOverdueTask(task);
              this.activeNotifications.set(`overdue-${task.id}`, true);
            }
          }
        } catch (taskError) {
          // Skip individual task errors silently
          console.debug('Error processing task reminder:', taskError);
        }
      });
    } catch (error) {
      // Log but don't crash
      console.error('Error in checkReminders:', error);
    }
  }

  // Clear old notifications from cache
  clearOldNotifications() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    this.activeNotifications.forEach((value, key) => {
      // Simple cleanup - clear all after some time
      // In production, you'd track timestamps
    });
  }

  // Start notification service
  start() {
    // Check reminders every minute
    this.reminderInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // Every minute

    // Clear old notifications every hour
    this.cleanupInterval = setInterval(() => {
      this.clearOldNotifications();
    }, 3600000); // Every hour

    // Show daily schedule at 8 AM
    this.scheduleDailyNotification();

    console.log('Notifications service started');
  }

  // Stop notification service
  stop() {
    clearInterval(this.reminderInterval);
    clearInterval(this.cleanupInterval);
    console.log('Notifications service stopped');
  }

  // Schedule daily notification
  scheduleDailyNotification() {
    const checkDaily = setInterval(() => {
      const now = new Date();
      
      // Check daily at 8 AM
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        this.notifyDailySchedule();
      }
    }, 60000); // Check every minute
  }

  // Get notification settings
  getSettings() {
    return {
      enabled: 'Notification' in window,
      permitted: Notification?.permission === 'granted'
    };
  }
}

// Create global instance
const notificationsManager = new NotificationsManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  notificationsManager.start();
});

// Stop when page unloads
window.addEventListener('beforeunload', () => {
  notificationsManager.stop();
});

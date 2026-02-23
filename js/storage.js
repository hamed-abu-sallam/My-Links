/**
 * Storage Manager - نظام التخزين الذكي
 * Manages all data persistence using LocalStorage
 */

class StorageManager {
  constructor() {
    this.DB_KEY = 'my_tasks_db';
    this.SETTINGS_KEY = 'my_tasks_settings';
    this.ANALYTICS_KEY = 'my_tasks_analytics';
    this.initializeDB();
  }

  // Initialize database with default structure
  initializeDB() {
    if (!localStorage.getItem(this.DB_KEY)) {
      const defaultDB = {
        tasks: [],
        versions: 1,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.DB_KEY, JSON.stringify(defaultDB));
    }

    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      const defaultSettings = {
        theme: 'dark',
        language: 'ar',
        notifications: true,
        workingHours: {
          academy: { start: 9, end: 13 }, // 9 AM - 1 PM (Teaching)
          freelance: 5, // 5 hours evening
          support: 'flexible', // On-demand
          project: 'flexible' // Flexible
        },
        // Automation defaults
        automation: {
          autoCompletePastDays: true,
          autoCompleteOnEndEnabled: true,
          autoCreateFollowUpEnabled: true,
          followUpDefaultOffsetDays: 1
        }
      };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }

  // Get all tasks
  getAllTasks() {
    try {
      const db = JSON.parse(localStorage.getItem(this.DB_KEY));
      return db.tasks || [];
    } catch (error) {
      console.error('Error reading tasks:', error);
      return [];
    }
  }

  // Add new task
  addTask(task) {
    try {
      const db = JSON.parse(localStorage.getItem(this.DB_KEY));
      const newTask = {
        id: Date.now().toString(),
        title: task.title,
        description: task.description || '',
        category: task.category || 'freelance', // academy, freelance, support, project, other
        priority: task.priority || 'medium', // low, medium, high
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        dueTime: task.dueTime || '09:00',
        duration: task.duration || 1, // in hours
        status: task.status || 'pending', // pending, in-progress, completed
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: this.getCategoryColor(task.category)
      };

      db.tasks.push(newTask);
      localStorage.setItem(this.DB_KEY, JSON.stringify(db));
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  // Update task
  updateTask(taskId, updates) {
    try {
      const db = JSON.parse(localStorage.getItem(this.DB_KEY));
      const task = db.tasks.find(t => t.id === taskId);
      
      if (task) {
        Object.assign(task, updates, {
          updatedAt: new Date().toISOString()
        });
        localStorage.setItem(this.DB_KEY, JSON.stringify(db));
        return task;
      }
      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  // Delete task
  deleteTask(taskId) {
    try {
      const db = JSON.parse(localStorage.getItem(this.DB_KEY));
      db.tasks = db.tasks.filter(t => t.id !== taskId);
      localStorage.setItem(this.DB_KEY, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Get tasks by category
  getTasksByCategory(category) {
    return this.getAllTasks().filter(t => t.category === category);
  }

  // Get tasks by date
  getTasksByDate(date) {
    return this.getAllTasks().filter(t => t.dueDate === date);
  }

  // Get today's tasks
  getTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasksByDate(today);
  }

  // Get incomplete tasks
  getIncompleteTasks() {
    return this.getAllTasks().filter(t => t.status !== 'completed');
  }

  // Get settings
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.SETTINGS_KEY));
    } catch (error) {
      console.error('Error reading settings:', error);
      return {};
    }
  }

  // Update settings
  updateSettings(updates) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  // Get category color
  getCategoryColor(category) {
    const colors = {
      academy: '#6d28d9', // Purple - التدريس/الأكاديمية
      freelance: '#2563eb', // Blue - العمل الحر
      support: '#dc2626', // Red - الدعم
      project: '#059669', // Green - المشاريع
      other: '#ea580c' // Orange - أخرى
    };
    return colors[category] || '#6d28d9';
  }

  // Get analytics data
  getAnalytics() {
    try {
      const tasks = this.getAllTasks();
      const today = new Date().toISOString().split('T')[0];
      
      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        todoTasks: tasks.filter(t => t.status === 'pending').length,
        todayTasks: tasks.filter(t => t.dueDate === today).length,
        byCategory: {
          academy: tasks.filter(t => t.category === 'academy').length,
          freelance: tasks.filter(t => t.category === 'freelance').length,
          support: tasks.filter(t => t.category === 'support').length,
          project: tasks.filter(t => t.category === 'project').length
        },
        completionRate: tasks.length > 0 
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
          : 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }

  // Export tasks as JSON
  exportData() {
    try {
      const db = JSON.parse(localStorage.getItem(this.DB_KEY));
      return JSON.stringify(db, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Clear all data
  clearAll() {
    localStorage.removeItem(this.DB_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    this.initializeDB();
  }

  // Check if month has changed and auto-renew recurring tasks
  autoRenewMonthlyTasks() {
    try {
      const lastRenewalKey = 'last_monthly_renewal';
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const lastRenewal = localStorage.getItem(lastRenewalKey);
      
      // If month changed, auto-renew recurring tasks
      if (lastRenewal !== currentMonth) {
        const db = JSON.parse(localStorage.getItem(this.DB_KEY));
        // نسخ جميع المهام المتكررة (بغض النظر عن الحالة)
        const recurringTasks = db.tasks.filter(t => t.recurring);
        
        let newTasksCount = 0;
        
        // Create new tasks for next month from recurring tasks
        recurringTasks.forEach(task => {
          const newDate = new Date(task.dueDate);
          newDate.setMonth(newDate.getMonth() + 1);
          
          const newTask = {
            ...task,
            id: `${task.id}-${Date.now()}-${Math.random()}`,
            dueDate: newDate.toISOString().split('T')[0],
            status: 'pending',
            completedAt: null,
            createdAt: new Date().toISOString()
          };
          
          db.tasks.push(newTask);
          newTasksCount++;
        });
        
        localStorage.setItem(this.DB_KEY, JSON.stringify(db));
        localStorage.setItem(lastRenewalKey, currentMonth);
        
        console.log(`✅ [AUTO-RENEWAL] تم إنشاء ${newTasksCount} مهمة متكررة للشهر الجديد`);
      }
    } catch (error) {
      console.error('Error auto-renewing monthly tasks:', error);
    }
  }

  // Mark task as recurring
  setTaskRecurring(taskId, recurring = true) {
    const db = JSON.parse(localStorage.getItem(this.DB_KEY));
    const task = db.tasks.find(t => t.id === taskId);
    if (task) {
      task.recurring = recurring;
      localStorage.setItem(this.DB_KEY, JSON.stringify(db));
    }
  }
}

// Create global instance
const storage = new StorageManager();

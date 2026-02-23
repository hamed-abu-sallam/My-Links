/**
 * Tasks Manager - نظام إدارة المهام الذكي
 * Handles all task operations and CRUD
 */

class TasksManager {
  constructor() {
    this.storage = storage;
    this.listeners = [];
  }

  // Add listener for changes
  onChange(callback) {
    this.listeners.push(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // Create new task
  createTask(taskData) {
    const task = this.storage.addTask(taskData);
    if (task) {
      this.notifyListeners();
      showNotification(`✅ تم إضافة المهمة: ${task.title}`, 'success');
    }
    return task;
  }

  // Update existing task
  updateTask(taskId, updates) {
    const task = this.storage.updateTask(taskId, updates);
    if (task) {
      this.notifyListeners();
    }
    return task;
  }

  // Delete task
  deleteTask(taskId) {
    const result = this.storage.deleteTask(taskId);
    if (result) {
      this.notifyListeners();
      showNotification('✓ تم حذف المهمة', 'success');
    }
    return result;
  }

  // Complete task
  completeTask(taskId) {
    return this.updateTask(taskId, { 
      status: 'completed',
      completed: true,
      completedAt: new Date().toISOString()
    });
  }

  // Get tasks with filters
  getTasks(filters = {}) {
    let tasks = this.storage.getAllTasks();

    if (filters.category) {
      tasks = tasks.filter(t => t.category === filters.category);
    }

    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    if (filters.date) {
      tasks = tasks.filter(t => t.dueDate === filters.date);
    }

    if (filters.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    return tasks;
  }

  // Get today's tasks (all tasks for today, not just pending)
  getTodayTasks() {
    return this.storage.getTodayTasks();
  }

  // Get today's schedule
  getTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = this.getTasks({ date: today, status: 'pending' });
    return this.sortByTime(tasks);
  }

  // Sort tasks by time
  sortByTime(tasks) {
    return tasks.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.dueTime}`);
      const timeB = new Date(`2000-01-01T${b.dueTime}`);
      return timeA - timeB;
    });
  }

  // Get next task
  getNextTask() {
    const todayTasks = this.getTodaySchedule();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return todayTasks.find(t => t.dueTime >= currentTime && t.status !== 'completed');
  }

  // Get category summary
  getCategorySummary() {
    const tasks = this.storage.getAllTasks();
    return {
      academy: {
        total: tasks.filter(t => t.category === 'academy').length,
        completed: tasks.filter(t => t.category === 'academy' && t.status === 'completed').length
      },
      freelance: {
        total: tasks.filter(t => t.category === 'freelance').length,
        completed: tasks.filter(t => t.category === 'freelance' && t.status === 'completed').length
      },
      support: {
        total: tasks.filter(t => t.category === 'support').length,
        completed: tasks.filter(t => t.category === 'support' && t.status === 'completed').length
      },
      project: {
        total: tasks.filter(t => t.category === 'project').length,
        completed: tasks.filter(t => t.category === 'project' && t.status === 'completed').length
      }
    };
  }

  // Get time allocation for today
  getTimeAllocation() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = this.getTasks({ date: today });
    
    const allocation = {
      academy: 0,
      freelance: 0,
      support: 0,
      project: 0
    };

    tasks.forEach(task => {
      if (allocation.hasOwnProperty(task.category)) {
        allocation[task.category] += task.duration;
      }
    });

    return allocation;
  }

  // Get conflicts (overlapping tasks)
  getConflicts() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = this.getTasks({ date: today });
    const conflicts = [];

    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];

        if (this.tasksOverlap(task1, task2)) {
          conflicts.push({
            task1: task1.id,
            task2: task2.id,
            message: `تضارب: ${task1.title} و ${task2.title}`
          });
        }
      }
    }

    return conflicts;
  }

  // Check if two tasks overlap
  tasksOverlap(task1, task2) {
    const time1Start = this.timeToMinutes(task1.dueTime);
    const time1End = time1Start + (task1.duration * 60);
    const time2Start = this.timeToMinutes(task2.dueTime);
    const time2End = time2Start + (task2.duration * 60);

    return time1Start < time2End && time1End > time2Start;
  }

  // Convert time string to minutes
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get productivity stats
  getProductivityStats() {
    const tasks = this.storage.getAllTasks();
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory: this.getCategorySummary()
    };
  }

  // Get upcoming tasks (next 7 days)
  getUpcomingTasks() {
    const tasks = this.storage.getAllTasks();
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= today && taskDate <= nextWeek && t.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  // Check if task is overdue
  isOverdue(task) {
    const taskDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    return taskDateTime < new Date() && task.status !== 'completed';
  }

  // Get overdue tasks
  getOverdueTasks() {
    return this.storage.getIncompleteTasks().filter(t => this.isOverdue(t));
  }

  // Update task priority
  updatePriority(taskId, priority) {
    return this.updateTask(taskId, { priority });
  }

  // Reschedule task
  rescheduleTask(taskId, newDate, newTime) {
    return this.updateTask(taskId, {
      dueDate: newDate,
      dueTime: newTime
    });
  }
}

// Create global instance
const tasksManager = new TasksManager();

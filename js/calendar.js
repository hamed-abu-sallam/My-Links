/**
 * Calendar Manager - نظام التقويم الذكي
 * Handles calendar views and date management
 */

class CalendarManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.tasksManager = tasksManager;
    this.viewMode = 'month'; // month, week, day
  }

  // Get current month
  getCurrentMonth() {
    return this.currentDate.getMonth();
  }

  // Get current year
  getCurrentYear() {
    return this.currentDate.getFullYear();
  }

  // Get days in month
  getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Get first day of month
  getFirstDayOfMonth(month, year) {
    return new Date(year, month, 1).getDay();
  }

  // Get calendar days array
  getCalendarDays() {
    const month = this.getCurrentMonth();
    const year = this.getCurrentYear();
    const daysInMonth = this.getDaysInMonth(month, year);
    const firstDay = this.getFirstDayOfMonth(month, year);
    
    const days = [];
    
    // Add empty days from previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.formatDate(new Date(year, month, day));
      const taskCount = this.getTasksCountForDate(dateStr);
      
      days.push({
        day,
        isCurrentMonth: true,
        dateStr,
        taskCount
      });
    }
    
    return days;
  }

  // Format date to YYYY-MM-DD
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Get tasks count for specific date
  getTasksCountForDate(dateStr) {
    const tasks = this.tasksManager.getTasks({ date: dateStr });
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status !== 'completed').length
    };
  }

  // Get week days
  getWeekDays(startDate) {
    const days = [];
    const current = new Date(startDate);
    
    // Get Monday of the week
    current.setDate(current.getDate() - current.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const dateStr = this.formatDate(current);
      const taskCount = this.getTasksCountForDate(dateStr);
      
      days.push({
        day: current.getDate(),
        month: current.getMonth(),
        dateStr,
        taskCount,
        isToday: this.isToday(current)
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Check if date is today
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Next month
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
  }

  // Previous month
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
  }

  // Go to today
  goToToday() {
    this.currentDate = new Date();
  }

  // Get month name
  getMonthName(month) {
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return monthNames[month];
  }

  // Get day name
  getDayName(dayIndex) {
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return dayNames[dayIndex];
  }

  // Get tasks for date range
  getTasksForRange(startDate, endDate) {
    const tasks = this.tasksManager.storage.getAllTasks();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
    });
  }

  // Get upcoming days with tasks
  getUpcomingDaysWithTasks(days = 7) {
    const upcoming = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = this.formatDate(date);
      const tasks = this.tasksManager.getTasks({ date: dateStr });
      
      if (tasks.length > 0) {
        upcoming.push({
          dateStr,
          date,
          tasks,
          hasHighPriority: tasks.some(t => t.priority === 'high')
        });
      }
    }
    
    return upcoming;
  }

  // Get month overview
  getMonthOverview() {
    const month = this.getCurrentMonth();
    const year = this.getCurrentYear();
    const daysInMonth = this.getDaysInMonth(month, year);
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const tasks = this.tasksManager.getTasks({ date: dateStr });
      
      totalTasks += tasks.length;
      completedTasks += tasks.filter(t => t.status === 'completed').length;
    }
    
    return {
      month: this.getMonthName(month),
      year,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }

  // Check if date has high priority tasks
  hasHighPriorityTasks(dateStr) {
    const tasks = this.tasksManager.getTasks({ date: dateStr });
    return tasks.some(t => t.priority === 'high' && t.status !== 'completed');
  }

  // Check if date has overdue tasks
  hasOverdueTasks(dateStr) {
    const tasks = this.tasksManager.getTasks({ date: dateStr });
    const date = new Date(dateStr);
    const now = new Date();
    
    return tasks.some(t => {
      const taskTime = new Date(`${t.dueDate}T${t.dueTime}`);
      return taskTime < now && t.status !== 'completed';
    });
  }

  // Get date info
  getDateInfo(dateStr) {
    const date = new Date(dateStr);
    const tasks = this.tasksManager.getTasks({ date: dateStr });
    
    return {
      date: dateStr,
      dayName: this.getDayName(date.getDay()),
      tasks,
      stats: this.getTasksCountForDate(dateStr),
      isToday: this.isToday(date),
      hasHighPriority: this.hasHighPriorityTasks(dateStr),
      hasOverdue: this.hasOverdueTasks(dateStr)
    };
  }
}

// Create global instance
const calendarManager = new CalendarManager();

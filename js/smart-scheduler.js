/**
 * Smart Scheduler - الجدولة الذكية
 * Intelligent task scheduling and optimization
 */

class SmartScheduler {
  constructor() {
    this.storage = storage;
    this.tasksManager = tasksManager;
  }

  // Get optimized daily schedule
  getOptimizedSchedule(date) {
    const tasks = this.tasksManager.getTasks({ date });
    return this.optimizeSchedule(tasks);
  }

  // Optimize schedule (sort by priority and time)
  optimizeSchedule(tasks) {
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by time
      const timeA = new Date(`2000-01-01T${a.dueTime}`);
      const timeB = new Date(`2000-01-01T${b.dueTime}`);
      return timeA - timeB;
    });
  }

  // Get recommended schedule for today
  getRecommendedSchedule() {
    const today = new Date().toISOString().split('T')[0];
    const settings = this.storage.getSettings();
    
    const schedule = {
      periods: [],
      recommendations: [],
      conflicts: []
    };

    // Company hours: 9 AM - 2 PM (Fixed)
    schedule.periods.push({
      name: '🏢 العمل بالشركة',
      category: 'company',
      startTime: '09:00',
      endTime: '14:00',
      duration: 5,
      tasks: this.tasksManager.getTasks({ 
        category: 'company', 
        date: today,
        status: 'pending'
      })
    });

    // Academy: Before 9 AM (Flexible)
    schedule.periods.push({
      name: '🎓 الأكاديمية',
      category: 'academy',
      startTime: '06:00',
      endTime: '09:00',
      duration: 3,
      tasks: this.tasksManager.getTasks({ 
        category: 'academy', 
        date: today,
        status: 'pending'
      })
    });

    // Support tickets: Throughout the day (On-demand)
    schedule.periods.push({
      name: '🎟️ دعم العملاء',
      category: 'support',
      startTime: '15:00',
      endTime: '16:00',
      duration: 'Flexible',
      maxTasks: 2,
      tasks: this.tasksManager.getTasks({ 
        category: 'support', 
        date: today,
        status: 'pending'
      }).slice(0, 2)
    });

    // Additional Projects: Flexible
    schedule.periods.push({
      name: '📚 مشاريع إضافية',
      category: 'project',
      startTime: '17:00',
      endTime: '18:30',
      duration: 'Flexible',
      tasks: this.tasksManager.getTasks({ 
        category: 'project', 
        date: today,
        status: 'pending'
      }).slice(0, 2)
    });

    // Freelance: After dinner (Flexible)
    const freelanceTasks = this.tasksManager.getTasks({ 
      category: 'freelance', 
      date: today,
      status: 'pending'
    });

    schedule.periods.push({
      name: '💼 العمل الحر',
      category: 'freelance',
      startTime: '20:00',
      endTime: '23:00',
      duration: 5,
      tasks: freelanceTasks
    });

    // Check for conflicts
    schedule.conflicts = this.tasksManager.getConflicts();

    // Generate recommendations
    schedule.recommendations = this.generateRecommendations(schedule);

    return schedule;
  }

  // Generate smart recommendations
  generateRecommendations(schedule) {
    const recommendations = [];
    const timeAllocation = this.tasksManager.getTimeAllocation();

    // Check if freelance time is sufficient
    const freelanceTasks = schedule.periods.find(p => p.category === 'freelance');
    const totalFreelanceDuration = freelanceTasks?.tasks.reduce((sum, t) => sum + t.duration, 0) || 0;
    
    if (totalFreelanceDuration > 5) {
      recommendations.push({
        type: 'warning',
        icon: '⚠️',
        message: `مهام العمل الحر تتطلب ${totalFreelanceDuration} ساعات، لكن المتاح 5 ساعات فقط`,
        action: 'قسّم المهام على عدة أيام'
      });
    }

    // Check for conflicts
    if (schedule.conflicts.length > 0) {
      recommendations.push({
        type: 'error',
        icon: '❌',
        message: `هناك ${schedule.conflicts.length} تضارب(ات) في الجدول`,
        action: 'أعد جدولة المهام المتضاربة'
      });
    }

    // Check academy preparation
    const academyTasks = schedule.periods.find(p => p.category === 'academy');
    if (!academyTasks || academyTasks.tasks.length === 0) {
      recommendations.push({
        type: 'info',
        icon: 'ℹ️',
        message: 'لا توجد مهام أكاديمية محجوزة قبل الذهاب للشركة',
        action: 'أضف مهام التحضير للأكاديمية إذا لزم الأمر'
      });
    }

    return recommendations;
  }

  // Get suggested task timing
  suggestTaskTiming(task) {
    const today = new Date().toISOString().split('T')[0];
    const settings = this.storage.getSettings();
    
    const suggestions = {
      category: task.category,
      options: []
    };

    switch (task.category) {
      case 'academy':
        suggestions.options.push({
          time: '09:00',
          reason: 'وقت التدريس الأساسي (9-1)'
        });
        break;

      case 'project':
        suggestions.options.push({
          time: '17:00',
          reason: 'بعد الظهيرة - مشاريع إضافية'
        });
        break;

      case 'support':
        suggestions.options.push({
          time: '15:00',
          reason: 'دعم العملاء (بعد التدريس)'
        });
        break;

      case 'freelance':
        suggestions.options.push({
          time: '20:00',
          reason: 'العمل الحر بعد الفطور (5 ساعات)'
        });
        break;
    }

    return suggestions;
  }

  // Get time slots availability
  getAvailableSlots(date) {
    const tasks = this.tasksManager.getTasks({ date });
    const slots = [];
    
    // Define work periods
    const periods = [
      { start: 9, end: 13, name: 'التدريس (9-1)' },
      { start: 15, end: 17, name: 'بعد الظهر' },
      { start: 17, end: 20, name: 'المشاريع' },
      { start: 20, end: 23, name: 'العمل الحر' }
    ];

    periods.forEach(period => {
      const occupiedTime = this.getOccupiedTimeInPeriod(tasks, period.start, period.end);
      const availableTime = (period.end - period.start) - occupiedTime;
      
      slots.push({
        period: period.name,
        start: period.start,
        end: period.end,
        available: availableTime,
        percentage: Math.round((availableTime / (period.end - period.start)) * 100)
      });
    });

    return slots;
  }

  // Get occupied time in period
  getOccupiedTimeInPeriod(tasks, startHour, endHour) {
    return tasks.reduce((total, task) => {
      const taskStart = this.timeToHours(task.dueTime);
      const taskEnd = taskStart + task.duration;

      const overlapStart = Math.max(taskStart, startHour);
      const overlapEnd = Math.min(taskEnd, endHour);

      if (overlapStart < overlapEnd) {
        total += (overlapEnd - overlapStart);
      }

      return total;
    }, 0);
  }

  // Convert time string to hours
  timeToHours(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  // Get priority score for task (for sorting)
  calculatePriorityScore(task) {
    let score = 0;

    // Priority weight
    const priorityWeights = { high: 30, medium: 20, low: 10 };
    score += priorityWeights[task.priority] || 20;

    // Time urgency
    const now = new Date();
    const taskDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    const hoursUntilDue = (taskDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilDue < 1) score += 50;
    else if (hoursUntilDue < 4) score += 30;
    else if (hoursUntilDue < 12) score += 15;

    // Category weight
    const categoryWeights = { company: 25, support: 30, academy: 20, freelance: 10 };
    score += categoryWeights[task.category] || 15;

    return score;
  }

  // Get next milestone/event
  getNextImportantEvent() {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todayTasks = this.tasksManager.getTasks({
      date: today.toISOString().split('T')[0]
    }).filter(t => t.priority === 'high' && t.status !== 'completed');

    if (todayTasks.length > 0) {
      return {
        type: 'today_high_priority',
        count: todayTasks.length,
        tasks: todayTasks
      };
    }

    const overdue = this.tasksManager.getOverdueTasks();
    if (overdue.length > 0) {
      return {
        type: 'overdue',
        count: overdue.length,
        tasks: overdue
      };
    }

    return null;
  }
}

// Create global instance
const smartScheduler = new SmartScheduler();

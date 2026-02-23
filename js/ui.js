/**
 * UI Manager - واجهة المستخدم
 * Handles all UI interactions and rendering
 */

class UIManager {
  constructor() {
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderDashboard();
    this.renderCalendar();
    this.setupTabNavigation();
  }

  // Setup tab navigation
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Refresh content if needed
        if (tabName === 'calendar') {
          this.refreshCalendar();
        } else if (tabName === 'tasks') {
          this.refreshTasks();
        }
      });
    });
  }

  // Setup form event listeners
  setupEventListeners() {
    // Add task form
    const form = document.getElementById('addTaskForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddTask(e));
    }

    // Load predefined tasks button
    const loadTasksBtn = document.getElementById('loadPredefinedTasks');
    if (loadTasksBtn) {
      loadTasksBtn.addEventListener('click', () => this.showLoadTasksModal());
    }

    // Import file input
    const importFileInput = document.getElementById('importTasksFile');
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          taskImporter.importFromJSON(e.target.files[0]);
          e.target.value = ''; // Reset input
        }
      });
    }

    // Settings button & modal
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        this.showSettingsModal();
      });
    }

    // Save settings handler (modal)
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'saveSettingsBtn') {
        const autoPast = document.getElementById('optAutoCompletePastDays').checked;
        const autoEnd = document.getElementById('optAutoCompleteOnEnd').checked;
        const autoFollow = document.getElementById('optAutoCreateFollowUp').checked;
        const followOffset = parseInt(document.getElementById('optFollowUpOffset').value, 10) || 1;

        storage.updateSettings({
          automation: {
            autoCompletePastDays: !!autoPast,
            autoCompleteOnEndEnabled: !!autoEnd,
            autoCreateFollowUpEnabled: !!autoFollow,
            followUpDefaultOffsetDays: followOffset
          }
        });

        document.getElementById('settingsModal').style.display = 'none';
        showNotification('✅ تم حفظ إعدادات الأتمتة', 'success');
        this.refresh();
      }
    });

    // Task filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderTasksList();
      });
    });

    // Calendar navigation
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (prevBtn) prevBtn.addEventListener('click', () => this.previousMonth());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());

    // Listen for task changes
    tasksManager.onChange(() => {
      this.refreshTasks();
      this.refreshCalendar();
    });
  }

  // Handle add task form submission
  handleAddTask(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const category = document.getElementById('taskCategory').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value;

    if (!title || !category || !date || !time || !duration) {
      showNotification('من فضلك ملأ جميع الحقول المطلوبة', 'warning');
      return;
    }

    tasksManager.createTask({
      title,
      category,
      dueDate: date,
      dueTime: time,
      duration,
      priority,
      description
    });

    // Reset form
    document.getElementById('addTaskForm').reset();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
  }

  // Render dashboard summary
  renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasksManager.getTasks({ date: today });
    const stats = tasksManager.getProductivityStats();
    const overdue = tasksManager.getOverdueTasks();

    // Update dashboard cards
    document.getElementById('todayTasksCount').textContent = todayTasks.length;
    document.getElementById('completionRate').textContent = stats.completionRate;
    document.getElementById('totalTasksCount').textContent = stats.total;
    document.getElementById('overdueCount').textContent = overdue.length;

    this.renderSchedule();
    this.renderRecommendations();
    this.renderTasksList();
  }

  // Render today's schedule
  renderSchedule() {
    const today = new Date().toISOString().split('T')[0];

    // Get tasks by category
    const categories = ['academy', 'support', 'project', 'freelance'];
    
    categories.forEach(category => {
      const container = document.getElementById(`${category}-tasks`);
      if (!container) return;

      const tasks = tasksManager.getTasks({ 
        category, 
        date: today,
        status: 'pending'
      });

      if (tasks.length === 0) {
        container.innerHTML = '<p class="no-tasks">لا توجد مهام</p>';
        return;
      }

      container.innerHTML = tasks.map(task => `
        <div class="period-task ${task.category}">
          <div class="task-item-header">
            <span class="task-item-title">${task.title}</span>
            <span class="task-item-time">${task.dueTime}</span>
          </div>
          <div class="task-item-duration">المدة: ${task.duration} ساعات</div>
        </div>
      `).join('');
    });
  }

  // Render recommendations
  renderRecommendations() {
    const schedule = smartScheduler.getRecommendedSchedule();
    const container = document.getElementById('recommendationsList');

    if (schedule.recommendations.length === 0) {
      container.innerHTML = '<p class="no-recommendations">لا توجد توصيات حالياً</p>';
      return;
    }

    container.innerHTML = schedule.recommendations.map(rec => `
      <div class="recommendation ${rec.type}">
        <span class="recommendation-icon">${rec.icon}</span>
        <div class="recommendation-content">
          <div class="recommendation-message">${rec.message}</div>
          <div class="recommendation-action">${rec.action}</div>
        </div>
      </div>
    `).join('');
  }

  // Render tasks list
  renderTasksList() {
    let tasks = tasksManager.storage.getAllTasks();

    // Filter by status
    if (this.currentFilter === 'pending') {
      tasks = tasks.filter(t => t.status !== 'completed');
    } else if (this.currentFilter === 'completed') {
      tasks = tasks.filter(t => t.status === 'completed');
    }

    // Sort by date and time
    tasks.sort((a, b) => {
      const aTime = new Date(`${a.dueDate}T${a.dueTime}`);
      const bTime = new Date(`${b.dueDate}T${b.dueTime}`);
      return bTime - aTime;
    });

    const container = document.getElementById('tasksList');

    if (tasks.length === 0) {
      container.innerHTML = '<p class="no-tasks-message">لا توجد مهام</p>';
      return;
    }

    container.innerHTML = tasks.map(task => `
      <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-category-badge">${this.getCategoryName(task.category)}</span>
            <span>${this.formatDateTime(task.dueDate, task.dueTime)}</span>
            <span>${task.duration}h</span>
            <span class="task-priority ${task.priority}">
              ${this.getPriorityIcon(task.priority)} ${this.getPriorityName(task.priority)}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn edit-btn" title="تحرير">
            <i class="fas fa-edit"></i>
          </button>
          <button class="task-action-btn delete-btn" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const taskId = e.target.closest('.task-item').dataset.taskId;
        const isChecked = e.target.checked;
        
        if (isChecked) {
          tasksManager.completeTask(taskId);
        } else {
          tasksManager.updateTask(taskId, { status: 'pending', completed: false });
        }
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.closest('.task-item').dataset.taskId;
        if (confirm('هل تريد حذف هذه المهمة؟')) {
          tasksManager.deleteTask(taskId);
        }
      });
    });
  }

  // Refresh tasks display
  refreshTasks() {
    this.renderDashboard();
  }

  // Refresh calendar display
  refreshCalendar() {
    this.renderCalendar();
  }

  // General refresh method
  refresh() {
    this.renderDashboard();
    this.renderCalendar();
    this.renderTasksList();
  }

  // Render calendar
  renderCalendar() {
    this.renderCalendarDays();
    this.renderMonthOverview();
    this.renderUpcomingEvents();
  }

  // Render calendar days
  renderCalendarDays() {
    const days = calendarManager.getCalendarDays();
    const container = document.getElementById('calendarDays');
    const monthYear = document.getElementById('monthYear');

    // Update month/year header
    const month = calendarManager.getMonthName(calendarManager.getCurrentMonth());
    monthYear.textContent = `${month} ${calendarManager.getCurrentYear()}`;

    // Render days
    container.innerHTML = days.map(day => {
      if (!day.isCurrentMonth) {
        return '<div class="calendar-day other-month"></div>';
      }

      const isToday = calendarManager.isToday(new Date(day.dateStr));
      const hasHighPriority = calendarManager.hasHighPriorityTasks(day.dateStr);
      const hasOverdue = calendarManager.hasOverdueTasks(day.dateStr);

      let classes = 'calendar-day';
      if (isToday) classes += ' today';
      if (hasHighPriority) classes += ' has-high-priority';
      if (hasOverdue) classes += ' has-overdue';

      return `
        <div class="${classes}" data-date="${day.dateStr}">
          <div class="day-date">${day.day}</div>
          <div class="day-info">
            ${day.taskCount.pending > 0 ? `
              <span class="day-tasks-count ${day.taskCount.pending > 3 ? 'many' : ''}">
                ${day.taskCount.pending} مهام
              </span>
            ` : ''}
            ${day.taskCount.pending > 0 ? '<div class="day-indicator"></div>' : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
      day.addEventListener('click', () => {
        const date = day.dataset.date;
        this.showDateDetails(date);
      });
    });
  }

  // Render month overview
  renderMonthOverview() {
    const overview = calendarManager.getMonthOverview();

    document.getElementById('monthTotalTasks').textContent = overview.totalTasks;
    document.getElementById('monthCompletedTasks').textContent = overview.completedTasks;
    document.getElementById('monthCompletionRate').textContent = overview.completionRate + '%';
  }

  // Render upcoming events
  renderUpcomingEvents() {
    const upcoming = calendarManager.getUpcomingDaysWithTasks(7);
    const container = document.getElementById('upcomingEventsList');

    if (upcoming.length === 0) {
      container.innerHTML = '<p class="no-events">لا توجد أحداث</p>';
      return;
    }

    container.innerHTML = upcoming.map(event => `
      <div class="event-item">
        <div class="event-date">${this.formatDate(event.dateStr)}</div>
        <div class="event-tasks">
          ${event.tasks.map(task => `
            <div class="event-task">
              <span class="event-task-icon">${this.getCategoryEmoji(task.category)}</span>
              <span>${task.title}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Refresh calendar
  refreshCalendar() {
    this.renderCalendar();
  }

  // Calendar navigation
  previousMonth() {
    calendarManager.previousMonth();
    this.refreshCalendar();
  }

  nextMonth() {
    calendarManager.nextMonth();
    this.refreshCalendar();
  }

  // Show date details (popup)
  showDateDetails(date) {
    const dateInfo = calendarManager.getDateInfo(date);
    // Could implement modal or highlight tasks for this date
    console.log('Date details:', dateInfo);
  }

  // Helper functions
  getCategoryName(category) {
    const names = {
      academy: '🏫 التدريس',
      freelance: '💼 العمل الحر',
      support: '🎟️ دعم العملاء',
      project: '📚 مشاريع'
    };
    return names[category] || category;
  }

  getCategoryEmoji(category) {
    const emojis = {
      academy: '🏫',
      freelance: '💼',
      support: '🎟️',
      project: '📚'
    };
    return emojis[category] || '📌';
  }

  getPriorityName(priority) {
    const names = {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    };
    return names[priority] || priority;
  }

  getPriorityIcon(priority) {
    const icons = {
      high: '↑',
      medium: '→',
      low: '↓'
    };
    return icons[priority] || '';
  }

  // Show modal for loading tasks
  showLoadTasksModal() {
    const modal = document.getElementById('loadTasksModal');
    if (!modal) {
      this.createLoadTasksModal();
    } else {
      document.getElementById('loadTasksModal').style.display = 'block';
    }
  }

  // Create load tasks modal
  createLoadTasksModal() {
    const html = `
      <div class="modal" id="loadTasksModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>📥 تحميل المهام</h2>
            <button class="modal-close" onclick="document.getElementById('loadTasksModal').style.display = 'none'">×</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 20px;">
              <h3>الخيار 1: تحميل مهام فبراير المجدولة</h3>
              <p style="color: var(--text-secondary); margin: 10px 0;">سيتم تحميل جميع المهام المخطط لها لشهر فبراير</p>
              <button id="loadFebTasksBtn" class="btn btn-primary" style="width: 100%; padding: 12px;">
                <i class="fas fa-download"></i> تحميل مهام فبراير
              </button>
            </div>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 20px 0;">
            <div style="margin-bottom: 20px;">
              <h3>الخيار 2: استيراد من ملف</h3>
              <p style="color: var(--text-secondary); margin: 10px 0;">استيراد مهام من ملف JSON</p>
              <input type="file" id="importTasksFileModal" accept=".json" style="display: block; margin: 10px 0; width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px;">
              <button id="importFileBtn" class="btn btn-secondary" style="width: 100%; padding: 12px;">
                <i class="fas fa-file-import"></i> استيراد الملف
              </button>
            </div>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 20px 0;">
            <div>
              <h3>الخيار 3: تصدير المهام الحالية</h3>
              <p style="color: var(--text-secondary); margin: 10px 0;">حفظ المهام الحالية كملف JSON</p>
              <button id="exportTasksBtn" class="btn btn-secondary" style="width: 100%; padding: 12px;">
                <i class="fas fa-download"></i> تصدير المهام
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = document.body;
    container.insertAdjacentHTML('beforeend', html);

    // Setup event listeners
    document.getElementById('loadFebTasksBtn').addEventListener('click', async () => {
      const result = await taskImporter.loadMonthlyTasks();
      if (result.success) {
        showNotification(`✅ تم تحميل ${result.importedCount} مهمة`, 'success');
        document.getElementById('loadTasksModal').style.display = 'none';
        this.refresh();
      }
    });

    document.getElementById('importFileBtn').addEventListener('click', () => {
      const fileInput = document.getElementById('importTasksFileModal');
      if (fileInput.files && fileInput.files[0]) {
        taskImporter.importFromJSON(fileInput.files[0]);
        document.getElementById('loadTasksModal').style.display = 'none';
      } else {
        showNotification('اختر ملفاً أولاً', 'warning');
      }
    });

    document.getElementById('exportTasksBtn').addEventListener('click', () => {
      const date = new Date().toISOString().split('T')[0];
      taskImporter.exportToJSON(`tasks-${date}.json`);
    });

    // Close modal on outside click
    document.getElementById('loadTasksModal').addEventListener('click', (e) => {
      if (e.target.id === 'loadTasksModal') {
        e.target.style.display = 'none';
      }
    });
  }

  // Show settings modal and populate values
  showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    // Load current settings
    const settings = (typeof storage !== 'undefined') ? storage.getSettings() : {};
    const automation = settings.automation || {};

    document.getElementById('optAutoCompletePastDays').checked = !!automation.autoCompletePastDays;
    document.getElementById('optAutoCompleteOnEnd').checked = !!automation.autoCompleteOnEndEnabled;
    document.getElementById('optAutoCreateFollowUp').checked = !!automation.autoCreateFollowUpEnabled;
    document.getElementById('optFollowUpOffset').value = automation.followUpDefaultOffsetDays || 1;

    modal.style.display = 'block';
  }

  formatDateTime(date, time) {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1} ${time}`;
  }

  formatDate(date) {
    const d = new Date(date);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
  }
}

// Initialize UI
const uiManager = new UIManager();

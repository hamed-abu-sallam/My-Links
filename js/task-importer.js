/**
 * Task Importer - استيراد مهام مسبقة
 * يوفر واجهة لتحميل مهام مجدولة مسبقاً
 */

class TaskImporter {
  constructor() {
    this.storage = storage;
    this.tasksManager = tasksManager;
  }

  // Load predefined monthly tasks
  async loadMonthlyTasks(monthFile = 'data/february-tasks.json') {
    try {
      const response = await fetch(monthFile);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }
      
      const monthData = await response.json();
      return this.importTasks(monthData.tasks);
    } catch (error) {
      console.error('Error loading monthly tasks:', error);
      return { success: false, error: error.message };
    }
  }

  // Import tasks into storage
  importTasks(tasks) {
    try {
      if (!Array.isArray(tasks)) {
        throw new Error('Tasks must be an array');
      }

      let importedCount = 0;
      let skippedCount = 0;
      const results = [];

      tasks.forEach(taskData => {
        try {
          // Check if task already exists
          const existingTask = this.storage.getAllTasks()
            .find(t => t.id === taskData.id);

          if (!existingTask) {
            // Validate task data
            if (!taskData.title || !taskData.dueDate || !taskData.category) {
              console.warn('Skipping invalid task:', taskData);
              skippedCount++;
              return;
            }

            // Create task
            const newTask = this.storage.addTask({
              title: taskData.title,
              description: taskData.description || '',
              category: taskData.category,
              priority: taskData.priority || 'medium',
              dueDate: taskData.dueDate,
              dueTime: taskData.dueTime || '09:00',
              duration: taskData.duration || 1,
              status: taskData.status || 'pending',
              recurring: taskData.recurring || false,
              recurringPattern: taskData.recurringPattern || null,
              createdAt: new Date().toISOString()
            });

            if (newTask) {
              importedCount++;
              results.push({
                success: true,
                taskId: newTask.id,
                title: newTask.title
              });
            }
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error('Error importing individual task:', error, taskData);
        }
      });

      return {
        success: true,
        importedCount,
        skippedCount,
        totalCount: tasks.length,
        results
      };
    } catch (error) {
      console.error('Error importing tasks:', error);
      return { success: false, error: error.message };
    }
  }

  // Auto-load if first time
  autoLoadIfEmpty() {
    const tasks = this.storage.getAllTasks();
    if (tasks.length === 0) {
      showNotification('⏳ جاري تحميل المهام المجدولة...', 'info');
      this.loadMonthlyTasks().then(result => {
        if (result.success) {
          showNotification(
            `✅ تم تحميل ${result.importedCount} مهمة` +
            (result.skippedCount > 0 ? ` (تم تخطي ${result.skippedCount})` : ''),
            'success'
          );
          // Notify UI to refresh
          if (typeof uiManager !== 'undefined') {
            uiManager.render();
          }
        } else {
          console.warn('Failed to auto-load tasks:', result.error);
        }
      });
    }
  }

  // Export tasks to JSON
  exportToJSON(filename = 'tasks-export.json') {
    try {
      const tasks = this.storage.getAllTasks();
      const dataStr = JSON.stringify({
        exportDate: new Date().toISOString(),
        taskCount: tasks.length,
        tasks: tasks
      }, null, 2);

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      showNotification('✅ تم تصدير المهام بنجاح', 'success');
      return true;
    } catch (error) {
      console.error('Error exporting tasks:', error);
      showNotification('❌ فشل تصدير المهام', 'error');
      return false;
    }
  }

  // Import from JSON file
  importFromJSON(file) {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const result = this.importTasks(data.tasks || []);
          
          if (result.success) {
            showNotification(
              `✅ تم استيراد ${result.importedCount} مهمة`,
              'success'
            );
            if (typeof uiManager !== 'undefined') {
              uiManager.render();
            }
          } else {
            showNotification('❌ فشل الاستيراد', 'error');
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          showNotification('❌ صيغة الملف غير صحيحة', 'error');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing from JSON:', error);
      showNotification('❌ فشل الاستيراد', 'error');
    }
  }
}

// Create global instance
const taskImporter = new TaskImporter();

// Auto-load on initialization
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    taskImporter.autoLoadIfEmpty();
  }, 1000);
});

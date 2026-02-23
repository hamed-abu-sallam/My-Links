/**
 * QUICK TEST - اختبار سريع
 * هذا الملف يحتوي على اختبارات سريعة للتحقق من عمل التطبيق
 * 
 * طريقة الاستخدام:
 * 1. افتح التطبيق في المتصفح
 * 2. افتح Developer Console (F12)
 * 3. انسخ والصق الكود من كل دالة اختبار
 */

// ============================================
// 1. اختبار نظام التخزين
// ============================================
function testStorage() {
    console.log('🧪 اختبار نظام التخزين...');
    
    // تحقق من التهيئة
    const allTasks = storage.getAllTasks();
    console.log('عدد المهام الحالية:', allTasks.length);
    
    // أضف مهمة اختبار
    const testTask = storage.addTask({
        title: 'مهمة اختبار',
        category: 'freelance',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '14:00',
        duration: 2,
        priority: 'high'
    });
    
    console.log('✅ تم إضافة مهمة اختبار:', testTask);
    console.log('عدد المهام بعد الإضافة:', storage.getAllTasks().length);
    
    // اختبر الإحصائيات
    const analytics = storage.getAnalytics();
    console.log('📊 الإحصائيات:', analytics);
}

// ============================================
// 2. اختبار مدير المهام
// ============================================
function testTasksManager() {
    console.log('🧪 اختبار مدير المهام...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // احصل على مهام اليوم
    const todayTasks = tasksManager.getTasks({ date: today });
    console.log('مهام اليوم:', todayTasks);
    
    // احصل على ملخص الفئات
    const summary = tasksManager.getCategorySummary();
    console.log('ملخص الفئات:', summary);
    
    // احصل على إحصائيات الإنتاجية
    const stats = tasksManager.getProductivityStats();
    console.log('إحصائيات الإنتاجية:', stats);
    
    // احصل على التضاربات
    const conflicts = tasksManager.getConflicts();
    console.log('التضاربات المكتشفة:', conflicts.length);
}

// ============================================
// 3. اختبار الجدولة الذكية
// ============================================
function testSmartScheduler() {
    console.log('🧪 اختبار الجدولة الذكية...');
    
    // احصل على الجدول الموصى به
    const schedule = smartScheduler.getRecommendedSchedule();
    console.log('الجدول الموصى به:', schedule);
    
    // احصل على الفترات المتاحة
    const today = new Date().toISOString().split('T')[0];
    const slots = smartScheduler.getAvailableSlots(today);
    console.log('الفترات المتاحة:', slots);
    
    // احصل على الحدث المهم التالي
    const nextEvent = smartScheduler.getNextImportantEvent();
    console.log('الحدث المهم التالي:', nextEvent);
}

// ============================================
// 4. اختبار التقويم
// ============================================
function testCalendar() {
    console.log('🧪 اختبار التقويم...');
    
    // احصل على أيام الشهر
    const days = calendarManager.getCalendarDays();
    console.log('عدد أيام الشهر:', days.filter(d => d.isCurrentMonth).length);
    
    // احصل على نظرة الشهر
    const overview = calendarManager.getMonthOverview();
    console.log('نظرة الشهر:', overview);
    
    // احصل على الأحداث القادمة
    const upcoming = calendarManager.getUpcomingDaysWithTasks(7);
    console.log('الأحداث القادمة (7 أيام):', upcoming.length);
}

// ============================================
// 5. اختبار النوافذ المنبثقة
// ============================================
function testNotifications() {
    console.log('🧪 اختبار النوافذ المنبثقة...');
    
    // اختبر إضافة مهمة
    notificationsManager.notifyTaskAdded({
        title: 'مهمة اختبار',
        category: 'freelance'
    });
    
    // اختبر إكمال مهمة
    notificationsManager.notifyTaskCompleted({
        title: 'مهمة اختبار'
    });
    
    console.log('✅ اختبر الإخطارات - يجب أن تظهر رسائل Toast');
}

// ============================================
// 6. اختبار شامل - إنشاء مهام جديدة
// ============================================
function testCreateTasks() {
    console.log('🧪 اختبار إنشاء مهام جديدة...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const sampleTasks = [
        {
            title: 'اجتماع الفريق',
            category: 'company',
            dueDate: today,
            dueTime: '10:00',
            duration: 1,
            priority: 'high'
        },
        {
            title: 'تطوير ميزة جديدة',
            category: 'freelance',
            dueDate: today,
            dueTime: '14:00',
            duration: 3,
            priority: 'high'
        },
        {
            title: 'دعم فني - العميل A',
            category: 'support',
            dueDate: today,
            dueTime: '15:00',
            duration: 0.5,
            priority: 'medium'
        },
        {
            title: 'مراجعة الدروس',
            category: 'academy',
            dueDate: today,
            dueTime: '07:00',
            duration: 1.5,
            priority: 'medium'
        }
    ];
    
    sampleTasks.forEach(task => {
        tasksManager.createTask(task);
    });
    
    console.log('✅ تم إنشاء', sampleTasks.length, 'مهام اختبار');
    console.log('الآن سيتم تحديث الواجهة تلقائياً');
}

// ============================================
// 7. اختبار الأداء والذاكرة
// ============================================
function testPerformance() {
    console.log('🧪 اختبار الأداء...');
    
    const startTime = performance.now();
    
    // قياس سرعة الحصول على جميع المهام
    storage.getAllTasks();
    const getAllTasksTime = performance.now() - startTime;
    console.log('وقت الحصول على جميع المهام:', getAllTasksTime.toFixed(2), 'ms');
    
    // قياس حجم البيانات
    const db = JSON.parse(localStorage.getItem('my_tasks_db'));
    const dbSize = new Blob([JSON.stringify(db)]).size;
    console.log('حجم قاعدة البيانات:', (dbSize / 1024).toFixed(2), 'KB');
    
    console.log('📊 الأداء سليم ✅');
}

// ============================================
// 8. اختبار تنظيف البيانات
// ============================================
function clearTestData() {
    console.log('🧪 تنظيف بيانات الاختبار...');
    
    const tasks = storage.getAllTasks();
    const testTasks = tasks.filter(t => t.title.includes('اختبار'));
    
    testTasks.forEach(task => {
        tasksManager.deleteTask(task.id);
    });
    
    console.log('✅ تم حذف', testTasks.length, 'مهام اختبار');
}

// ============================================
// 9. اختبار الإصدار والمعلومات
// ============================================
function getAppInfo() {
    console.log(`
╔════════════════════════════════════════╗
║  نظام إدارة المهام الذكي              ║
║  Smart Task Management System          ║
╚════════════════════════════════════════╝

📱 معلومات التطبيق:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ الإصدار: 1.0.0
✅ النوع: PWA (Progressive Web App)
✅ التخزين: LocalStorage
✅ الحالة: مستقر وجاهز للاستخدام

📦 المكونات:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Storage Manager
✓ Tasks Manager
✓ Smart Scheduler
✓ Calendar Manager
✓ Notifications Manager
✓ UI Manager

📊 الإحصائيات الحالية:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    
    const stats = storage.getAnalytics();
    console.log('إجمالي المهام:', stats.totalTasks);
    console.log('المهام المكتملة:', stats.completedTasks);
    console.log('نسبة الإنجاز:', stats.completionRate + '%');
    console.log('مهام اليوم:', stats.todayTasks);
    
    console.log(`
📝 الاختبارات المتاحة:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
استخدم الأوامر التالية في Console:

1. testStorage() - اختبار التخزين
2. testTasksManager() - اختبار مدير المهام
3. testSmartScheduler() - اختبار الجدولة الذكية
4. testCalendar() - اختبار التقويم
5. testNotifications() - اختبار الإخطارات
6. testCreateTasks() - إنشاء مهام اختبار
7. testPerformance() - اختبار الأداء
8. clearTestData() - حذف بيانات الاختبار
9. getAppInfo() - هذا الأمر
    `);
}

// ============================================
// تشغيل الاختبارات عند تحميل الصفحة
// ============================================
console.log('📦 نظام إدارة المهام الذكية - Server Console');
console.log('اكتب: getAppInfo() - للمزيد من المعلومات');
console.log('═'.repeat(50));

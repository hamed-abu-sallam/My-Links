# 🛠️ التوثيق التقني - Technical Documentation

> دليل شامل للبنية التقنية ومعمارية التطبيق

---

## 📚 فهرس المحتويات

1. [البنية المعمارية](#البنية-المعمارية)
2. [الملفات والمكونات](#الملفات-والمكونات)
3. [API الداخلي](#api-الداخلي)
4. [نماذج البيانات](#نماذج-البيانات)
5. [المتغيرات والثوابت](#المتغيرات-والثوابت)
6. [الدوال الرئيسية](#الدوال-الرئيسية)
7. [الأحداث والـ Listeners](#الأحداث-والـ-listeners)

---

## البنية المعمارية

### Layer Architecture (طبقات المعمارية)

```
┌─────────────────────────────────────────────┐
│          UI Layer (واجهة المستخدم)          │
│          js/ui.js - UIManager               │
├─────────────────────────────────────────────┤
│      Business Logic Layer (منطق العمل)      │
│  - Tasks Manager   (إدارة المهام)          │
│  - Smart Scheduler (الجدولة الذكية)        │
│  - Calendar        (التقويم)               │
│  - Notifications   (التنبيهات)             │
├─────────────────────────────────────────────┤
│      Data Layer (طبقة البيانات)            │
│      js/storage.js - Storage Manager        │
├─────────────────────────────────────────────┤
│    Browser APIs (LocalStorage, Notifications)
└─────────────────────────────────────────────┘
```

---

## الملفات والمكونات

### 1. **js/storage.js** - مدير التخزين
**المسؤول**: إدارة جميع عمليات التخزين والقراءة من LocalStorage

**الفئات**:
- `StorageManager` - يدير قاعدة البيانات المحلية

**الدوال الرئيسية**:
```javascript
// CRUD Operations
getAllTasks()           // الحصول على جميع المهام
addTask(taskData)       // إضافة مهمة جديدة
updateTask(id, updates) // تحديث مهمة
deleteTask(id)          // حذف مهمة

// Queries
getTasksByCategory(cat)     // المهام حسب التصنيف
getTasksByDate(date)        // المهام حسب التاريخ
getTodayTasks()            // مهام اليوم
getIncompleteTasks()       // المهام غير المكتملة

// Utilities
getAnalytics()             // الإحصائيات
exportData()               // تصدير البيانات
clearAll()                 // مسح جميع البيانات
```

**هيكل البيانات**:
```javascript
{
  tasks: [
    {
      id: "timestamp",
      title: "اسم المهمة",
      description: "الوصف",
      category: "company|freelance|support|academy|project",
      priority: "low|medium|high",
      dueDate: "YYYY-MM-DD",
      dueTime: "HH:mm",
      duration: 2.5,  // بالساعات
      status: "pending|in-progress|completed",
      completed: false,
      color: "#6d28d9",
      createdAt: "ISO8601",
      updatedAt: "ISO8601",
      completedAt: "ISO8601"
    }
  ],
  version: 1,
  createdAt: "ISO8601"
}
```

---

### 2. **js/tasks-manager.js** - مدير المهام
**المسؤول**: منطق إدارة المهام والفلترة والفرز

**الفئات**:
- `TasksManager` - يدير عمليات المهام

**الدوال الرئيسية**:
```javascript
// CRUD
createTask(data)            // إنشاء مهمة
updateTask(id, updates)     // تحديث مهمة
deleteTask(id)              // حذف مهمة
completeTask(id)            // إكمال مهمة

// Queries & Filters
getTasks(filters)           // الحصول على مهام مع فلاتر
getTodaySchedule()          // جدول اليوم
getNextTask()               // المهمة التالية
getCategorySummary()        // ملخص الفئات
getTimeAllocation()         // توزيع الوقت

// Analysis
getConflicts()              // اكتشاف التضاربات
getProductivityStats()      // إحصائيات الإنتاجية
getUpcomingTasks()          // المهام القادمة (7 أيام)
getOverdueTasks()           // المهام المتأخرة
```

**الأحداث**:
```javascript
tasksManager.onChange(callback) // استمع للتغيرات
```

---

### 3. **js/smart-scheduler.js** - الجدولة الذكية
**المسؤول**: الجدولة الذكية والتوصيات

**الفئات**:
- `SmartScheduler` - يدير الجدولة الذكية

**الدوال الرئيسية**:
```javascript
// Schedule Management
getOptimizedSchedule(date)       // جدول محسّن
getRecommendedSchedule()         // جدول موصى به
optimizeSchedule(tasks)          // تحسين الجدول

// Analysis
generateRecommendations(schedule) // توليد التوصيات
suggestTaskTiming(task)           // اقتراح وقت للمهمة
getAvailableSlots(date)           // الفترات المتاحة
getNextImportantEvent()           // الحدث المهم التالي

// Utilities
calculatePriorityScore(task)      // حساب نقاط الأولوية
getOccupiedTimeInPeriod(tasks, start, end) // الوقت المستخدم
```

**فترات العمل الافتراضية**:
```javascript
{
  academy: { start: 6, end: 9, duration: 3 },
  company: { start: 9, end: 14, duration: 5 },
  support: { start: 14, end: 18, duration: 'flexible', maxTasks: 2 },
  freelance: { start: 18, end: 23, duration: 5 }
}
```

---

### 4. **js/calendar.js** - التقويم
**المسؤول**: عمليات التقويم والتواريخ

**الفئات**:
- `CalendarManager` - يدير التقويم

**الدوال الرئيسية**:
```javascript
// Navigation
getCurrentMonth()          // الشهر الحالي
getCurrentYear()           // السنة الحالية
nextMonth()               // الشهر التالي
previousMonth()           // الشهر السابق
goToToday()               // اليوم الحالي

// Calendar Data
getCalendarDays()         // أيام الشهر
getWeekDays(startDate)    // أيام الأسبوع
getDaysInMonth()          // عدد أيام الشهر
getFirstDayOfMonth()      // أول يوم في الشهر

// Queries
getTasksForRange(s, e)    // المهام في نطاق
getDateInfo(dateStr)      // معلومات التاريخ
getUpcomingDaysWithTasks(days) // الأيام القادمة
getMonthOverview()        // نظرة الشهر
hasHighPriorityTasks()    // هل توجد مهام عالية الأولوية
hasOverdueTasks()         // هل توجد مهام متأخرة

// Helpers
isToday(date)             // هل التاريخ اليوم
getMonthName(month)       // اسم الشهر
getDayName(day)           // اسم اليوم
```

---

### 5. **js/notifications.js** - التنبيهات
**المسؤول**: إدارة التنبيهات والإخطارات

**الفئات**:
- `NotificationsManager` - يدير التنبيهات

**الدوال الرئيسية**:
```javascript
// Permission & Setup
initializeNotifications()      // تهيئة الإخطارات
requestPermission()            // طلب الإذن

// Browser Notifications
showBrowserNotification(title, options) // إخطار متصفح

// App Notifications
notifyTaskReminder(task)       // تنبيه المهمة (10 دقائق)
notifyTaskAdded(task)          // إخطار إضافة مهمة
notifyTaskCompleted(task)      // إخطار إكمال مهمة
notifyOverdueTask(task)        // إخطار مهمة متأخرة
notifyDailySchedule()          // جدول يومي

// Scheduling
start()                        // بدء خدمة التنبيهات
stop()                         // إيقاف الخدمة
checkReminders()               // فحص التنبيهات
```

---

### 6. **js/ui.js** - واجهة المستخدم
**المسؤول**: عرض الواجهة وتفاعلات المستخدم

**الفئات**:
- `UIManager` - يدير واجهة المستخدم

**الدوال الرئيسية**:
```javascript
// Initialization
init()                         // تهيئة الواجهة

// Event Handling
setupEventListeners()          // إعداد المستمعات
setupTabNavigation()           // تبويبات الملاحة
handleAddTask(e)              // معالج إضافة مهمة

// Rendering
renderDashboard()             // عرض لوحة المعلومات
renderSchedule()              // عرض الجدول
renderRecommendations()       // عرض التوصيات
renderTasksList()             // عرض قائمة المهام
renderCalendar()              // عرض التقويم
renderCalendarDays()          // عرض أيام التقويم
renderMonthOverview()         // عرض نظرة الشهر
renderUpcomingEvents()        // عرض الأحداث القادمة

// Refresh
refreshTasks()                // تحديث المهام
refreshCalendar()             // تحديث التقويم
```

---

## API الداخلي

### Global Instances (الكائنات العامة)

```javascript
// Storage
storage  // مثيل StorageManager

// Tasks
tasksManager       // مثيل TasksManager

// Smart Features
smartScheduler     // مثيل SmartScheduler
calendarManager    // مثيل CalendarManager
notificationsManager // مثيل NotificationsManager

// UI
uiManager          // مثيل UIManager
```

### Helper Functions

```javascript
// Notifications (from script.js)
showToast(message, type)          // إظهار رسالة Toast
showNotification(message, type)   // إظهار إخطار

// QR Code Generation
generateQRCodes()                 // توليد أكواد QR
```

---

## نماذج البيانات

### Task Object (كائن المهمة)
```javascript
{
  id: string,                  // معرف فريد (timestamp)
  title: string,               // اسم المهمة
  description: string,         // الوصف (اختياري)
  category: string,            // الفئة
  priority: string,            // الأولوية
  dueDate: string,            // التاريخ (YYYY-MM-DD)
  dueTime: string,            // الوقت (HH:mm)
  duration: number,           // المدة بالساعات
  status: string,             // الحالة
  completed: boolean,         // مكتملة أم لا
  color: string,              // اللون
  createdAt: string,          // وقت الإنشاء (ISO8601)
  updatedAt: string,          // آخر تحديث
  completedAt: string         // وقت الإكمال (اختياري)
}
```

### Schedule Object (كائن الجدول)
```javascript
{
  periods: [
    {
      name: string,           // اسم الفترة
      category: string,       // فئة الفترة
      startTime: string,     // وقت البداية
      endTime: string,       // وقت النهاية
      duration: number,      // المدة
      tasks: Task[]          // المهام في الفترة
    }
  ],
  recommendations: [],        // التوصيات
  conflicts: []              // التضاربات
}
```

### Recommendation Object (كائن التوصية)
```javascript
{
  type: string,              // نوع التوصية (info/warning/error)
  icon: string,              // رمز الرسالة
  message: string,           // رسالة التوصية
  action: string             // الإجراء المقترح
}
```

---

## المتغيرات والثوابت

### Storage Keys
```javascript
'my_tasks_db'               // قاعدة البيانات الرئيسية
'my_tasks_settings'         // الإعدادات
'my_tasks_analytics'        // الإحصائيات
```

### Categories (الفئات)
```javascript
{
  company: '🏢',   // الشركة
  freelance: '💼', // العمل الحر
  support: '🎟️',   // الدعم
  academy: '🎓',   // الأكاديمية
  project: '📚'    // المشاريع
}
```

### Priority Levels (مستويات الأولوية)
```javascript
{
  low: 1,      // منخفضة
  medium: 2,   // متوسطة
  high: 3      // عالية
}
```

### Status Values (قيم الحالة)
```javascript
{
  pending: 'pending',           // قيد الانتظار
  'in-progress': 'in-progress', // قيد الإنجاز
  completed: 'completed'        // مكتملة
}
```

---

## الدوال الرئيسية

### إضافة مهمة
```javascript
tasksManager.createTask({
  title: 'اسم المهمة',
  category: 'freelance',
  dueDate: '2026-02-23',
  dueTime: '14:00',
  duration: 2.5,
  priority: 'high',
  description: 'وصف اختياري'
});
```

### الحصول على المهام المفلترة
```javascript
tasksManager.getTasks({
  category: 'company',    // اختياري
  status: 'pending',      // اختياري
  date: '2026-02-23',     // اختياري
  priority: true          // سيتم الفرز حسب الأولوية
});
```

### تحديث مهمة
```javascript
tasksManager.updateTask('taskId', {
  title: 'عنوان جديد',
  status: 'completed'
});
```

### الحصول على الجدول الموصى به
```javascript
const schedule = smartScheduler.getRecommendedSchedule();
console.log(schedule.periods);      // الفترات
console.log(schedule.recommendations); // التوصيات
console.log(schedule.conflicts);    // التضاربات
```

---

## الأحداث والـ Listeners

### استماع لتغييرات المهام
```javascript
tasksManager.onChange(() => {
  console.log('تم تغيير المهام');
  uiManager.refreshTasks();
});
```

### استماع لأحداث الإخطارات
```javascript
// تلقائي عند تشغيل التطبيق
notificationsManager.start();

// التحقق من التنبيهات كل دقيقة
// والإخطارات عند 8 صباحاً
```

---

## مثال عملي: إضافة ميزة جديدة

### إضافة تصنيف جديد

**الخطوة 1**: حدّث `storage.js`
```javascript
getCategoryColor(category) {
  const colors = {
    // ... الألوان الأخرى
    custom: '#ff00ff' // اللون الجديد
  };
  return colors[category] || '#6d28d9';
}
```

**الخطوة 2**: حدّث `ui.js`
```javascript
getCategoryEmoji(category) {
  const emojis = {
    // ... الرموز الأخرى
    custom: '🎯' // الرمز الجديد
  };
  return emojis[category] || '📌';
}
```

**الخطوة 3**: أضف في `index.html`
```html
<option value="custom">🎯 التصنيف المخصص</option>
```

---

## Tips & Best Practices

### 1. **استخدام Modules**
```javascript
// ✅ صحيح
const task = tasksManager.createTask(data);

// ❌ خاطئ
const db = storage.getAllTasks();
// ثم معالجة يدوية
```

### 2. **استماع للتغييرات**
```javascript
// ✅ صحيح - يتم تحديث الواجهة تلقائياً
tasksManager.onChange(() => uiManager.refresh());

// ❌ خاطئ - تحديث يدوي
storage.addTask(...);
uiManager.refresh();
```

### 3. **استخدام الفلاتر**
```javascript
// ✅ صحيح
tasksManager.getTasks({ category: 'company', priority: true });

// ❌ يعمل لكن أقل كفاءة
storage.getAllTasks().filter(t => t.category === 'company');
```

### 4. **معالجة الأخطاء**
```javascript
// ✅ صحيح
const task = tasksManager.createTask(data);
if (task) {
  showNotification('تم الإضافة', 'success');
} else {
  showNotification('خطأ', 'error');
}
```

---

## Performance Considerations (الأداء)

- **LocalStorage Limit**: ~5-10GB (يختلف حسب المتصفح)
- **تجميع القراءات**: استخدم Batch queries بدلاً من Multiple queries
- **Lazy Loading**: لم يتم تطبيقه حالياً، قد يكون مفيداً للبيانات الكبيرة
- **Caching**: البيانات مخزنة في الذاكرة عند التحميل

---

## Security Considerations (الأمان)

- ✅ جميع البيانات محلية (لا يوجد طلب خارجي)
- ✅ لا يوجد authenticated requests مطلوب
- ✅ لا يوجد CORS issues (الموارد محلية)
- ✅ PWA Service Worker مفعّل

---

## Browser Compatibility (التوافق)

| ميزة | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| LocalStorage | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ⚠️ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| ES6 | ✅ | ✅ | ✅ | ✅ |

---

## الدعم والمساعدة

للمزيد من المعلومات، راجع:
- `GUIDE.md` - دليل المستخدم
- `test.js` - اختبارات سريعة
- DevTools Console - للتصحيح

---

**آخر تحديث**: 2026-02-23
**النسخة**: 1.0.0

// Service Worker Registration
if ('serviceWorker' in navigator) {
    // Check if we're running on a secure context (https, localhost, 127.0.0.1)
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' ||
                           location.hostname === 'localhost' ||
                           location.hostname === '127.0.0.1';
    
    if (isSecureContext) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('✓ Service Worker registered successfully');
            })
            .catch(error => {
                console.warn('⚠ Service Worker registration failed (app will work offline):', error.message);
            });
    } else {
        console.warn('⚠ Service Worker requires secure context (https or localhost). Run with a local server for offline support.');
    }
}

// QR Code Generation using QR Server API
function initQRCodes() {
    generateQRCodes();
}

// Initialize form defaults
function initFormDefaults() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('taskDate');
    if (dateInput) {
        dateInput.value = today;
    }

    // Set current time as default
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeInput = document.getElementById('taskTime');
    if (timeInput) {
        timeInput.value = `${hours}:${minutes}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initQRCodes();
    initFormDefaults();
});

function generateQRCodes() {
    const links = [
        { id: 'qr-email', url: 'mailto:hamedsallampro.1@gmail.com', name: 'Email' },
        { id: 'qr-portfolio', url: 'https://hamed-abu-sallam.github.io/Portofolio/', name: 'Portfolio' },
        { id: 'qr-linkedin', url: 'https://www.linkedin.com/in/hamed-abu-sallam/', name: 'LinkedIn' },
        { id: 'qr-github', url: 'https://github.com/hamed-abu-sallam', name: 'GitHub' },
        { id: 'qr-behance', url: 'https://www.behance.net/hamed-abu-sallam', name: 'Behance' },
        { id: 'qr-drive', url: 'https://drive.google.com/drive/folders/1IqMWxo1SBkYo1D1g90VjjIRLrF1lDQE0?usp=sharing', name: 'Drive' }
    ];

    links.forEach(link => {
        const container = document.getElementById(link.id);
        if (container) {
            try {
                // Use QR Server API for reliable QR code generation
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link.url)}`;
                
                const img = document.createElement('img');
                img.src = qrImageUrl;
                img.alt = `QR Code for ${link.name}`;
                img.style.cssText = 'width: 150px; height: 150px; object-fit: contain;';
                img.onerror = () => {
                    container.innerHTML = '<p style="color: #999; font-size: 12px; text-align: center; padding: 20px;">QR Code</p>';
                };
                
                container.innerHTML = '';
                container.appendChild(img);
            } catch (error) {
                console.error('Error generating QR code for ' + link.name + ':', error);
                container.innerHTML = '<p style="color: #999; font-size: 12px; text-align: center; padding: 20px;">QR Code</p>';
            }
        }
    });
}

// Copy to Clipboard Function
function copyToClipboard(text, source) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`تم نسخ الرابط! ✓`, 'success', source);
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`تم نسخ الرابط! ✓`, 'success', source);
    });
}

// Toast Notification
function showToast(message, type, source) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// Notification function (alias for showToast)
function showNotification(message, type = 'info', source) {
    return showToast(message, type, source);
}

// Add toast styles dynamically
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        padding: 16px 28px;
        background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
        color: #fff;
        border-radius: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 20px rgba(109, 40, 217, 0.35);
        border: 1px solid rgba(109, 40, 217, 0.4);
        backdrop-filter: blur(2px);
    }

    .toast.show {
        transform: translateX(-50%) translateY(0);
    }

    .toast-success {
        background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
        color: #fff;
    }

    .toast-success i {
        color: #9f97d4;
        text-shadow: 0 0 8px rgba(159, 151, 212, 0.4);
    }

    @media (max-width: 480px) {
        .toast {
            bottom: 20px;
            left: 20px;
            right: 20px;
            transform: translateY(100px);
        }

        .toast.show {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Add interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to cards
    const cards = document.querySelectorAll('.link-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });
    });

    // Smooth scroll for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Glitch effect for title
window.addEventListener('load', function() {
    const glitchElements = document.querySelectorAll('.glitch');
    glitchElements.forEach(el => {
        const text = el.textContent;
        el.setAttribute('data-text', text);
    });
});

// Add some interactive matrix rain effect on scroll
let ticking = false;

function updateOnScroll() {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const elements = document.querySelectorAll('[data-scroll]');
    
    elements.forEach(el => {
        const speed = el.getAttribute('data-scroll') || 0.5;
        el.style.transform = `translateY(${window.scrollY * speed}px)`;
    });
    
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 'C' to scroll to top
    if (e.key === 'c' || e.key === 'C') {
        if (!e.target.matches('input, textarea')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

// Easter egg - Konami code
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    showToast('🔐 Hidden Mode Activated! 🔓', 'success', 'easter-egg');
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes matrix {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes web-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        
        .matrix-char {
            position: fixed;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            color: #6d28d9;
            text-shadow: 0 0 10px #6d28d9, 0 0 20px #2563eb;
            z-index: 0;
            pointer-events: none;
            opacity: 0.6;
            font-weight: bold;
        }

        .web-line {
            position: fixed;
            background: linear-gradient(90deg, #6d28d9 0%, #2563eb 100%);
            z-index: 0;
            pointer-events: none;
            opacity: 0.35;
            box-shadow: 0 0 12px #6d28d9, 0 0 24px #2563eb;
        }
    `;
    document.head.appendChild(style);

    // Create matrix rain
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    for (let i = 0; i < 20; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        char.style.left = Math.random() * 100 + '%';
        char.style.animationDelay = Math.random() * 2 + 's';
        char.style.animation = `matrix ${3 + Math.random() * 4}s linear infinite`;
        document.body.appendChild(char);
        
        setTimeout(() => char.remove(), 8000);
    }

    // Create spider web lines
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'web-line';
        const angle = (i * 360 / 8) * (Math.PI / 180);
        const length = Math.random() * 300 + 200;
        const startX = window.innerWidth / 2 + Math.cos(angle) * 50;
        const startY = window.innerHeight / 2 + Math.sin(angle) * 50;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        
        line.style.left = startX + 'px';
        line.style.top = startY + 'px';
        line.style.width = length + 'px';
        line.style.height = '2px';
        line.style.transform = `rotate(${(angle * 180 / Math.PI)}deg)`;
        line.style.transformOrigin = '0 0';
        
        document.body.appendChild(line);
        setTimeout(() => line.remove(), 8000);
    }
}

// Modal System Functions
let currentModalLink = '';

function showLinkModal(url, title) {
    currentModalLink = url;
    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalLink = document.getElementById('modalLink');
    const modalQR = document.getElementById('modalQR');
    
    // Clear previous QR
    modalQR.innerHTML = '';
    
    // Set title and link
    modalTitle.textContent = title;
    modalLink.textContent = url;
    
    // Generate QR code using QR Server API
    try {
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        const img = document.createElement('img');
        img.src = qrImageUrl;
        img.alt = `QR Code for ${title}`;
        img.style.cssText = 'width: 200px; height: 200px; object-fit: contain; margin: 20px auto;';
        img.onerror = () => {
            modalQR.innerHTML = '<p style="color: #999; text-align: center;">Failed to load QR code</p>';
        };
        
        modalQR.appendChild(img);
    } catch (error) {
        console.error('Error generating modal QR code:', error);
        modalQR.innerHTML = '<p style="color: #999; text-align: center;">QR Code Error</p>';
    }
    
    // Show modal
    modal.classList.add('active');
}

function closeLinkModal() {
    const modal = document.getElementById('linkModal');
    modal.classList.remove('active');
}

function copyFromModal() {
    navigator.clipboard.writeText(currentModalLink).then(() => {
        showToast(`تم نسخ الرابط! ✓`, 'success', 'modal');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = currentModalLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`تم نسخ الرابط! ✓`, 'success', 'modal');
    });
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('linkModal');
    if (event.target === modal) {
        closeLinkModal();
    }
});
// =====================================================
// 🤖 AUTOMATION SYSTEM - نظام الأتمتة الذكي
// =====================================================

// 1️⃣ تشغيل الأتمتة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🤖 [AUTOMATION] بدء نظام الأتمتة...');
        
        // ✅ فحص تغيير الشهر وتجديد المهام
        if (typeof storage !== 'undefined' && typeof storage.autoRenewMonthlyTasks === 'function') {
            storage.autoRenewMonthlyTasks();
            console.log('✅ [AUTO] فحص تغيير الشهر تم');
        }

        // ✅ بدء خدمة الإخطارات
        if (typeof notificationsManager !== 'undefined' && typeof notificationsManager.start === 'function') {
            notificationsManager.start();
            console.log('✅ [AUTO] خدمة الإخطارات بدأت');
        }

        // ✅ تحميل المهام المسبقة إذا كانت قاعدة البيانات فارغة
        if (typeof taskImporter !== 'undefined' && typeof taskImporter.autoLoadIfEmpty === 'function') {
            taskImporter.autoLoadIfEmpty();
            console.log('✅ [AUTO] فحص التحميل التلقائي تم');
        }

        // ✅ فحص إنهاء الأيام السابقة
        autoCompletePassedDays();

        console.log('🎯 [AUTOMATION] جميع أنظمة الأتمتة جاهزة!');
    }, 2000); // انتظر قليلاً لتحميل كل شيء
});

// دالة مساعدة: إنهاء مهام الأيام السابقة
function autoCompletePassedDays() {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Check automation settings
        const settings = (typeof storage !== 'undefined') ? storage.getSettings() : {};
        const automation = (settings && settings.automation) ? settings.automation : {};
        if (!automation.autoCompletePastDays) return;

        if (typeof storage !== 'undefined') {
            const tasks = storage.getAllTasks();
            let completedCount = 0;

            tasks.forEach(task => {
                // إذا كان تاريخ المهمة أقدم من اليوم الحالي وحالتها pending
                if (task.dueDate < today && task.status !== 'completed') {
                    // تحديث حالة المهمة إلى completed
                    storage.updateTask(task.id, {
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    });
                    completedCount++;
                }
            });

            if (completedCount > 0) {
                console.log(`✅ [AUTO-COMPLETE] تم إنهاء ${completedCount} مهمة من الأيام السابقة`);
            }
        }
    } catch (error) {
        console.error('[AUTO-COMPLETE-INIT] خطأ:', error);
    }
}

// 2️⃣ حفظ تلقائي كل 5 دقائق
setInterval(() => {
    try {
        if (typeof storage !== 'undefined') {
            const data = {
                tasks: storage.getAllTasks(),
                settings: storage.getSettings(),
                timestamp: new Date().toISOString()
            };
            // نسخة احتياطية إضافية
            const backupKey = 'auto_backup_' + Date.now();
            localStorage.setItem(backupKey, JSON.stringify(data));
            console.log('💾 [AUTO-SAVE] حفظ تلقائي تم');
        }
    } catch (error) {
        console.error('[AUTO-SAVE] خطأ:', error);
    }
}, 300000); // 5 دقائق

// 3️⃣ تنظيف دوري كل ساعة
setInterval(() => {
    try {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        let deletedCount = 0;

        keys.forEach(key => {
            if (key.startsWith('auto_backup_')) {
                const timestamp = parseInt(key.replace('auto_backup_', ''));
                const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
                if (timestamp < oneWeekAgo) {
                    localStorage.removeItem(key);
                    deletedCount++;
                }
            }
        });

        if (deletedCount > 0) {
            console.log(`🧹 [AUTO-CLEANUP] تم حذف ${deletedCount} نسخة احتياطية قديمة`);
        }
    } catch (error) {
        console.error('[AUTO-CLEANUP] خطأ:', error);
    }
}, 3600000); // ساعة واحدة

// 4️⃣ فحص تغيير الشهر يومياً
setInterval(() => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.substring(0, 7);
        const lastMonthCheck = localStorage.getItem('last_month_check');

        if (lastMonthCheck !== currentMonth) {
            console.log('📅 [AUTO-MONTH] اكتشاف شهر جديد!');
            if (typeof storage !== 'undefined' && typeof storage.autoRenewMonthlyTasks === 'function') {
                storage.autoRenewMonthlyTasks();
                localStorage.setItem('last_month_check', currentMonth);
                console.log('✅ [AUTO-MONTH] تم تجديد المهام المتكررة');
                
                // تحديث الواجهة
                if (typeof uiManager !== 'undefined' && typeof uiManager.render === 'function') {
                    uiManager.render();
                }
            }
        }
    } catch (error) {
        console.error('[AUTO-MONTH] خطأ:', error);
    }
}, 86400000); // يوم واحد

// 5️⃣ تحديث الإحصائيات كل دقيقة
setInterval(() => {
    try {
        if (typeof tasksManager !== 'undefined' && typeof uiManager !== 'undefined') {
            uiManager.renderDashboard();
        }
    } catch (error) {
        console.error('[AUTO-UPDATE] خطأ:', error);
    }
}, 60000); // دقيقة واحدة

// 6️⃣ أتمتة إنهاء الأيام - عندما ينتهي اليوم، اعتبر كل مهامه منجزة
setInterval(() => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        if (typeof storage !== 'undefined') {
            const settings = storage.getSettings();
            const automation = (settings && settings.automation) ? settings.automation : {};
            if (!automation.autoCompletePastDays) return; // respect user setting
            const tasks = storage.getAllTasks();
            const lastCheckKey = 'last_day_complete_check';
            const lastCheck = localStorage.getItem(lastCheckKey);
            
            // تحقق فقط مرة واحدة في اليوم
            if (lastCheck !== today) {
                let completedCount = 0;

                tasks.forEach(task => {
                    // إذا كان تاريخ المهمة أقدم من اليوم الحالي وحالتها pending
                    if (task.dueDate < today && task.status !== 'completed') {
                        // تحديث حالة المهمة إلى completed
                        storage.updateTask(task.id, {
                            status: 'completed',
                            completedAt: new Date().toISOString()
                        });
                        completedCount++;
                    }
                });

                if (completedCount > 0) {
                    console.log(`✅ [AUTO-COMPLETE] تم إنهاء ${completedCount} مهمة من الأيام السابقة`);
                    localStorage.setItem(lastCheckKey, today);
                    
                    // تحديث الواجهة
                    if (typeof uiManager !== 'undefined' && typeof uiManager.refresh === 'function') {
                        uiManager.refresh();
                    }
                }
            }
        }
    } catch (error) {
        console.error('[AUTO-COMPLETE] خطأ:', error);
    }
}, 60000); // كل دقيقة (لكنه يعمل مرة واحدة فقط في اليوم)

// 7️⃣ أتمتة إنهاء المهام عند انتهاء وقتها وإنشاء متابعة تلقائية
setInterval(() => {
    try {
        const now = new Date();
        const settings = (typeof storage !== 'undefined') ? storage.getSettings() : {};
        const automationSettings = (settings && settings.automation) ? settings.automation : {};

        // Only run if feature enabled
        if (!automationSettings.autoCompleteOnEndEnabled) return;

        const tasks = (typeof storage !== 'undefined') ? storage.getAllTasks() : [];
        tasks.forEach(task => {
            try {
                if (!task || task.status === 'completed' || task.status === 'cancelled') return;

                // compute task end time: dueTime + duration (hours)
                const durationHours = parseFloat(task.duration) || 1;
                const taskStart = new Date(`${task.dueDate}T${task.dueTime}`);
                if (isNaN(taskStart.getTime())) return;
                const taskEnd = new Date(taskStart.getTime() + durationHours * 60 * 60 * 1000);

                // If current time is past end time -> auto-complete
                if (now >= taskEnd) {
                    // only auto-complete if flag set on task or global enabled
                    const taskFlag = task.autoCompleteOnEnd === true;
                    if (automationSettings.autoCompleteOnEndEnabled || taskFlag) {
                        storage.updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
                        console.log(`✅ [AUTO-END] أكملت المهمة تلقائياً: ${task.title} (انتهى وقتها)`);

                        // create follow-up if enabled
                        const createFollowUp = (task.autoCreateNext === true) || automationSettings.autoCreateFollowUpEnabled;
                        if (createFollowUp) {
                            const offset = (typeof task.followUpOffsetDays === 'number') ? task.followUpOffsetDays : (automationSettings.followUpDefaultOffsetDays || 1);
                            const nextDate = new Date(taskStart);
                            nextDate.setDate(nextDate.getDate() + offset);
                            const newTaskData = {
                                title: `متابعة: ${task.title}`,
                                description: task.description || '',
                                category: task.category || 'project',
                                priority: task.priority || 'medium',
                                dueDate: nextDate.toISOString().split('T')[0],
                                dueTime: task.dueTime || '09:00',
                                duration: task.duration || 1,
                                status: 'pending',
                                recurring: false,
                                createdAt: new Date().toISOString()
                            };

                            // Use tasksManager to create so listeners update
                            if (typeof tasksManager !== 'undefined' && typeof tasksManager.createTask === 'function') {
                                tasksManager.createTask(newTaskData);
                                console.log(`➕ [AUTO-FOLLOWUP] تمت إضافة مهمة متابعة: ${newTaskData.title} في ${newTaskData.dueDate}`);
                            } else if (typeof storage !== 'undefined' && typeof storage.addTask === 'function') {
                                storage.addTask(newTaskData);
                            }
                        }
                    }
                }
            } catch (innerErr) {
                console.error('[AUTO-END] خطأ في معالجة مهمة:', innerErr);
            }
        });

        // refresh UI once per run
        if (typeof uiManager !== 'undefined' && typeof uiManager.refresh === 'function') uiManager.refresh();
    } catch (error) {
        console.error('[AUTO-END] خطأ عام:', error);
    }
}, 60000); // تفحص كل دقيقة

console.log('✅ نظام الأتمتة مجهز للتشغيل!');
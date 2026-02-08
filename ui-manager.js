// DOM Elements
const notificationContainer = document.getElementById('notificationContainer');
const welcomeModal = document.getElementById('welcomeModal');
const closeWelcomeModal = document.getElementById('closeWelcomeModal');
const gotItBtn = document.getElementById('gotItBtn');
const guideModal = document.getElementById('guideModal');
const closeGuideModal = document.getElementById('closeGuideModal');
const startUsingBtn = document.getElementById('startUsingBtn');
const helpBtn = document.getElementById('helpBtn');
const batteryFill = document.getElementById('batteryFill');
const batteryPercent = document.getElementById('batteryPercent');
const batteryIcon = document.getElementById('batteryIcon');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');

// Show notification function
function showNotification(title, message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="notification-text">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Update time and date
function updateDateTime() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString('id-ID');
    currentDate.textContent = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update battery status
function updateBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            updateBatteryInfo(battery);
            battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
            battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
        });
    } else {
        const level = 0.85;
        batteryFill.style.width = `${level * 100}%`;
        batteryPercent.textContent = `${Math.round(level * 100)}%`;
        updateBatteryIcon(level, false);
    }
}

function updateBatteryInfo(battery) {
    const level = battery.level;
    batteryFill.style.width = `${level * 100}%`;
    batteryPercent.textContent = `${Math.round(level * 100)}%`;
    updateBatteryIcon(level, battery.charging);
}

function updateBatteryIcon(level, isCharging) {
    if (isCharging) {
        batteryIcon.className = 'fas fa-bolt';
        batteryIcon.style.color = 'var(--success)';
        return;
    }
    
    if (level > 0.75) {
        batteryIcon.className = 'fas fa-battery-full';
    } else if (level > 0.5) {
        batteryIcon.className = 'fas fa-battery-three-quarters';
    } else if (level > 0.25) {
        batteryIcon.className = 'fas fa-battery-half';
    } else if (level > 0.1) {
        batteryIcon.className = 'fas fa-battery-quarter';
        batteryIcon.style.color = 'var(--warning)';
    } else {
        batteryIcon.className = 'fas fa-battery-empty';
        batteryIcon.style.color = 'var(--danger)';
    }
}

// Event Listeners for modals
closeWelcomeModal.addEventListener('click', () => {
    welcomeModal.classList.remove('active');
});

gotItBtn.addEventListener('click', () => {
    welcomeModal.classList.remove('active');
});

closeGuideModal.addEventListener('click', () => {
    guideModal.classList.remove('active');
    localStorage.setItem('privatkey-hasSeenGuide', 'true');
});

startUsingBtn.addEventListener('click', () => {
    guideModal.classList.remove('active');
    localStorage.setItem('privatkey-hasSeenGuide', 'true');
    showNotification('Selamat Datang', 'Selamat menggunakan PrivatKey!', 'success');
});

helpBtn.addEventListener('click', () => {
    guideModal.classList.add('active');
});

// Export functions
window.uiManager = {
    showNotification,
    updateDateTime,
    updateBatteryStatus
};

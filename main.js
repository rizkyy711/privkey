// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show welcome modal
    setTimeout(() => {
        document.getElementById('welcomeModal').classList.add('active');
    }, 500);
    
    // Check login status
    if (window.auth.checkLoginStatus()) {
        // Load data from Firebase
        window.dataManager.loadDataFromFirebase();
        
        // Update date and time
        window.uiManager.updateDateTime();
        setInterval(window.uiManager.updateDateTime, 1000);
        
        // Update battery status
        window.uiManager.updateBatteryStatus();
        
        // Show guide modal if first time
        const hasSeenGuide = localStorage.getItem('privatkey-hasSeenGuide');
        if (!hasSeenGuide) {
            setTimeout(() => {
                document.getElementById('guideModal').classList.add('active');
            }, 1000);
        }
    }
    
    // Focus token input
    document.getElementById('token').focus();
    
    // Make functions available globally
    window.showNotification = window.uiManager.showNotification;
});

// Global helper function for showing notifications
function showNotification(title, message, type = 'info', duration = 5000) {
    window.uiManager.showNotification(title, message, type, duration);
}

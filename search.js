// DOM Elements
const searchInput = document.getElementById('searchInput');
const filteredCount = document.getElementById('filteredCount');

// Variables
let searchTimeout;

// Search functionality
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const searchTerm = this.value.trim().toLowerCase();
    
    // Debounce search for better performance
    searchTimeout = setTimeout(() => {
        if (searchTerm === '') {
            window.dataManager.filteredData = [...window.dataManager.allData];
            window.dataManager.renderDataList();
            filteredCount.textContent = `${window.dataManager.filteredData.length} Data`;
            return;
        }
        
        window.dataManager.filteredData = window.dataManager.allData.filter(item => {
            // Search in title
            if (item.title && item.title.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in email
            if (item.email && item.email.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in phone (check both formatted and original)
            const phoneSearch = searchTerm.replace(/\D/g, '');
            if (phoneSearch) {
                if (item.phone && item.phone.includes(phoneSearch)) {
                    return true;
                }
                
                if (item.originalPhone && item.originalPhone.includes(phoneSearch)) {
                    return true;
                }
            }
            
            // Search in password (partial match for security)
            if (item.password && searchTerm.length >= 3) {
                if (item.password.toLowerCase().includes(searchTerm)) {
                    return true;
                }
            }
            
            // Search in additional fields
            if (item.additionalFields) {
                for (const [key, value] of Object.entries(item.additionalFields)) {
                    if (key.toLowerCase().includes(searchTerm) || 
                        (typeof value === 'string' && value.toLowerCase().includes(searchTerm))) {
                        return true;
                    }
                }
            }
            
            return false;
        });
        
        window.dataManager.renderDataList();
        filteredCount.textContent = `${window.dataManager.filteredData.length} Data`;
        
        // Show notification if no results
        if (window.dataManager.filteredData.length === 0 && searchTerm !== '') {
            showNotification('Pencarian', 'Data tidak ditemukan', 'info', 2000);
        }
    }, 300); // 300ms debounce
});

// Clear search button (optional)
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        this.value = '';
        window.dataManager.filteredData = [...window.dataManager.allData];
        window.dataManager.renderDataList();
        filteredCount.textContent = `${window.dataManager.filteredData.length} Data`;
    }
});

// Export functions
window.search = {
    clearSearch: function() {
        searchInput.value = '';
        window.dataManager.filteredData = [...window.dataManager.allData];
        window.dataManager.renderDataList();
        filteredCount.textContent = `${window.dataManager.filteredData.length} Data`;
    }
};

// DOM Elements
const dataManageBtn = document.getElementById('dataManageBtn');
const helpBtn = document.getElementById('helpBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importExportModal = document.getElementById('importExportModal');
const closeImportExportModal = document.getElementById('closeImportExportModal');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importModal = document.getElementById('importModal');
const closeImportModal = document.getElementById('closeImportModal');
const fileDropArea = document.getElementById('fileDropArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const exportModal = document.getElementById('exportModal');
const closeExportModal = document.getElementById('closeExportModal');
const closeExportModalBtn = document.getElementById('closeExportModalBtn');
const exportSuccess = document.getElementById('exportSuccess');
const exportError = document.getElementById('exportError');
const exportCount = document.getElementById('exportCount');
const errorMessageText = document.getElementById('errorMessageText');
const manualDownload = document.getElementById('manualDownload');

// Variables
let selectedFile = null;
let exportBlob = null;
let exportFileName = '';

// Event Listeners for modals
dataManageBtn.addEventListener('click', () => {
    importExportModal.classList.add('active');
});

closeImportExportModal.addEventListener('click', () => {
    importExportModal.classList.remove('active');
});

exportBtn.addEventListener('click', () => {
    importExportModal.classList.remove('active');
    exportData();
});

importBtn.addEventListener('click', () => {
    importExportModal.classList.remove('active');
    importModal.classList.add('active');
});

// Export data button
exportDataBtn.addEventListener('click', exportData);

// Import data button
importDataBtn.addEventListener('click', () => {
    importModal.classList.add('active');
});

// Import modal
closeImportModal.addEventListener('click', () => {
    importModal.classList.remove('active');
    resetImportModal();
});

cancelImportBtn.addEventListener('click', () => {
    importModal.classList.remove('active');
    resetImportModal();
});

// Export modal
closeExportModal.addEventListener('click', () => {
    exportModal.classList.remove('active');
    exportBlob = null;
    exportFileName = '';
});

closeExportModalBtn.addEventListener('click', () => {
    exportModal.classList.remove('active');
    exportBlob = null;
    exportFileName = '';
});

// Manual download link
manualDownload.addEventListener('click', function(e) {
    e.preventDefault();
    if (exportBlob) {
        downloadFile(exportBlob, exportFileName);
    }
});

// File handling
fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('drag-over');
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('drag-over');
});

fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
        fileInfo.innerHTML = `<span style="color: var(--danger);"><i class="fas fa-exclamation-circle"></i> File harus berupa format ZIP!</span>`;
        confirmImportBtn.disabled = true;
        selectedFile = null;
        return;
    }
    
    selectedFile = file;
    fileInfo.innerHTML = `
        <span style="color: var(--success);">
            <i class="fas fa-check-circle"></i> File siap diimpor: <strong>${file.name}</strong><br>
            <small>Ukuran: ${(file.size / 1024).toFixed(2)} KB</small>
        </span>
    `;
    confirmImportBtn.disabled = false;
}

confirmImportBtn.addEventListener('click', async function() {
    if (!selectedFile) return;
    
    try {
        showNotification('Memproses', 'Membaca file ZIP...', 'info');
        
        const zip = new JSZip();
        const zipData = await zip.loadAsync(selectedFile);
        const jsonFiles = Object.keys(zipData.files).filter(name => name.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            showNotification('Import Gagal', 'Tidak ada file JSON dalam ZIP!', 'error');
            return;
        }
        
        showNotification('Mengimpor', `Menemukan ${jsonFiles.length} file data...`, 'info');
        
        let importedCount = 0;
        for (const fileName of jsonFiles) {
            const file = zipData.files[fileName];
            const content = await file.async('text');
            
            try {
                const data = JSON.parse(content);
                if (data.title && (data.email || data.phone || data.password || data.additionalFields)) {
                    data.timestamp = new Date().toISOString();
                    data.updatedAt = new Date().toISOString();
                    
                    const newDataRef = window.firebaseDatabase.push(window.firebaseDatabase.dataRef);
                    await window.firebaseDatabase.set(newDataRef, data);
                    importedCount++;
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
        
        showNotification('Import Berhasil', `Berhasil mengimpor ${importedCount} data!`, 'success');
        importModal.classList.remove('active');
        resetImportModal();
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Import Gagal', 'Gagal mengimpor data. Pastikan file ZIP valid!', 'error');
    }
});

function resetImportModal() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.innerHTML = '';
    confirmImportBtn.disabled = true;
    fileDropArea.classList.remove('drag-over');
}

// Download file function - FIXED
function downloadFile(blob, filename) {
    try {
        // Method 1: Use FileSaver.js
        saveAs(blob, filename);
        return true;
    } catch (error) {
        console.error('Download error with FileSaver:', error);
        
        try {
            // Method 2: Fallback to manual download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            return true;
        } catch (error2) {
            console.error('Download error with manual method:', error2);
            return false;
        }
    }
}

// Export data function - COMPLETELY REWRITTEN
async function exportData() {
    if (!window.dataManager.allData || window.dataManager.allData.length === 0) {
        showNotification('Ekspor Gagal', 'Belum ada data untuk diekspor!', 'warning');
        return;
    }
    
    try {
        showNotification('Mempersiapkan', 'Membuat file ZIP...', 'info');
        
        const zip = new JSZip();
        const exportDate = new Date();
        const dateString = exportDate.toISOString().split('T')[0];
        const timeString = exportDate.getHours().toString().padStart(2, '0') + 
                         exportDate.getMinutes().toString().padStart(2, '0');
        
        exportFileName = `privatkey-backup-${dateString}-${timeString}.zip`;
        
        // Create main folder
        const folder = zip.folder(`privatkey-backup-${dateString}`);
        
        // Create master data file with all data
        const masterData = {
            app: "PrivatKey",
            version: "1.0",
            exportDate: exportDate.toISOString(),
            totalData: window.dataManager.allData.length,
            data: window.dataManager.allData
        };
        
        folder.file('master-data.json', JSON.stringify(masterData, null, 2));
        
        // Also add individual files for each data item
        window.dataManager.allData.forEach((item, index) => {
            const cleanTitle = (item.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
            const fileName = `data_${(index + 1).toString().padStart(3, '0')}_${cleanTitle}.json`;
            folder.file(fileName, JSON.stringify(item, null, 2));
        });
        
        // Add a README file
        const readmeContent = `PRIVATKEY BACKUP FILE
================================
Tanggal Ekspor: ${exportDate.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
Waktu Ekspor: ${exportDate.toLocaleTimeString('id-ID')}
Total Data: ${window.dataManager.allData.length}

INSTRUKSI:
1. File ini berisi backup dari PrivatKey
2. Untuk mengimpor kembali, buka PrivatKey dan pilih "Impor Data"
3. Pilih file ZIP ini

PERINGATAN:
- Simpan file ini di tempat yang aman
- File ini berisi data sensitif
- Jangan bagikan dengan siapapun

Data individual tersedia dalam file JSON terpisah.
Data lengkap tersedia dalam file master-data.json

© ${new Date().getFullYear()} PrivatKey - Dibuat dengan ❤️`;
        folder.file('README.txt', readmeContent);
        
        // Generate ZIP file
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        exportBlob = content;
        
        // Show success modal
        exportSuccess.style.display = 'block';
        exportError.style.display = 'none';
        exportCount.textContent = window.dataManager.allData.length;
        exportModal.classList.add('active');
        
        // Auto download after 1 second
        setTimeout(() => {
            const downloaded = downloadFile(content, exportFileName);
            if (downloaded) {
                showNotification('Download Berhasil', 'File ZIP berhasil diunduh!', 'success');
            } else {
                showNotification('Download Manual', 'Silakan klik link manual download di modal', 'info');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Export error:', error);
        // Show error modal
        exportSuccess.style.display = 'none';
        exportError.style.display = 'block';
        errorMessageText.textContent = error.message || 'Terjadi kesalahan saat mengekspor data.';
        exportModal.classList.add('active');
        showNotification('Ekspor Gagal', 'Gagal membuat file ZIP. Coba lagi.', 'error');
    }
}

// Export functions
window.exportImport = {
    exportData,
    downloadFile,
    handleFileSelect,
    resetImportModal
};

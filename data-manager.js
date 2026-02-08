// DOM Elements
const dataForm = document.getElementById('dataForm');
const addFieldBtn = document.getElementById('addFieldBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editIdInput = document.getElementById('editId');
const dataList = document.getElementById('dataList');
const dataCount = document.getElementById('dataCount');
const fieldsContainer = document.getElementById('fieldsContainer');

// Variables
let allData = [];
let filteredData = [];
let isEditing = false;
let fieldCount = 3;

// Toggle password visibility
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Add dynamic field
addFieldBtn.addEventListener('click', () => {
    fieldCount++;
    const fieldId = `field_${Date.now()}`;
    const newField = document.createElement('div');
    newField.className = 'form-group';
    newField.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center;">
            <input type="text" class="form-input" placeholder="Label (contoh: Pertanyaan keamanan)" style="flex: 1;" id="${fieldId}_label">
            <input type="text" class="form-input" placeholder="Isi data" style="flex: 2;" id="${fieldId}_value">
            <button type="button" class="action-btn remove-field-btn" style="width: 40px; height: 40px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    fieldsContainer.appendChild(newField);
    
    // Animate the new field
    newField.style.opacity = '0';
    newField.style.transform = 'translateY(10px)';
    setTimeout(() => {
        newField.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        newField.style.opacity = '1';
        newField.style.transform = 'translateY(0)';
    }, 10);
    
    // Add remove functionality
    const removeBtn = newField.querySelector('.remove-field-btn');
    removeBtn.addEventListener('click', function() {
        newField.style.opacity = '0';
        newField.style.transform = 'translateX(20px)';
        newField.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            newField.remove();
            fieldCount--;
        }, 300);
    });
});

// Form submission
dataForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = passwordInput.value.trim();
    const editId = editIdInput.value;
    
    if (!title) {
        showNotification('Validasi Gagal', 'Judul data harus diisi!', 'error');
        return;
    }
    
    // Format phone number
    let formattedPhone = phone;
    if (phone) {
        // Remove all non-digit characters
        let digits = phone.replace(/\D/g, '');
        
        // Convert to +62 format
        if (digits.startsWith('0')) {
            formattedPhone = '+62' + digits.substring(1);
        } else if (digits.startsWith('62')) {
            formattedPhone = '+' + digits;
        } else if (digits.startsWith('8')) {
            formattedPhone = '+62' + digits;
        } else if (!digits.startsWith('+')) {
            formattedPhone = '+62' + digits;
        }
    }
    
    // Collect additional fields
    const additionalFields = {};
    const fieldGroups = fieldsContainer.querySelectorAll('.form-group > div');
    
    fieldGroups.forEach((group, index) => {
        if (index >= 3) {
            const inputs = group.querySelectorAll('input');
            if (inputs.length >= 2) {
                const label = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                if (label && value) {
                    additionalFields[label] = value;
                }
            }
        }
    });
    
    const data = {
        title,
        email,
        phone: formattedPhone,
        originalPhone: phone, // Save original input
        password,
        additionalFields,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (isEditing && editId) {
        updateDataInFirebase(editId, data);
    } else {
        saveDataToFirebase(data);
    }
    
    resetForm();
});

// Cancel edit
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    dataForm.reset();
    editIdInput.value = '';
    isEditing = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    cancelEditBtn.style.display = 'none';
    
    // Remove additional fields except the default ones
    const fieldGroups = fieldsContainer.querySelectorAll('.form-group > div');
    fieldGroups.forEach((group, index) => {
        if (index >= 3) {
            group.parentElement.remove();
        }
    });
    
    fieldCount = 3;
}

// Firebase functions
function saveDataToFirebase(data) {
    const newDataRef = window.firebaseDatabase.push(window.firebaseDatabase.dataRef);
    window.firebaseDatabase.set(newDataRef, data)
        .then(() => {
            showNotification('Data Tersimpan', 'Data berhasil disimpan!', 'success');
        })
        .catch(error => {
            console.error('Save error:', error);
            showNotification('Simpan Gagal', 'Gagal menyimpan data!', 'error');
        });
}

function updateDataInFirebase(id, data) {
    const dataRef = window.firebaseDatabase.ref(window.firebaseDatabase.database, `userData/${id}`);
    window.firebaseDatabase.update(dataRef, data)
        .then(() => {
            showNotification('Data Diperbarui', 'Data berhasil diperbarui!', 'success');
        })
        .catch(error => {
            console.error('Update error:', error);
            showNotification('Update Gagal', 'Gagal memperbarui data!', 'error');
        });
}

function loadDataFromFirebase() {
    window.firebaseDatabase.onValue(window.firebaseDatabase.dataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            allData = Object.entries(data).map(([id, item]) => ({ 
                id, 
                ...item,
                // Ensure all fields exist
                title: item.title || '',
                email: item.email || '',
                phone: item.phone || '',
                originalPhone: item.originalPhone || item.phone || '',
                password: item.password || '',
                additionalFields: item.additionalFields || {},
                timestamp: item.timestamp || new Date().toISOString(),
                updatedAt: item.updatedAt || item.timestamp || new Date().toISOString()
            }));
            allData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
            allData = [];
        }
        
        filteredData = [...allData];
        renderDataList();
        updateDataCount();
    }, (error) => {
        console.error('Load error:', error);
        showNotification('Koneksi Error', 'Tidak dapat terhubung ke database!', 'error');
    });
}

function renderDataList() {
    dataList.innerHTML = '';
    
    if (filteredData.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'no-data';
        noData.innerHTML = `
            <i class="fas fa-database"></i>
            <p>${document.getElementById('searchInput').value ? 'Data tidak ditemukan' : 'Belum ada data yang disimpan'}</p>
        `;
        dataList.appendChild(noData);
        return;
    }
    
    filteredData.forEach(item => {
        const element = createDataElement(item);
        dataList.appendChild(element);
    });
}

function updateDataCount() {
    dataCount.textContent = `${allData.length} Data`;
    document.getElementById('filteredCount').textContent = `${filteredData.length} Data`;
}

function createDataElement(item) {
    const div = document.createElement('div');
    div.className = 'data-item';
    div.dataset.id = item.id;
    
    const iconClass = getIconForTitle(item.title);
    const updatedTime = new Date(item.updatedAt || item.timestamp);
    const timeText = updatedTime.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="data-item-header">
            <div class="data-title-container">
                <div class="data-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div>
                    <div class="data-title">${item.title || 'Tanpa Judul'}</div>
                    <div class="data-time">
                        <i class="far fa-clock"></i> ${timeText}
                    </div>
                </div>
            </div>
            <div class="data-actions">
                <button class="action-btn edit-btn" title="Edit Data">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
        <div class="data-details"></div>
    `;
    
    // Toggle details
    const header = div.querySelector('.data-item-header');
    header.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) return;
        
        const details = div.querySelector('.data-details');
        const isShowing = details.classList.contains('show');
        
        if (!isShowing) {
            details.innerHTML = createDetailsHTML(item);
        }
        
        details.classList.toggle('show');
        
        // Animate icon
        const icon = div.querySelector('.data-icon i');
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = details.classList.contains('show') ? 'rotate(360deg)' : 'rotate(0)';
    });
    
    // Edit button
    div.querySelector('.edit-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        editData(item);
    });
    
    return div;
}

function editData(item) {
    isEditing = true;
    editIdInput.value = item.id;
    
    // Fill form with data
    document.getElementById('title').value = item.title || '';
    document.getElementById('email').value = item.email || '';
    document.getElementById('phone').value = item.originalPhone || item.phone || '';
    passwordInput.value = item.password || '';
    passwordInput.setAttribute('type', 'password');
    togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    
    // Remove existing additional fields
    const fieldGroups = fieldsContainer.querySelectorAll('.form-group > div');
    fieldGroups.forEach((group, index) => {
        if (index >= 3) {
            group.parentElement.remove();
        }
    });
    fieldCount = 3;
    
    // Add additional fields from data
    if (item.additionalFields) {
        for (const [label, value] of Object.entries(item.additionalFields)) {
            const fieldId = `field_${Date.now()}_${label.replace(/\s+/g, '_')}`;
            const newField = document.createElement('div');
            newField.className = 'form-group';
            newField.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center;">
                    <input type="text" class="form-input" placeholder="Label" style="flex: 1;" id="${fieldId}_label" value="${label}">
                    <input type="text" class="form-input" placeholder="Value" style="flex: 2;" id="${fieldId}_value" value="${value}">
                    <button type="button" class="action-btn remove-field-btn" style="width: 40px; height: 40px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            fieldsContainer.appendChild(newField);
            fieldCount++;
            
            // Add remove functionality
            const removeBtn = newField.querySelector('.remove-field-btn');
            removeBtn.addEventListener('click', function() {
                newField.style.opacity = '0';
                newField.style.transform = 'translateX(20px)';
                newField.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    newField.remove();
                    fieldCount--;
                }, 300);
            });
        }
    }
    
    // Update UI for edit mode
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Perbarui Data';
    cancelEditBtn.style.display = 'flex';
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Mode Edit', 'Sekarang Anda dapat mengedit data ini', 'info');
}

function createDetailsHTML(item) {
    let html = '';
    
    if (item.email) {
        html += `<div class="detail-row">
            <div class="detail-label"><i class="far fa-envelope"></i> Email/User:</div>
            <div class="detail-value">${item.email}</div>
        </div>`;
    }
    
    if (item.phone || item.originalPhone) {
        const displayPhone = item.originalPhone || item.phone;
        html += `<div class="detail-row">
            <div class="detail-label"><i class="fas fa-phone"></i> Telepon:</div>
            <div class="detail-value">${displayPhone}</div>
        </div>`;
    }
    
    if (item.password) {
        html += `<div class="detail-row">
            <div class="detail-label"><i class="fas fa-key"></i> Password:</div>
            <div class="detail-value">
                <div class="password-value">
                    <span class="password-text">${'•'.repeat(item.password.length)}</span>
                    <button class="show-password-btn" data-password="${item.password}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }
    
    if (item.additionalFields) {
        for (const [label, value] of Object.entries(item.additionalFields)) {
            html += `<div class="detail-row">
                <div class="detail-label"><i class="fas fa-tag"></i> ${label}:</div>
                <div class="detail-value">${value}</div>
            </div>`;
        }
    }
    
    return html;
}

// Password toggle in details
document.addEventListener('click', function(e) {
    if (e.target.closest('.show-password-btn')) {
        const btn = e.target.closest('.show-password-btn');
        const passwordText = btn.parentElement.querySelector('.password-text');
        const icon = btn.querySelector('i');
        const actualPassword = btn.dataset.password;
        
        if (passwordText.textContent.includes('•')) {
            passwordText.textContent = actualPassword;
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordText.textContent = '•'.repeat(actualPassword.length);
            icon.className = 'fas fa-eye';
        }
    }
});

function getIconForTitle(title) {
    const titleLower = (title || '').toLowerCase();
    
    if (titleLower.includes('instagram')) return 'fab fa-instagram';
    if (titleLower.includes('facebook')) return 'fab fa-facebook';
    if (titleLower.includes('twitter') || titleLower.includes('x.com')) return 'fab fa-twitter';
    if (titleLower.includes('whatsapp')) return 'fab fa-whatsapp';
    if (titleLower.includes('tiktok')) return 'fab fa-tiktok';
    if (titleLower.includes('gmail') || titleLower.includes('email') || titleLower.includes('outlook')) return 'far fa-envelope';
    if (titleLower.includes('bank') || titleLower.includes('atm') || titleLower.includes('bca') || titleLower.includes('mandiri') || titleLower.includes('bri')) return 'fas fa-credit-card';
    if (titleLower.includes('spotify')) return 'fab fa-spotify';
    if (titleLower.includes('netflix')) return 'fas fa-film';
    if (titleLower.includes('youtube')) return 'fab fa-youtube';
    if (titleLower.includes('game') || titleLower.includes('steam') || titleLower.includes('epic')) return 'fas fa-gamepad';
    
    return 'fas fa-user-circle';
}

// Export functions
window.dataManager = {
    allData,
    filteredData,
    loadDataFromFirebase,
    renderDataList,
    updateDataCount,
    resetForm
};

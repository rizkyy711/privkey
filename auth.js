// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboard = document.getElementById('dashboard');
const tokenInput = document.getElementById('token');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const closeLogoutModal = document.getElementById('closeLogoutModal');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

// Constants
const CORRECT_TOKEN = "0112";

// Login function
function handleLogin() {
    const enteredToken = tokenInput.value.trim();
    
    if (enteredToken === CORRECT_TOKEN) {
        loginPage.style.display = 'none';
        dashboard.style.display = 'block';
        localStorage.setItem('privatkey-loggedIn', 'true');
        showNotification('Login Berhasil', 'Selamat datang di PrivatKey!', 'success');
    } else {
        errorMessage.style.display = 'flex';
        tokenInput.style.borderColor = 'var(--danger)';
        showNotification('Login Gagal', 'Token yang dimasukkan salah!', 'error');
        
        // Shake animation
        const loginBox = document.querySelector('.login-box');
        loginBox.style.animation = 'none';
        setTimeout(() => {
            loginBox.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }
}

// Logout function
function handleLogout() {
    dashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    localStorage.removeItem('privatkey-loggedIn');
    tokenInput.value = '';
    logoutModal.classList.remove('active');
    showNotification('Berhasil Logout', 'Sampai jumpa kembali!', 'info');
}

// Event Listeners
loginBtn.addEventListener('click', handleLogin);

tokenInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleLogin();
});

tokenInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
    tokenInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
});

logoutBtn.addEventListener('click', () => {
    logoutModal.classList.add('active');
});

closeLogoutModal.addEventListener('click', () => {
    logoutModal.classList.remove('active');
});

cancelLogoutBtn.addEventListener('click', () => {
    logoutModal.classList.remove('active');
});

confirmLogoutBtn.addEventListener('click', handleLogout);

// Export functions
window.auth = {
    handleLogin,
    handleLogout,
    checkLoginStatus: function() {
        const isLoggedIn = localStorage.getItem('privatkey-loggedIn');
        if (isLoggedIn === 'true') {
            loginPage.style.display = 'none';
            dashboard.style.display = 'block';
            return true;
        }
        return false;
    }
};

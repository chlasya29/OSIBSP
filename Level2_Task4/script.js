document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const secureBox = document.getElementById('secure-box');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const toRegister = document.getElementById('to-register');
    const toLogin = document.getElementById('to-login');
    const logoutBtn = document.getElementById('logout-btn');

    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    const userDisplay = document.getElementById('user-display');

    // --- View Switching Navigation ---
    toRegister.addEventListener('click', (e) => {
        e.preventDefault();
        clearMessages();
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        clearMessages();
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    // --- Registration Logic ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearMessages();

        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;

        // Validation checks
        if (username.length < 3) {
            showError(registerError, 'Username must be at least 3 characters long.');
            return;
        }
        if (password.length < 6) {
            showError(registerError, 'Password must be at least 6 characters long.');
            return;
        }

        // Fetch existing database from localStorage
        let users = JSON.parse(localStorage.getItem('users')) || {};

        // Check if user already exists
        if (users[username.toLowerCase()]) {
            showError(registerError, 'Username is already taken.');
            return;
        }

        // Save new user (Using lowecase keys to prevent duplicate user variations)
        users[username.toLowerCase()] = { username: username, password: password };
        localStorage.setItem('users', JSON.stringify(users));

        registerSuccess.textContent = 'Registration successful! Redirecting to login...';
        registerSuccess.classList.remove('hidden');
        registerForm.reset();

        // Redirect to login view after 1.5 seconds
        setTimeout(() => {
            toLogin.click();
        }, 1500);
    });

    // --- Login Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearMessages();

        const usernameInput = document.getElementById('login-username').value.trim();
        const passwordInput = document.getElementById('login-password').value;

        let users = JSON.parse(localStorage.getItem('users')) || {};
        const foundUser = users[usernameInput.toLowerCase()];

        // Verify credentials
        if (foundUser && foundUser.password === passwordInput) {
            // Grant access to secure page
            userDisplay.textContent = foundUser.username;
            loginBox.classList.add('hidden');
            secureBox.classList.remove('hidden');
            loginForm.reset();
        } else {
            showError(loginError, 'Invalid username or password.');
        }
    });

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        secureBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
        clearMessages();
    });

    // --- Helper Functions ---
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    function clearMessages() {
        loginError.classList.add('hidden');
        registerError.classList.add('hidden');
        registerSuccess.classList.add('hidden');
    }
});
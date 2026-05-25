// ===== AUTH SYSTEM =====
// Foydalanuvchilar localStorage da saqlanadi
// Real loyihada backend API ishlatiladi

const AUTH_KEY = 'wdp_users';
const SESSION_KEY = 'wdp_session';

// Yordamchi funksiyalar
function getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function getSession() {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name, id: user.id }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function hashPassword(str) {
  // Oddiy hash (real loyihada bcrypt server-side)
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ===== DOM ELEMENTI YARATISH =====
function createAuthHTML() {
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.id = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div class="auth-logo">
        <div class="auth-logo-text">⚡ WEBDEV PRO</div>
        <div class="auth-logo-sub">30 KUNLIK ROADMAP</div>
      </div>

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" id="tab-login" role="tab" aria-selected="true" onclick="authSwitchTab('login')">🔑 Kirish</button>
        <button class="auth-tab" id="tab-register" role="tab" aria-selected="false" onclick="authSwitchTab('register')">✨ Ro'yxatdan o'tish</button>
      </div>

      <!-- LOGIN -->
      <div class="auth-form active" id="form-login" role="tabpanel">
        <div class="auth-field">
          <label class="auth-label" for="login-email">EMAIL</label>
          <input type="email" id="login-email" class="auth-input" placeholder="email@example.com" autocomplete="email">
          <div class="auth-error" id="login-email-err"></div>
        </div>
        <div class="auth-field">
          <label class="auth-label" for="login-pass">PAROL</label>
          <input type="password" id="login-pass" class="auth-input" placeholder="Parolingizni kiriting" autocomplete="current-password">
          <div class="auth-error" id="login-pass-err"></div>
        </div>
        <div class="auth-msg" id="login-msg"></div>
        <button class="auth-btn" id="login-btn" onclick="doLogin()">🔑 KIRISH</button>
        <div class="auth-divider">Akkount yo'qmi? <button style="background:none;border:none;color:var(--cyan);cursor:pointer;font-family:var(--font-mono);font-size:0.82rem;" onclick="authSwitchTab('register')">Ro'yxatdan o'ting →</button></div>
      </div>

      <!-- REGISTER -->
      <div class="auth-form" id="form-register" role="tabpanel">
        <div class="auth-field">
          <label class="auth-label" for="reg-name">ISM FAMILIYA</label>
          <input type="text" id="reg-name" class="auth-input" placeholder="Ismingiz" autocomplete="name">
          <div class="auth-error" id="reg-name-err"></div>
        </div>
        <div class="auth-field">
          <label class="auth-label" for="reg-email">EMAIL</label>
          <input type="email" id="reg-email" class="auth-input" placeholder="email@example.com" autocomplete="email">
          <div class="auth-error" id="reg-email-err"></div>
        </div>
        <div class="auth-field">
          <label class="auth-label" for="reg-pass">PAROL</label>
          <input type="password" id="reg-pass" class="auth-input" placeholder="Kamida 6 ta belgi" autocomplete="new-password">
          <div class="auth-error" id="reg-pass-err"></div>
        </div>
        <div class="auth-field">
          <label class="auth-label" for="reg-pass2">PAROLNI TASDIQLASH</label>
          <input type="password" id="reg-pass2" class="auth-input" placeholder="Parolni qayta kiriting" autocomplete="new-password">
          <div class="auth-error" id="reg-pass2-err"></div>
        </div>
        <div class="auth-msg" id="reg-msg"></div>
        <button class="auth-btn" id="reg-btn" onclick="doRegister()">✨ RO'YXATDAN O'TISH</button>
        <div class="auth-divider">Akkount bormi? <button style="background:none;border:none;color:var(--cyan);cursor:pointer;font-family:var(--font-mono);font-size:0.82rem;" onclick="authSwitchTab('login')">Kirish →</button></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function createUserChip() {
  // Topbardagi user button wrapper
  const topbarStats = document.querySelector('.topbar-stats');
  if (!topbarStats) return;

  const wrap = document.createElement('div');
  wrap.className = 'topbar-user-wrap';
  wrap.id = 'topbar-user-wrap';
  wrap.innerHTML = `
    <button class="user-chip" id="user-chip-btn" onclick="toggleUserDropdown()">
      <div class="user-avatar" id="user-avatar">?</div>
      <span id="user-chip-name">Foydalanuvchi</span>
    </button>
    <div class="user-dropdown hidden" id="user-dropdown">
      <div class="user-dropdown-name" id="dd-user-info">
        <strong id="dd-name"></strong>
        <span id="dd-email"></span>
      </div>
      <button class="user-dd-btn" onclick="authGoProfile()">👤 Profil</button>
      <button class="user-dd-btn logout" onclick="doLogout()">🚪 Chiqish</button>
    </div>
  `;
  // topbar-stats ni o'ng tomonga surib, user chip qo'shamiz
  topbarStats.parentNode.insertBefore(wrap, topbarStats);

  // Tashqariga click qilganda dropdown yopilsin
  document.addEventListener('click', (e) => {
    const chip = document.getElementById('topbar-user-wrap');
    if (chip && !chip.contains(e.target)) {
      const dd = document.getElementById('user-dropdown');
      if (dd) dd.classList.add('hidden');
    }
  });
}

// ===== TAB SWITCHING =====
function authSwitchTab(tab) {
  ['login', 'register'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).setAttribute('aria-selected', t === tab);
    document.getElementById('form-' + t).classList.toggle('active', t === tab);
  });
  // Xatolarni tozalash
  clearAuthErrors();
}

function clearAuthErrors() {
  ['login-email-err','login-pass-err','login-msg','reg-name-err','reg-email-err','reg-pass-err','reg-pass2-err','reg-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = el.className.replace(/ ?(success|error)/g,''); }
  });
  ['login-email','login-pass','reg-name','reg-email','reg-pass','reg-pass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}

// ===== REGISTER =====
function doRegister() {
  clearAuthErrors();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  let ok = true;

  if (!name || name.length < 2) {
    setFieldError('reg-name', 'reg-name-err', 'Ism kamida 2 ta harf');
    ok = false;
  }
  if (!validateEmail(email)) {
    setFieldError('reg-email', 'reg-email-err', 'To\'g\'ri email kiriting');
    ok = false;
  }
  if (pass.length < 6) {
    setFieldError('reg-pass', 'reg-pass-err', 'Parol kamida 6 ta belgi');
    ok = false;
  }
  if (pass !== pass2) {
    setFieldError('reg-pass2', 'reg-pass2-err', 'Parollar mos kelmaydi');
    ok = false;
  }
  if (!ok) return;

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    setFieldError('reg-email', 'reg-email-err', 'Bu email allaqachon ro\'yxatdan o\'tgan');
    return;
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: hashPassword(pass),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setSession(newUser);

  showAuthMsg('reg-msg', '✅ Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
  setTimeout(() => hideAuthOverlay(), 1000);
}

// ===== LOGIN =====
function doLogin() {
  clearAuthErrors();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  let ok = true;

  if (!validateEmail(email)) {
    setFieldError('login-email', 'login-email-err', 'To\'g\'ri email kiriting');
    ok = false;
  }
  if (!pass) {
    setFieldError('login-pass', 'login-pass-err', 'Parolni kiriting');
    ok = false;
  }
  if (!ok) return;

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashPassword(pass));

  if (!user) {
    showAuthMsg('login-msg', '❌ Email yoki parol noto\'g\'ri', 'error');
    document.getElementById('login-email').classList.add('error');
    document.getElementById('login-pass').classList.add('error');
    return;
  }

  setSession(user);
  showAuthMsg('login-msg', '✅ Xush kelibsiz, ' + user.name + '!', 'success');
  setTimeout(() => hideAuthOverlay(), 900);
}

// ===== LOGOUT =====
function doLogout() {
  clearSession();
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.add('hidden');
  showAuthOverlay();
  if (typeof showNotification === 'function') showNotification('👋 Chiqish amalga oshirildi');
}

// ===== HELPERS =====
function setFieldError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.add('error');
  if (err)   err.textContent = msg;
}

function showAuthMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-msg ' + type;
}

function showAuthOverlay() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideAuthOverlay() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.add('hidden');
  updateUserChip();
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function updateUserChip() {
  const session = getSession();
  const chip = document.getElementById('user-chip-btn');
  if (!chip || !session) return;

  document.getElementById('user-avatar').textContent = getInitials(session.name);
  document.getElementById('user-chip-name').textContent = session.name.split(' ')[0];
  document.getElementById('dd-name').textContent = session.name;
  document.getElementById('dd-email').textContent = session.email;
}

function authGoProfile() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.add('hidden');
  if (typeof showNotification === 'function') showNotification('👤 Profil sahifasi tez orada qo\'shiladi');
}

// Enter tugmasi bilan yuborish
function initAuthKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const overlay = document.getElementById('auth-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    const loginActive = document.getElementById('form-login').classList.contains('active');
    if (loginActive) doLogin();
    else doRegister();
  });
}

// ===== INIT =====
function initAuth() {
  createAuthHTML();
  createUserChip();
  initAuthKeyboard();

  const session = getSession();
  if (session) {
    hideAuthOverlay();
    updateUserChip();
  } else {
    showAuthOverlay();
  }
}

// app.js init dan OLDIN ishlashi kerak
document.addEventListener('DOMContentLoaded', initAuth);
const techColors = {
  HTML:'#e34f26', CSS:'#264de4', JavaScript:'#f7df1e',
  Tailwind:'#38bdf8', Git:'#f05032', Deployment:'#00d4ff',
  Tools:'#b347ff', All:'#00ff88', Freelance:'#ffd700'
};

const PAGE_TITLES = {
  home:'HOME', roadmap:'ROADMAP', lessons:'LESSONS',
  projects:'PROJECTS', exams:'EXAMS', resources:'RESOURCES',
  tools:'TOOLS', freelancing:'FREELANCING', contact:'CONTACT'
};

let completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]');
let currentWeekFilter = 0;

function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function saveProgress() {
  localStorage.setItem('completedDays', JSON.stringify(completedDays));
}

function updateProgress() {
  const count = completedDays.length;
  const pct = Math.round((count / 30) * 100);
  const fill = document.getElementById('progress-fill');
  const bar = fill.parentElement;
  fill.style.width = pct + '%';
  document.getElementById('progress-text').textContent = count + ' / 30';
  document.getElementById('completed-count').textContent = count;
  document.getElementById('streak-count').textContent = count;
  bar.setAttribute('aria-valuenow', count);
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    const isActive = n.dataset.page === id;
    n.classList.toggle('active', isActive);
    n.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  document.getElementById('topbar-title').textContent = PAGE_TITLES[id] || id.toUpperCase();

  if (window.innerWidth <= 768) closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menu-btn');
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('show', isOpen);
  menuBtn.setAttribute('aria-expanded', isOpen);
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menu-btn');
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  menuBtn.setAttribute('aria-expanded', 'false');
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  html.dataset.theme = newTheme;
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
  document.getElementById('theme-toggle-btn').setAttribute('aria-pressed', String(!isDark));
  localStorage.setItem('theme', newTheme);
}

function showNotification(msg) {
  const n = document.getElementById('notification');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(n._timeout);
  n._timeout = setTimeout(() => n.classList.remove('show'), 3500);
}

function toggleDay(dayNum) {
  const card = document.querySelector(`[data-day="${dayNum}"]`);
  if (card) {
    const isOpen = card.classList.toggle('open');
    card.setAttribute('aria-expanded', isOpen);
  }
}

function completeDay(dayNum, btn) {
  const isDone = completedDays.includes(dayNum);
  if (isDone) {
    completedDays = completedDays.filter(d => d !== dayNum);
    btn.textContent = '✓ Bajarilgan deb belgilash';
  } else {
    completedDays.push(dayNum);
    btn.textContent = '✅ Bajarildi!';
    showNotification(`🎉 Kun ${dayNum} bajarildi! +1 progress`);
  }
  const card = document.querySelector(`[data-day="${dayNum}"]`);
  if (card) card.classList.toggle('completed', completedDays.includes(dayNum));
  saveProgress();
  updateProgress();
}

function answerQuiz(el, isCorrect) {
  const opts = el.parentElement.querySelectorAll('.quiz-opt');
  opts.forEach(o => {
    o.disabled = true;
    o.style.pointerEvents = 'none';
  });
  el.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    const correctIdx = parseInt(el.dataset.correct);
    if (opts[correctIdx]) opts[correctIdx].classList.add('correct');
  }
}

function filterWeek(week, btn) {
  currentWeekFilter = week;
  document.querySelectorAll('.week-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  renderDays();
}

function renderDays() {
  const grid = document.getElementById('days-grid');
  const filtered = currentWeekFilter === 0 ? DAYS : DAYS.filter(d => d.week === currentWeekFilter);

  grid.innerHTML = filtered.map(d => {
    const done = completedDays.includes(d.day);
    const tc = techColors[d.tech] || '#00d4ff';
    return `
    <article class="day-card${done ? ' completed' : ''}" data-day="${d.day}" role="listitem" aria-expanded="false" tabindex="0">
      <div class="day-header">
        <span class="day-num">KUN ${d.day}</span>
        <span class="day-title">${d.title}</span>
        <span class="day-status" aria-hidden="true">${done ? '✓' : ''}</span>
      </div>
      <div class="day-body">
        <div class="day-tags">
          <span class="day-tag tag-lesson">📚 DARS</span>
          <span class="day-tag tag-practice">⚡ AMALIYOT</span>
          <span class="day-tag tag-exam">📝 TEST</span>
          <span class="tag-tech" style="color:${tc};border-color:${tc}30;background:${tc}10">${d.tech}</span>
        </div>
        <div class="day-desc"><strong>📖 Dars:</strong> ${d.lesson}</div>
        <div class="day-desc"><strong>⚡ Mashq:</strong> ${d.practice}</div>
        <pre class="code-block" tabindex="0" aria-label="Kod namunasi">${escHtml(d.code)}</pre>
        <div class="day-desc"><strong>📝 Vazifa:</strong> ${d.homework}</div>
        <div class="day-desc"><strong>🔥 Challenge:</strong> ${d.challenge}</div>
        <div class="quiz-container" role="region" aria-label="Mini imtihon">
          <div class="quiz-label">MINI IMTIHON</div>
          <div class="quiz-q" id="quiz-q-${d.day}">${d.quiz.q}</div>
          <div class="quiz-options" role="group" aria-labelledby="quiz-q-${d.day}">
            ${d.quiz.opts.map((o, i) => `
              <button class="quiz-opt"
                data-correct="${d.quiz.ans}"
                data-day="${d.day}"
                data-index="${i}"
                aria-label="${o}"
                type="button">${o}</button>
            `).join('')}
          </div>
        </div>
        <button class="day-complete-btn" data-day="${d.day}" type="button" aria-label="Kun ${d.day}ni bajarilgan deb belgilash">
          ${done ? '✅ Bajarildi!' : '✓ Bajarilgan deb belgilash'}
        </button>
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('.day-card').forEach(card => {
    card.querySelector('.day-header').addEventListener('click', () => {
      toggleDay(parseInt(card.dataset.day));
    });
    card.querySelector('.day-header').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDay(parseInt(card.dataset.day));
      }
    });
  });

  grid.querySelectorAll('.day-complete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      completeDay(parseInt(btn.dataset.day), btn);
    });
  });

  grid.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isCorrect = parseInt(btn.dataset.index) === parseInt(btn.dataset.correct);
      answerQuiz(btn, isCorrect);
    });
  });
}

function renderLessons() {
  const content = document.getElementById('lessons-content');
  const lessons = [
    {title:"HTML Fundamentals",icon:"🧱",color:"#e34f26",topics:["DOCTYPE va HTML tuzilishi","Semantic teglar (header, nav, main, article, footer)","Formalar va validatsiya","Jadvallar va ro'yxatlar","Media elementlar (img, video, audio)"],tip:"HTML — uy poydevori. Semantik yozing, keyinchalik SEO'ga yordam qiladi."},
    {title:"CSS Mastery",icon:"🎨",color:"#264de4",topics:["Box Model — content, padding, border, margin","Flexbox — 1D layouts","Grid — 2D complex layouts","Pseudo-classes (:hover, :focus, :nth-child)","Custom Properties (CSS Variables)","Media Queries — responsive design"],tip:"CSS'ni amalda o'rganasiz. Ko'p ko'chiring va o'zgartiring."},
    {title:"JavaScript Essentials",icon:"⚡",color:"#f7df1e",topics:["Variables, Types, Operators","Functions va Arrow Functions","DOM — tanlash va o'zgartirish","Events — click, submit, keydown","Fetch API — ma'lumot olish","LocalStorage — saqlash"],tip:"Console.log() — eng yaxshi do'stingiz. Har narsani print qiling."},
    {title:"Tailwind CSS",icon:"🌬️",color:"#38bdf8",topics:["Utility-first konsepti","CDN orqali ulash","Responsive prefixes (sm:, md:, lg:)","Dark mode (dark:)","Custom config","Komponentlarni o'chirish"],tip:"Tailwind'ni o'rganish 1-2 kun, chunki CSS bilsangiz — prefix logikasi oddiy."},
    {title:"Git & GitHub",icon:"🐙",color:"#f05032",topics:["git init, add, commit, push","Branches — feature, main","Pull Requests","GitHub Pages deployment","gitignore — nimani o'tkazmaslik","Collaboration workflow"],tip:"Har kuni commit qiling. GitHub green squares = portfolio."},
    {title:"Web Deployment",icon:"🚀",color:"#00d4ff",topics:["Netlify — drag-drop deploy","Vercel — GitHub integration","GitHub Pages — bepul hosting","Custom domain ulash","SSL sertifikati","Environment variables"],tip:"Har bir saytni deploy qiling. Link bo'lsa — klientga ko'rsatsa bo'ladi."}
  ];

  content.innerHTML = lessons.map(l => `
    <article class="lesson-card" style="border-color:${l.color}20">
      <div class="lesson-card-header">
        <span class="lesson-card-icon" aria-hidden="true">${l.icon}</span>
        <h3 class="lesson-card-title" style="color:${l.color}">${l.title}</h3>
      </div>
      <ul class="lesson-topics" aria-label="${l.title} mavzulari">
        ${l.topics.map(t => `
          <li class="lesson-topic">
            <span class="lesson-topic-bullet" style="color:${l.color}" aria-hidden="true">▸</span>
            <span>${t}</span>
          </li>`).join('')}
      </ul>
      <div class="lesson-tip" style="background:${l.color}10;border:1px solid ${l.color}25;color:${l.color}" role="note">
        💡 <strong>Pro Tip:</strong> ${l.tip}
      </div>
    </article>`).join('');
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = PROJECTS.map(p => `
    <article class="project-card">
      <div class="project-banner" style="background:${p.banner}" role="img" aria-label="${p.name} banner">${p.emoji}</div>
      <div class="project-content">
        <div class="difficulty ${p.difficulty}" aria-label="Qiyinlik darajasi: ${p.dlabel}">● ${p.dlabel}</div>
        <h3 class="project-name">${p.name}</h3>
        <p class="project-desc">${p.desc}</p>
        <ul class="project-points" aria-label="Loyiha xususiyatlari">
          ${p.points.map(pt => `<li class="project-point">${pt}</li>`).join('')}
        </ul>
        <div class="project-tags" role="list" aria-label="Texnologiyalar">
          ${p.tags.map(t => `<span class="ptag" role="listitem">${t}</span>`).join('')}
        </div>
      </div>
    </article>`).join('');
}

function renderExams() {
  const c = document.getElementById('exams-content');
  c.innerHTML = EXAMS.map(e => `
    <article class="exam-card">
      <div class="exam-header">
        <span class="exam-week">${e.week}</span>
        <h3 class="exam-title">${e.title}</h3>
      </div>
      <div class="exam-body">
        <p class="exam-desc">${e.desc}</p>
        <ul class="exam-list" aria-label="${e.title} tarkibi">
          ${e.items.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    </article>`).join('');
}

function renderResources() {
  const g = document.getElementById('resources-grid');
  g.innerHTML = RESOURCES.map(r => `
    <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="resource-card" aria-label="${r.name} — ${r.desc}">
      <div class="resource-icon" style="background:${r.bg}20;border:1px solid ${r.bg}40" aria-hidden="true">${r.icon}</div>
      <div class="resource-info">
        <div class="resource-name">${r.name}</div>
        <div class="resource-desc">${r.desc}</div>
      </div>
      <div class="resource-link" aria-hidden="true">Ochish →</div>
    </a>`).join('');
}

function renderTools() {
  const g = document.getElementById('tools-grid');
  g.innerHTML = TOOLS.map(t => `
    <article class="tool-card">
      <div class="tool-icon" aria-hidden="true">${t.icon}</div>
      <h3 class="tool-name">${t.name}</h3>
      <div class="tool-label">NIMA UCHUN</div>
      <p class="tool-why">${t.why}</p>
      <div class="tool-label">QANDAY O'RNATISH</div>
      <p class="tool-how">${t.install}</p>
      <div class="tool-label">QANDAY FOYDALANISH</div>
      <p class="tool-how">${t.use}</p>
    </article>`).join('');
}

function renderFreelancing() {
  const c = document.getElementById('freelance-steps');
  c.innerHTML = FREELANCE_STEPS.map(s => `
    <article class="step-card">
      <div class="step-num" aria-hidden="true">${s.num}</div>
      <div class="step-icon" aria-hidden="true">${s.icon}</div>
      <h3 class="step-title">${s.title}</h3>
      <p class="step-desc">${s.desc}</p>
    </article>`).join('');
}

function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.nav));
  });

  document.querySelectorAll('.week-tab[data-week]').forEach(tab => {
    tab.addEventListener('click', () => filterWeek(parseInt(tab.dataset.week), tab));
  });
}

function initSidebar() {
  document.getElementById('menu-btn').addEventListener('click', toggleSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
}

function initTheme() {
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
}

function initContact() {
  document.getElementById('contact-submit').addEventListener('click', () => {
    const name = document.getElementById('contact-name').value.trim();
    const msg  = document.getElementById('contact-message').value.trim();
    if (!name) { showNotification('⚠️ Iltimos, ismingizni kiriting.'); return; }
    if (!msg)  { showNotification('⚠️ Iltimos, savolingizni kiriting.'); return; }
    showNotification('✅ Xabar yuborildi! Tez orada javob beramiz.');
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-telegram').value = '';
    document.getElementById('contact-message').value = '';
  });
}

function applyTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  const isLight = saved === 'light';
  document.getElementById('theme-icon').textContent  = isLight ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = isLight ? 'Light Mode' : 'Dark Mode';
  document.getElementById('theme-toggle-btn').setAttribute('aria-pressed', String(isLight));
}

(function init() {
  applyTheme();
  renderDays();
  renderLessons();
  renderProjects();
  renderExams();
  renderResources();
  renderTools();
  renderFreelancing();
  updateProgress();
  initNavigation();
  initSidebar();
  initTheme();
  initContact();
})();

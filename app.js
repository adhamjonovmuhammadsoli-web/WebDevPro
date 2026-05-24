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
  bar.setAttribute('aria-valuenow', count);

  // Topbar: lesson topics bajarilganlari soni
  let topicsDone = 0;
  Object.values(lessonProgress).forEach(l => {
    topicsDone += Object.values(l).filter(Boolean).length;
  });
  document.getElementById('completed-count').textContent = topicsDone;
  document.getElementById('streak-count').textContent = count;
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
          <div class="quiz-q" id="quiz-q-${d.day}">${escHtml(d.quiz.q)}</div>
          <div class="quiz-options" role="group" aria-labelledby="quiz-q-${d.day}">
            ${d.quiz.opts.map((o, i) => `
              <button class="quiz-opt"
                data-correct="${d.quiz.ans}"
                data-day="${d.day}"
                data-index="${i}"
                aria-label="${escHtml(o)}"
                type="button">${escHtml(o)}</button>
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

const LESSONS_DATA = [
  {
    title:"HTML Fundamentals", icon:"🧱", color:"#e34f26", duration:"7 kun", level:"Boshlang'ich",
    tip:"HTML — uy poydevori. Semantik yozing, keyinchalik SEO'ga yordam qiladi.",
    topics:[
      {
        title:"DOCTYPE va HTML Tuzilishi",
        desc:"Har bir HTML sahifasi DOCTYPE deklaratsiyasi bilan boshlanadi. html, head va body — asosiy 3 qism. head — ko'rinmas meta ma'lumotlar. body — ekranda ko'rinadigan barcha kontent.",
        code:`<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Mening Saytim</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Salom Dunyo!</h1>\n  <p>Bu mening birinchi HTML sahifam.</p>\n  <script src="app.js"></script>\n</body>\n</html>`,
        output:"Brauzerda: 'Salom Dunyo!' sarlavhasi va birinchi sahifa matni ko'rinadi."
      },
      {
        title:"Semantic Teglar",
        desc:"Semantic teglar — mazmunli teglar. Brauzerga va SEO'ga sahifaning tuzilishini tushuntiradi. header, nav, main, section, article, aside, footer — asosiy semantic teglar. div va span o'rniga ularni ishlating.",
        code:`<header>\n  <nav>\n    <ul>\n      <li><a href="#about">Haqida</a></li>\n      <li><a href="#contact">Aloqa</a></li>\n    </ul>\n  </nav>\n</header>\n<main>\n  <section id="about">\n    <article>\n      <h2>Maqola sarlavhasi</h2>\n      <p>Maqola matni...</p>\n    </article>\n  </section>\n  <aside>\n    <h3>Qo'shimcha ma'lumot</h3>\n  </aside>\n</main>\n<footer>\n  <p>&copy; 2025 Mening Saytim</p>\n</footer>`,
        output:"Tuzilishli sahifa: tepada nav, o'rtada kontent + sidebar, pastda footer."
      },
      {
        title:"Matn Formatlash Teglari",
        desc:"h1-h6 sarlavhalar uchun, p — paragraf, strong — muhim (qalin), em — ta'kidlash (kursiv), br — satr uzish, hr — chiziq, blockquote — iqtibos. SEO uchun har sahifada faqat bitta h1 bo'lsin.",
        code:`<h1>Asosiy sarlavha</h1>\n<h2>Bo'lim sarlavhasi</h2>\n<h3>Kichik bo'lim</h3>\n\n<p>Bu oddiy paragraf. <strong>Bu matn muhim.</strong></p>\n<p>Bu <em>ta'kidlangan</em> matn va\n   bu <mark>belgilangan</mark> matn.</p>\n\n<p>Birinchi satr.<br>Bu ikkinchi satr.</p>\n\n<hr>\n\n<blockquote>\n  "Kelajak dasturlash biladiganlarniki"\n</blockquote>\n\n<p><small>Mualliflik: Ali Karimov, 2025</small></p>`,
        output:"Turli o'lchamdagi sarlavhalar, qalin/kursiv matnlar, gorizontal chiziq, iqtibos."
      },
      {
        title:"Havolalar va Navigatsiya",
        desc:"a tegi — havola yaratish. href — manzil, target='_blank' — yangi tabda. Ichki havolalar uchun # (anchor links). Email va telefon linklari ham mumkin. rel='noopener noreferrer' xavfsizlik uchun.",
        code:`<!-- Tashqi havola -->\n<a href="https://google.com"\n   target="_blank"\n   rel="noopener noreferrer">Google</a>\n\n<!-- Ichki sahifa havolasi -->\n<a href="/about.html">Biz haqimda</a>\n\n<!-- Anchor (sahifa ichida) -->\n<a href="#contact">Aloqa bo'limiga o'tish</a>\n\n<!-- Email va telefon -->\n<a href="mailto:ali@example.com">Email yuboring</a>\n<a href="tel:+998901234567">+998 90 123 45 67</a>\n\n<!-- Navigatsiya -->\n<nav>\n  <a href="/">Bosh sahifa</a>\n  <a href="/portfolio">Portfolio</a>\n  <a href="/contact">Aloqa</a>\n</nav>`,
        output:"Kliklanadigan havolalar, email va telefon linklari, navigatsiya menyusi."
      },
      {
        title:"Formalar va Input Turlari",
        desc:"Formalar foydalanuvchidan ma'lumot olish uchun. action — yuborish manzili, method — GET/POST. Input turlari: text, email, password, number, checkbox, radio, file, date. required — majburiy, placeholder — yordam matn.",
        code:`<form action="/submit" method="POST">\n  <label for="ism">Ism:</label>\n  <input type="text" id="ism" name="ism"\n         placeholder="Ismingiz" required>\n\n  <input type="email" name="email"\n         placeholder="email@example.com">\n\n  <input type="password" name="parol" minlength="8">\n\n  <input type="checkbox" id="kelishuv">\n  <label for="kelishuv">Shartlarga roziman</label>\n\n  <input type="radio" name="daraja" value="boshlang"> Boshlang'ich\n  <input type="radio" name="daraja" value="orta"> O'rta\n\n  <select name="shahar">\n    <option value="">Shahar tanlang</option>\n    <option value="toshkent">Toshkent</option>\n  </select>\n\n  <textarea name="xabar" rows="4"></textarea>\n\n  <button type="submit">Yuborish</button>\n</form>`,
        output:"To'liq forma: matn, email, parol, checkbox, radio, select va textarea."
      },
      {
        title:"Jadvallar va Ro'yxatlar",
        desc:"table — jadval, thead/tbody/tfoot — bo'limlar, tr — qator, th — sarlavha katakcha, td — oddiy katakcha. ul — tartibsiz ro'yxat, ol — tartibli, li — element. colspan/rowspan bilan katakchalarni birlashtirish.",
        code:`<ul>\n  <li>HTML — Tuzilma</li>\n  <li>CSS — Dizayn</li>\n  <li>JS — Funksiya</li>\n</ul>\n\n<ol>\n  <li>VS Code o'rnating</li>\n  <li>index.html yarating</li>\n  <li>Brauzerda oching</li>\n</ol>\n\n<table>\n  <thead>\n    <tr>\n      <th>Kun</th><th>Mavzu</th><th>Texnologiya</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>1</td><td>HTML Kirish</td><td>HTML5</td>\n    </tr>\n    <tr>\n      <td>8</td><td>CSS Kirish</td><td>CSS3</td>\n    </tr>\n  </tbody>\n</table>`,
        output:"Tartibsiz/tartibli ro'yxatlar va 3 ustunli jadval."
      },
      {
        title:"Media va Iframe",
        desc:"img — rasm (alt majburiy!), video — video player, audio — audio player, iframe — tashqi kontent embed. loading='lazy' — sahifa yuklanishini tezlashtiradi. controls — boshqaruv paneli ko'rsatadi.",
        code:`<img src="photo.jpg"\n     alt="Ali Karimov portreti"\n     width="800" height="600"\n     loading="lazy">\n\n<video controls width="100%" poster="preview.jpg">\n  <source src="video.mp4" type="video/mp4">\n  Brauzer video'ni qo'llab-quvvatlamaydi.\n</video>\n\n<audio controls>\n  <source src="music.mp3" type="audio/mpeg">\n</audio>\n\n<iframe\n  width="560" height="315"\n  src="https://youtube.com/embed/VIDEO_ID"\n  title="Dars videosi"\n  allowfullscreen\n  loading="lazy">\n</iframe>`,
        output:"Lazy-load rasm, video player, audio player, YouTube embed."
      }
    ]
  },
  {
    title:"CSS Mastery", icon:"🎨", color:"#264de4", duration:"7 kun", level:"O'rta",
    tip:"CSS'ni amalda o'rganasiz. Ko'p ko'chiring va o'zgartiring — tajriba eng yaxshi o'qituvchi.",
    topics:[
      {
        title:"Selectors va Specificity",
        desc:"CSS selectors — HTMLga stil berish uchun nishon olish. Element (p), class (.card), id (#main), attribute ([type='email']), pseudo-class (:hover, :nth-child), pseudo-element (::before). Specificity: id > class > element. Keyingi yozilgan ustunroq.",
        code:`/* Element */\np { color: #333; }\n\n/* Class (ko'p marta) */\n.card { background: white; border-radius: 8px; }\n\n/* ID (bir marta) */\n#main-title { font-size: 3rem; }\n\n/* Kombinatsiya */\n.nav a { text-decoration: none; }\n.card:first-child { border-top: 3px solid blue; }\n\n/* Pseudo-class */\na:hover { color: #00d4ff; }\ninput:focus { border-color: blue; outline: none; }\nli:nth-child(odd) { background: #f5f5f5; }\n\n/* Pseudo-element */\n.section::before {\n  content: '→ ';\n  color: #00d4ff;\n}\n\n/* Attribute selector */\ninput[type="email"] { border: 2px solid blue; }\na[target="_blank"]::after { content: ' ↗'; }`,
        output:"Turli selectors bilan elementlarga aniq stillar beriladi."
      },
      {
        title:"Box Model",
        desc:"Har bir HTML element to'rtburchak quti. Content → Padding → Border → Margin. box-sizing: border-box — padding va border umumiy o'lchamga kiritiladi. 300px kenglikdagi element har doim 300px bo'ladi.",
        code:`.card {\n  width: 300px;\n  min-height: 200px;\n\n  /* padding */\n  padding: 24px;              /* hamma tomondan */\n  padding: 20px 24px;         /* yuqori-past, chap-o'ng */\n\n  /* border */\n  border: 2px solid #00d4ff;\n  border-radius: 12px;\n  border-left: 4px solid #b347ff;\n\n  /* margin */\n  margin: 16px auto;          /* gorizontal markazda */\n\n  /* MUHIM */\n  box-sizing: border-box;\n\n  /* soya */\n  box-shadow: 0 4px 20px rgba(0,0,0,0.15),\n              0 0 0 1px rgba(255,255,255,0.05);\n}`,
        output:"300px kenglikdagi, 24px padding, ko'k chegara, ikki qavatli soyali karta."
      },
      {
        title:"Flexbox",
        desc:"Flexbox — 1 o'lchamli layout (qator yoki ustun). display:flex qo'yilganda ichki elementlar flex item. justify-content — asosiy o'q (gorizontal), align-items — qo'shimcha o'q (vertikal). gap — elementlar orasidagi masofa.",
        code:`.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 32px;\n  height: 64px;\n}\n\n/* Markazlash */\n.hero {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-direction: column;\n  min-height: 100vh;\n}\n\n/* Kartalar qatori */\n.cards {\n  display: flex;\n  gap: 20px;\n  flex-wrap: wrap;\n}\n.cards .card {\n  flex: 1;\n  min-width: 200px;\n  max-width: 300px;\n}\n\n/* justify-content:\n   flex-start | flex-end | center\n   space-between | space-around */`,
        output:"Chapda logo, o'ngda menu navbar. Pastda teng kenglikdagi kartalar."
      },
      {
        title:"CSS Grid",
        desc:"Grid — 2 o'lchamli layout (qator + ustun). Murakkab layoutlar uchun eng kuchli. grid-template-columns — ustunlar. fr — proporsional joy. repeat(3,1fr) — 3 teng ustun. auto-fill + minmax — JavaScript'siz responsive grid.",
        code:`.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\n/* Auto-responsive */\n.cards-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 24px;\n}\n\n/* Named areas layout */\n.page-layout {\n  display: grid;\n  grid-template-columns: 280px 1fr;\n  grid-template-rows: 60px 1fr 60px;\n  grid-template-areas:\n    "header  header"\n    "sidebar main"\n    "footer  footer";\n  min-height: 100vh;\n}\n.header  { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main    { grid-area: main; }\n.footer  { grid-area: footer; }\n\n.featured { grid-column: 1 / -1; /* barcha ustunlar */ }`,
        output:"3 ustunli galereya. Named areas bilan professional page layout."
      },
      {
        title:"CSS Positioning",
        desc:"Position — elementning joylanish usuli. static (default), relative (o'z joyiga nisbatan), absolute (ota elementga), fixed (viewport ga qotib), sticky (scroll bilan yopishuvchi). z-index — ustma-ust tartib.",
        code:`/* Relative */\n.badge {\n  position: relative;\n  top: -4px;\n  left: 8px;\n}\n\n/* Absolute — ota relative bo'lishi kerak */\n.card { position: relative; }\n.card .tag {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n}\n\n/* Fixed — scroll bilan qotib qoladi */\n.topbar {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n  z-index: 100;\n  background: rgba(5,10,15,0.95);\n  backdrop-filter: blur(20px);\n}\n\n/* Sticky */\n.section-title {\n  position: sticky;\n  top: 60px;\n  background: var(--bg);\n  z-index: 50;\n  padding: 12px 0;\n}`,
        output:"Fixed navbar, o'ng burchakdagi absolute badge, sticky sarlavha."
      },
      {
        title:"CSS Animatsiyalar va Transitions",
        desc:"Transition — qiymat o'zgarganda silliq animatsiya. @keyframes + animation — murakkab va takroriy animatsiyalar. Transform — rotate, scale, translate, skew. transition: property duration easing.",
        code:`/* Transition */\n.btn {\n  background: #00d4ff;\n  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);\n}\n.btn:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 8px 24px rgba(0,212,255,0.5);\n}\n\n/* @keyframes */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n@keyframes pulse {\n  0%,100% { transform: scale(1); }\n  50%     { transform: scale(1.05); }\n}\n\n.hero   { animation: fadeIn 0.6s ease; }\n.loader {\n  animation: spin 1s linear infinite;\n  border: 3px solid transparent;\n  border-top-color: #00d4ff;\n  border-radius: 50%;\n  width: 40px; height: 40px;\n}`,
        output:"Hover'da ko'tariladigan tugma, fade-in kontent, aylanuvchi loader."
      },
      {
        title:"CSS Variables va Theming",
        desc:"CSS Variables — :root da global o'zgaruvchilar. var() bilan ishlatish. Dark/Light mode uchun ideal. JavaScript orqali data-theme attribute bilan almashtiriladi. Bir joyda o'zgartirsangiz — hamma yerda o'zgaradi.",
        code:`:root {\n  --primary: #00d4ff;\n  --secondary: #b347ff;\n  --bg: #050a0f;\n  --surface: rgba(13,25,40,0.8);\n  --text: #e8f4f8;\n  --radius: 12px;\n  --glow: 0 0 20px rgba(0,212,255,0.3);\n  --transition: all 0.3s ease;\n}\n\n/* Light theme */\n[data-theme="light"] {\n  --bg: #f0f4f8;\n  --text: #0d1824;\n  --surface: rgba(255,255,255,0.9);\n}\n\n/* Ishlatish */\n.card {\n  background: var(--surface);\n  color: var(--text);\n  border-radius: var(--radius);\n  box-shadow: var(--glow);\n  transition: var(--transition);\n}\n\n/* JS bilan: */\n// document.documentElement.dataset.theme = 'light';`,
        output:"Dark va light mode. Barcha komponentlar avtomatik o'zgaradi."
      },
      {
        title:"Responsive Design — Media Queries",
        desc:"Media queries — ekran o'lchamiga qarab turli stillar. Mobile-first: avval kichik ekran, keyin kattaroqlar. Asosiy breakpointlar: 480px, 768px, 1024px, 1280px. vh/vw/rem/em — o'lcham birliklari.",
        code:`/* Mobile first (default) */\n.container {\n  width: 100%;\n  padding: 0 16px;\n}\n.grid { grid-template-columns: 1fr; }\n.nav-menu { display: none; }\n\n/* Tablet: 768px+ */\n@media (min-width: 768px) {\n  .container { padding: 0 24px; }\n  .grid { grid-template-columns: repeat(2, 1fr); }\n  .nav-menu { display: flex; }\n}\n\n/* Laptop: 1024px+ */\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 0 32px;\n  }\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}\n\n/* Print */\n@media print {\n  .topbar, .sidebar { display: none; }\n  body { font-size: 12pt; color: black; }\n}`,
        output:"Mobilda 1 ustun, tabletda 2, laptopda 3 ustun. Avtomatik moslashuvchan."
      }
    ]
  },
  {
    title:"JavaScript Essentials", icon:"⚡", color:"#f7df1e", duration:"7 kun", level:"O'rta",
    tip:"console.log() — eng yaxshi do'stingiz. Har narsani print qilib, sinab ko'ring.",
    topics:[
      {
        title:"Variables va Data Types",
        desc:"let va const — zamonaviy o'zgaruvchi e'lon qilish (var ishlatmang). const — o'zgarmas, let — o'zgaruvchan. 7 ta primitiv tip: string, number, boolean, null, undefined, bigint, symbol. typeof — tipni aniqlash. Template literals — backtick bilan interpolatsiya.",
        code:`const PI = 3.14159;     // o'zgarmas\nlet score = 0;          // o'zgaruvchan\n\n// Tiplar\nconsole.log(typeof "salom");   // string\nconsole.log(typeof 42);        // number\nconsole.log(typeof true);      // boolean\nconsole.log(typeof null);      // object (JS xatosi)\nconsole.log(typeof undefined); // undefined\n\n// String metodlari\nconst ism = "Ali Karimov";\nconsole.log(ism.length);          // 11\nconsole.log(ism.toUpperCase());   // ALI KARIMOV\nconsole.log(ism.includes("Ali")); // true\nconsole.log(ism.split(" "));      // [Ali, Karimov]\n\n// Template literal\nconst yosh = 22;\nconsole.log("Ismim " + ism + ", yoshim " + yosh);\n// yoki qisqaroq:\nconst xabar = "Ismim " + ism + ", yoshim " + yosh;\nconsole.log(xabar);`,
        output:"Console: string, number, boolean, object, undefined, 11, ALI KARIMOV, true, [Ali, Karimov]."
      },
      {
        title:"Functions va Control Flow",
        desc:"Functions — qayta ishlatiladigan kod bloklari. Function declaration (hoisting bor), arrow function. if/else — shartli bajarish. Ternary — qisqa if/else. Switch — ko'p shart. for, while, forEach — takrorlash.",
        code:`// Function declaration\nfunction salom(ism = "Do'st") {\n  return "Salom, " + ism + "!";\n}\n\n// Arrow function\nconst sonTekshir = (n) => n % 2 === 0 ? "Juft" : "Toq";\n\n// If/else\nconst ball = 85;\nif (ball >= 90) {\n  console.log("A'lo");\n} else if (ball >= 70) {\n  console.log("Yaxshi"); // chiqadi\n} else {\n  console.log("O'rtacha");\n}\n\n// Ternary\nconst status = ball >= 70 ? "O'tdi" : "Qoldi";\n\n// For loop\nfor (let i = 1; i <= 5; i++) {\n  console.log(i + "-kun");\n}\n\n// forEach\nconst texnologiyalar = ["HTML", "CSS", "JS"];\ntexnologiyalar.forEach((t, i) => {\n  console.log((i+1) + ". " + t);\n});\n\n// Switch\nswitch(new Date().getDay()) {\n  case 1: console.log("Dushanba"); break;\n  case 5: console.log("Juma"); break;\n  default: console.log("Boshqa kun");\n}`,
        output:"Console: 'Yaxshi', 1-5 kunlar, texnologiyalar ro'yxati."
      },
      {
        title:"Arrays va Objects",
        desc:"Array — tartibli elementlar to'plami. Object — kalit-qiymat juftliklari. Array metodlari: push, pop, map, filter, find, includes, reduce. Spread (...) — nusxa olish. Destructuring — chiqarib olish.",
        code:`// Array\nconst mevalar = ["olma", "nok", "banan", "uzum"];\nmevalar.push("olcha");      // oxirga qo'shish\nmevalar.pop();              // oxirini olish\n\nconst katta = mevalar.map(m => m.toUpperCase());\n// [OLMA, NOK, BANAN, UZUM]\n\nconst uzun = mevalar.filter(m => m.length > 3);\n// [banan, uzum]\n\nconst topildi = mevalar.find(m => m[0] === "n");\n// nok\n\n// Object\nconst user = {\n  id: 1,\n  ism: "Ali",\n  yosh: 22,\n  manzil: { shahar: "Toshkent" },\n  texnologiyalar: ["HTML", "CSS", "JS"]\n};\n\nconsole.log(user.ism);             // Ali\nconsole.log(user.manzil.shahar);   // Toshkent\nconsole.log(user["yosh"]);         // 22\n\n// Destructuring\nconst { ism, yosh } = user;\nconst [birinchi, ...qolgan] = user.texnologiyalar;\n\n// Spread\nconst yangi = { ...user, daraja: "Junior" };\nconst nusxa = [...mevalar, "gilos"];`,
        output:"Console: OLMA..., [banan,uzum], nok, Ali, Toshkent, 22."
      },
      {
        title:"DOM Manipulation",
        desc:"DOM — HTML elementlarini JavaScript orqali boshqarish. querySelector — bitta, querySelectorAll — ko'p element. innerHTML, textContent, classList, style, setAttribute — asosiy xususiyatlar. createElement + appendChild — yangi element yaratish.",
        code:`// Tanlash\nconst sarlavha = document.querySelector("h1");\nconst barchaBtnlar = document.querySelectorAll(".btn");\nconst idBilan = document.getElementById("main");\n\n// Kontent o'zgartirish\nsarlavha.textContent = "Yangi sarlavha";\nsarlavha.innerHTML = "Yangi <span>sarlavha</span>";\n\n// Stil\nsarlavha.style.color = "#00d4ff";\nsarlavha.style.fontSize = "2.5rem";\n\n// Class\nsarlavha.classList.add("active");\nsarlavha.classList.remove("hidden");\nsarlavha.classList.toggle("visible");\n\n// Attribute\nsarlavha.setAttribute("data-id", "123");\nconsole.log(sarlavha.getAttribute("data-id")); // 123\n\n// Yangi element yaratish\nconst karta = document.createElement("div");\nkarta.className = "card";\nkarta.innerHTML = "<h3>Yangi karta</h3><p>Dinamik kontent</p>";\ndocument.getElementById("container").appendChild(karta);\n\n// O'chirish\ndocument.querySelector(".eski")?.remove();`,
        output:"Sarlavha rangi o'zgaradi. Container'ga yangi karta qo'shiladi."
      },
      {
        title:"Events va Form Validation",
        desc:"Events — foydalanuvchi harakatlari: click, keydown, submit, input, scroll. addEventListener — event tinglash. preventDefault() — standart harakatni to'xtatish (forma yuborilmasin). stopPropagation() — event'ni yuqoriga tarqatmaslik.",
        code:`const btn = document.querySelector("#myBtn");\n\n// Click\nbtn.addEventListener("click", (e) => {\n  e.target.textContent = "Bosildi!";\n  e.target.disabled = true;\n});\n\n// Keyboard\ndocument.addEventListener("keydown", (e) => {\n  if (e.key === "Escape") closeSidebar();\n  if (e.ctrlKey && e.key === "s") {\n    e.preventDefault();\n    saveData();\n  }\n});\n\n// Form validation\nconst forma = document.querySelector("#forma");\nforma.addEventListener("submit", (e) => {\n  e.preventDefault();\n\n  const ism = document.querySelector("#ism").value.trim();\n  const email = document.querySelector("#email").value.trim();\n\n  if (!ism) { alert("Ism kiriting!"); return; }\n  if (!email.includes("@")) { alert("Email noto'g'ri!"); return; }\n\n  console.log("Yuborildi:", { ism, email });\n  forma.reset();\n});\n\n// Real-time input\ndocument.querySelector("#parol").addEventListener("input", (e) => {\n  const kuchli = e.target.value.length >= 8;\n  document.querySelector("#kuch").textContent = kuchli ? "Kuchli" : "Zaif";\n});`,
        output:"Tugma o'chadi, Escape sidebar'ni yopadi, forma validatsiya qiladi."
      },
      {
        title:"LocalStorage va SessionStorage",
        desc:"LocalStorage — brauzerda doimiy saqlash. SessionStorage — tab yopilguncha. Faqat string saqlaydi. Object/Array uchun JSON.stringify/parse zarur. ~5MB hajm. Tema, progress, todo list saqlanadi.",
        code:`// Saqlash\nlocalStorage.setItem("username", "Ali");\nconsole.log(localStorage.getItem("username")); // Ali\n\n// Object saqlash\nconst sozlamalar = {\n  theme: "dark",\n  language: "uz",\n  notifications: true\n};\nlocalStorage.setItem("settings", JSON.stringify(sozlamalar));\n\n// O'qish\nconst saved = JSON.parse(\n  localStorage.getItem("settings") || "{}"\n);\nconsole.log(saved.theme); // dark\n\n// Default qiymat bilan\nconst theme = localStorage.getItem("theme") || "dark";\n\n// Array saqlash\nconst history = JSON.parse(localStorage.getItem("history") || "[]");\nhistory.push({ date: Date.now(), action: "login" });\nlocalStorage.setItem("history", JSON.stringify(history));\n\n// O'chirish\nlocalStorage.removeItem("username");\nlocalStorage.clear(); // HAMMA narsani o'chiradi!\n\n// Barcha kalitlar\nObject.keys(localStorage).forEach(key => {\n  console.log(key, ":", localStorage.getItem(key));\n});`,
        output:"Ma'lumot saqlanadi. Sahifa yangilangandan keyin ham o'qiladi."
      },
      {
        title:"Fetch API va Async/Await",
        desc:"Fetch API — serverdan ma'lumot olish. Promise qaytaradi. async/await — asinxron kodni o'qilishi oson ko'rinishda yozish. try/catch — xatolarni ushlash. response.ok — muvaffaqiyatli javobmi?",
        code:`// Fetch va async/await\nasync function gitHubUser(username) {\n  try {\n    const response = await fetch(\n      "https://api.github.com/users/" + username\n    );\n\n    if (!response.ok) {\n      throw new Error("HTTP xato! status: " + response.status);\n    }\n\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Xato:", error.message);\n    return null;\n  }\n}\n\n// Chaqirish\ngitHubUser("torvalds").then(user => {\n  if (user) {\n    console.log(user.name);       // Linus Torvalds\n    console.log(user.followers);  // raqam\n  }\n});\n\n// POST request\nasync function ma_lumot_yuborish(data) {\n  const res = await fetch("https://api.example.com/users", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(data)\n  });\n  return await res.json();\n}\n\n// Parallel requests\nPromise.all([\n  fetch("/api/users").then(r => r.json()),\n  fetch("/api/posts").then(r => r.json())\n]).then(([users, posts]) => {\n  console.log(users, posts);\n});`,
        output:"GitHub'dan foydalanuvchi ma'lumotlari. Parallel requestlar bir vaqtda yuboriladi."
      },
      {
        title:"ES6+ Zamonaviy JS",
        desc:"Zamonaviy JS: destructuring, spread/rest, optional chaining (?.), nullish coalescing (??), Map, Set, class, modules. Kod qisqa va o'qilishi oson bo'ladi. Bu xususiyatlar hozirgi loyihalarda keng ishlatiladi.",
        code:`// Optional chaining\nconst shahar = user?.address?.city;    // undefined (xato emas)\nuser?.save?.();                         // metod yo'q bo'lsa o'tkazadi\n\n// Nullish coalescing\nconst ism = user.name ?? "Noma'lum";  // faqat null/undefined bo'lsa\n\n// Spread\nconst yangiArr = [...eski, yangiElement];\nconst yangiObj = { ...eski, yangiXususiyat: "qiymat" };\n\n// Destructuring\nconst { ism: userName, yosh = 18 } = user;\nconst [birinchi, , uchinchi] = array;\n\n// Set — takrorlanmas elementlar\nconst set = new Set([1, 2, 2, 3, 3]);\nconsole.log([...set]); // [1, 2, 3]\n\n// Map — har turdagi kalit\nconst map = new Map();\nmap.set("ism", "Ali");\nmap.set(42, "raqam kalit");\nconsole.log(map.get("ism")); // Ali\n\n// Class\nclass Foydalanuvchi {\n  #parol; // private field\n  constructor(ism, parol) {\n    this.ism = ism;\n    this.#parol = parol;\n  }\n  salom() { return "Salom, " + this.ism + "!"; }\n  parolTekshir(p) { return this.#parol === p; }\n}`,
        output:"Xavfsiz null-tekshiruv, takrorlanmas Set, Map va private class field."
      }
    ]
  },
  {
    title:"Tailwind CSS", icon:"🌬️", color:"#38bdf8", duration:"3 kun", level:"O'rta",
    tip:"Tailwind'ni o'rganish 1-2 kun — CSS bilsangiz prefix logikasi tez tushuniladi.",
    topics:[
      {
        title:"Utility-First Konsepti va CDN",
        desc:"Tailwind CSS — utility-first framework. Har bir CSS xususiyati uchun alohida class. CSS fayl yozmasdan to'g'ridan class yozib dizayn qilasiz. CDN bilan bir qatorda ulash mumkin. Pattern: {property}-{value} yoki {property}-{size}.",
        code:`<!-- CDN ulash -->\n<script src="https://cdn.tailwindcss.com"></script>\n\n<!-- Tailwind karta -->\n<div class="bg-slate-900 border border-cyan-500/20\n            rounded-xl p-6 m-4\n            hover:border-cyan-400\n            hover:-translate-y-1\n            transition-all duration-300\n            shadow-lg shadow-cyan-500/10">\n\n  <div class="bg-cyan-500/10 rounded-lg p-3\n              w-12 h-12 flex items-center\n              justify-center mb-4">\n    <span class="text-cyan-400 text-xl">&#9889;</span>\n  </div>\n\n  <h2 class="text-white font-bold text-xl mb-2\n             font-mono tracking-wide">\n    Karta sarlavhasi\n  </h2>\n\n  <p class="text-slate-400 text-sm leading-relaxed mb-4">\n    Karta tavsifi matni.\n  </p>\n\n  <button class="bg-cyan-500 text-black px-4 py-2\n                 rounded-lg font-semibold text-sm\n                 hover:bg-cyan-400 transition-colors\n                 active:scale-95">\n    Batafsil\n  </button>\n</div>`,
        output:"Ko'k chegarali, hover'da ko'tariladigan, soya effektli karta."
      },
      {
        title:"Flexbox va Grid Tailwind bilan",
        desc:"Tailwind'da Flexbox: flex, flex-col, items-center, justify-between, gap-{n}. Grid: grid, grid-cols-{n}, col-span-{n}. Spacing: p-{n} padding, m-{n} margin. 1 birlik = 4px.",
        code:`<!-- Flexbox Navbar -->\n<nav class="flex items-center justify-between\n            px-6 py-4 bg-slate-900\n            border-b border-slate-700">\n  <span class="text-cyan-400 font-bold text-lg">Logo</span>\n  <div class="flex items-center gap-6">\n    <a class="text-slate-400 hover:text-white\n              transition-colors text-sm">Home</a>\n    <a class="text-slate-400 hover:text-white\n              transition-colors text-sm">About</a>\n    <button class="bg-cyan-500 text-black\n                   px-4 py-2 rounded-lg\n                   font-semibold text-sm">Aloqa</button>\n  </div>\n</nav>\n\n<!-- Grid Cards -->\n<div class="grid grid-cols-1\n            md:grid-cols-2\n            lg:grid-cols-3\n            gap-6 p-8">\n  <div class="bg-slate-800 rounded-xl p-6\n              border border-slate-700\n              hover:border-cyan-500/50\n              transition-colors">\n    <h3 class="text-white font-bold mb-2">Karta 1</h3>\n    <p class="text-slate-400 text-sm">Tavsif matni</p>\n  </div>\n</div>`,
        output:"Professional navbar va responsive grid layout."
      },
      {
        title:"Responsive va Dark Mode",
        desc:"Tailwind breakpointlar: sm: (640px), md: (768px), lg: (1024px), xl: (1280px). dark: — dark mode uchun. hover:, focus:, active: — state-based stil. group/group-hover: — ota hover.",
        code:`<!-- Responsive sarlavha -->\n<h1 class="text-2xl sm:text-3xl md:text-4xl\n           lg:text-5xl xl:text-6xl\n           font-black text-white">\n  Zamonaviy Sayt\n</h1>\n\n<!-- Dark mode -->\n<div class="bg-white dark:bg-slate-900\n            text-slate-900 dark:text-white\n            border border-slate-200 dark:border-slate-700\n            rounded-xl p-6 transition-colors">\n  <h2 class="dark:text-cyan-400 font-bold">\n    Dark mode qo'llab-quvvatlanadi\n  </h2>\n</div>\n\n<!-- Group hover -->\n<div class="group flex items-center gap-4\n            p-4 rounded-xl cursor-pointer\n            hover:bg-slate-800/50 transition-all">\n  <div class="w-10 h-10 rounded-full bg-slate-700\n              group-hover:bg-cyan-500/20\n              group-hover:scale-110\n              transition-all flex items-center justify-center">\n    <span class="text-slate-400\n                 group-hover:text-cyan-400\n                 transition-colors">&#128100;</span>\n  </div>\n  <div>\n    <p class="text-white font-semibold">Ali Karimov</p>\n    <p class="text-slate-400 text-sm\n              group-hover:text-slate-300 transition-colors">\n      Junior Developer\n    </p>\n  </div>\n</div>`,
        output:"Responsive sarlavha, dark mode kartasi, group-hover animatsiyasi."
      },
      {
        title:"Tailwind Komponentlar",
        desc:"Tailwind bilan tez-tez ishlatiladigan komponentlar: Button, Badge, Input, Alert, Card. @apply — qayta ishlatiladigan CSS class yaratish. tailwind.config.js bilan custom ranglar va fontlar qo'shish.",
        code:`<!-- Gradient Button -->\n<button class="inline-flex items-center gap-2\n               bg-gradient-to-r from-cyan-500 to-blue-500\n               text-black font-semibold text-sm\n               px-5 py-2.5 rounded-lg\n               hover:from-cyan-400 hover:to-blue-400\n               active:scale-95 transition-all\n               shadow-lg shadow-cyan-500/25">\n  Boshlash\n</button>\n\n<!-- Badge -->\n<span class="inline-flex items-center\n             bg-green-500/10 text-green-400\n             border border-green-500/20\n             rounded-full px-3 py-1 text-xs font-mono">\n  &#9679; Faol\n</span>\n\n<!-- Input -->\n<input type="text"\n  class="w-full bg-slate-800 border border-slate-600\n         text-white placeholder-slate-400\n         rounded-lg px-4 py-3 text-sm\n         focus:outline-none focus:border-cyan-500\n         focus:ring-2 focus:ring-cyan-500/20\n         transition-all"\n  placeholder="Qidirish...">\n\n<!-- Alert -->\n<div class="flex items-start gap-3\n            bg-amber-500/10 border border-amber-500/20\n            text-amber-400 rounded-lg p-4">\n  <span>&#9888;</span>\n  <div>\n    <p class="font-semibold text-sm">Diqqat!</p>\n    <p class="text-xs mt-1">Bu amaliyot tajribalilar uchun</p>\n  </div>\n</div>`,
        output:"Gradient tugma, yashil badge, focus effektli input, amber alert."
      }
    ]
  },
  {
    title:"Git & GitHub", icon:"🐙", color:"#f05032", duration:"3 kun", level:"Boshlang'ich",
    tip:"Har kuni commit qiling. GitHub green squares = portfolio va ish izlash vositasi.",
    topics:[
      {
        title:"Git O'rnatish va Asosiy Buyruqlar",
        desc:"Git — version control tizimi. O'zgarishlarni kuzatadi, tarixini saqlaydi. Repository — loyiha papkasi. Commit — saqlangan holat. Staging area — commit'dan oldingi maydon. git-scm.com dan yuklab o'rnating.",
        code:`# Birinchi marta sozlash\ngit config --global user.name "Ismingiz"\ngit config --global user.email "email@example.com"\ngit config --list  # tekshirish\n\n# Yangi repo yaratish\nmkdir mening-saytim\ncd mening-saytim\ngit init\n\n# Asosiy workflow\ngit status              # holat ko'rish\ngit add index.html      # bitta fayl\ngit add .               # barcha fayllar\ngit add *.css           # pattern bilan\n\ngit commit -m "feat: bosh sahifa qo'shildi"\n\n# Tarix va ko'rish\ngit log                 # batafsil\ngit log --oneline       # qisqa\ngit show abc1234        # commit tafsiloti\ngit diff                # nima o'zgardi?\n\n# Orqaga qaytish\ngit restore index.html  # o'zgarishni bekor\ngit revert HEAD         # oxirgi commitni bekor`,
        output:"Terminal: Git sozlangan, repo yaratilgan, birinchi commit saqlangan."
      },
      {
        title:"GitHub va Remote Repository",
        desc:"GitHub — cloud-based Git hosting. origin — standart remote nom. push — local'dan yuborish. pull — remote'dan olish. clone — mavjud repo'ni yuklab olish. GitHub Pages — bepul static hosting.",
        code:`# GitHub'ga ulash\ngit remote add origin https://github.com/username/repo.git\ngit branch -M main\ngit push -u origin main  # birinchi push\n\n# Keyingi pushlar\ngit add .\ngit commit -m "fix: login formasi tuzatildi"\ngit push\n\n# Mavjud repo yuklab olish\ngit clone https://github.com/username/repo.git\ncd repo\n\n# Yangilash\ngit pull origin main\ngit fetch origin\n\n# GitHub Pages (bepul hosting)\n# 1. Repository > Settings > Pages\n# 2. Source: Deploy from branch\n# 3. Branch: main / root\n# 4. Save\n# URL: https://username.github.io/repo-name\n\n# .gitignore fayl\necho "node_modules/" >> .gitignore\necho ".env" >> .gitignore\necho ".DS_Store" >> .gitignore`,
        output:"Loyiha GitHub'ga yuklanadi. GitHub Pages orqali online ko'rinadi."
      },
      {
        title:"Branches va Collaboration",
        desc:"Branch — mustaqil ish yo'nalishi. main — asosiy kod. feature branches — yangi xususiyat uchun. Merge — birlashtirish. Conventional Commits standarti: feat/fix/style/docs/refactor.",
        code:`# Branch yaratish va o'tish\ngit branch feature/navbar\ngit checkout feature/navbar\n# yoki qisqa:\ngit checkout -b feature/contact-page\n\n# Ishlash...\ngit add .\ngit commit -m "feat: aloqa sahifasi qo'shildi"\n\n# Main'ga qaytish va merge\ngit checkout main\ngit merge feature/contact-page\ngit push\n\n# Branch o'chirish\ngit branch -d feature/navbar\n\n# Conflict hal qilish\n# Conflict bo'lsa, fayl ichida:\n# <<<<<<< HEAD\n# sizning kodingiz\n# =======\n# boshqa branch kodi\n# >>>>>>> feature/x\n# O'zgartiring:\ngit add . && git commit -m "merge: conflict hal qilindi"\n\n# Conventional Commits\ngit commit -m "feat: dark mode qo'shildi"\ngit commit -m "fix: mobile menu bug tuzatildi"\ngit commit -m "style: font o'zgartirildi"\ngit commit -m "docs: README yangilandi"`,
        output:"Feature branch, ishlash, main'ga merge qilish jarayoni."
      }
    ]
  },
  {
    title:"Web Deployment", icon:"🚀", color:"#00d4ff", duration:"2 kun", level:"Boshlang'ich",
    tip:"Har bir saytni deploy qiling — link bo'lsa klientga ko'rsatsa bo'ladi!",
    topics:[
      {
        title:"Netlify — Eng Oson Deploy",
        desc:"Netlify — eng ommabop bepul static hosting. Drag-drop yoki GitHub bilan deploy. Har push'da avtomatik rebuild. SSL bepul va avtomatik. Custom domain ulash mumkin. Bepul: 100GB bandwidth/oy.",
        code:`# USUL 1: Drag and Drop\n# netlify.com > Log in > Sites\n# "Add new site" > "Deploy manually"\n# Loyiha papkasini sürükleyin\n# Tayyor! Link beriladi\n\n# USUL 2: GitHub integratsiya\n# "Add new site" > "Import from Git"\n# GitHub > repo tanlang\n# Build settings:\n#   Branch: main\n#   Build command: (HTML/CSS uchun bo'sh)\n#   Publish directory: .\n# "Deploy site"\n# GitHub push = avtomatik yangilanadi\n\n# USUL 3: Netlify CLI\nnpm install -g netlify-cli\nnetlify login\nnetlify deploy         # preview\nnetlify deploy --prod  # production\n\n# netlify.toml (optional)\n# [build]\n#   publish = "."\n# [[redirects]]\n#   from = "/*"\n#   to = "/index.html"\n#   status = 200`,
        output:"Sayt https://amazing-site.netlify.app da jonli chiqadi."
      },
      {
        title:"Vercel va GitHub Pages",
        desc:"GitHub Pages — repository'dan bepul hosting. Netlify'ga alternativa. Vercel — React/Next.js uchun ideal. Custom domain: DNS'da CNAME qo'shing. SSL avtomatik ulashadi.",
        code:`# GitHub Pages\n# 1. Repository > Settings > Pages\n# 2. Source: Deploy from branch\n# 3. Branch: main  Folder: / (root)\n# 4. Save\n# URL: https://username.github.io/repo-name/\n\n# Vercel\nnpm install -g vercel\nvercel login\ncd loyiha-papkasi\nvercel\n\n# Yoki GitHub: vercel.com > New Project\n# Har push'da avtomatik deploy\n\n# Custom domain ulash\n# 1. Domain sotib oling: namecheap.com, reg.uz\n# 2. Netlify: Site settings > Domain management\n#    > Add custom domain\n# 3. DNS sozlash:\n#    Type A:     @ -> 75.2.60.5\n#    Type CNAME: www -> yoursite.netlify.app\n# 4. SSL ~24 soat ichida avtomatik\n\n# Saytni test qilish\n# PageSpeed Insights: pagespeed.web.dev\n# GTmetrix: gtmetrix.com\n# Lighthouse: Chrome DevTools`,
        output:"Sayt o'z domeningizda HTTPS bilan ishlaydi."
      },
      {
        title:"Performance va Optimizatsiya",
        desc:"Tez yuklaydigan sayt = ko'p foydalanuvchi = ko'p daromad. Rasmlarni optimize, CSS/JS minify, lazy loading. Core Web Vitals: LCP < 2.5s, CLS < 0.1. Google PageSpeed 90+ — ideal maqsad.",
        code:`<!-- Rasm optim. -->\n<picture>\n  <source srcset="rasm.webp" type="image/webp">\n  <img src="rasm.jpg" alt="Tavsif"\n       loading="lazy"\n       width="800" height="600"\n       decoding="async">\n</picture>\n\n<!-- Font optim. -->\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preload" as="style"\n  href="https://fonts.googleapis.com/css2?family=Rajdhani"\n  onload="this.rel='stylesheet'">\n\n<!-- Critical CSS (inline) -->\n<style>\n  body { margin:0; font-family:sans-serif; }\n  .hero { min-height:100vh; display:flex; }\n</style>\n\n<!-- JS defer bilan -->\n<script src="app.js" defer></script>\n\n/* CSS optim. */\n/* transform/opacity ishlating (GPU) */\n.card:hover {\n  transform: translateY(-4px);\n}\n/* top: -4px — reflow, sekin */\n\n/* Keraksiz animatsiya */\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none; transition: none; }\n}`,
        output:"PageSpeed 90+. Rasmlar lazy load. JS defer. LCP < 2.5s."
      }
    ]
  }
];

let activeLessonCard = null;
let activeTopic = null;
let lessonProgress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');

function saveLessonProgress() {
  localStorage.setItem('lessonProgress', JSON.stringify(lessonProgress));
}

function getLessonDone(li, ti) {
  return !!(lessonProgress[li] && lessonProgress[li][ti]);
}

function setLessonDone(li, ti, val) {
  if (!lessonProgress[li]) lessonProgress[li] = {};
  lessonProgress[li][ti] = val;
  saveLessonProgress();
  updateProgress();
}

function getLessonCardProgress(li) {
  const total = LESSONS_DATA[li].topics.length;
  const done = Object.values(lessonProgress[li] || {}).filter(Boolean).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}

function openLesson(li, ti) {
  activeLessonCard = li;
  activeTopic = ti;
  const lesson = LESSONS_DATA[li];
  const topic = lesson.topics[ti];
  const panel = document.getElementById('lesson-detail-panel');
  const isDone = getLessonDone(li, ti);

  panel.innerHTML = `
    <div class="ldp-header" style="border-color:${lesson.color}30">
      <button class="ldp-back" id="ldp-back" aria-label="Orqaga">← Orqaga</button>
      <div class="ldp-breadcrumb">
        <span style="color:${lesson.color}">${lesson.icon} ${lesson.title}</span>
        <span class="ldp-sep">›</span>
        <span>${topic.title}</span>
      </div>
      <button class="ldp-done-btn ${isDone ? 'is-done' : ''}" id="ldp-done" data-li="${li}" data-ti="${ti}">
        ${isDone ? '✅ Bajarildi' : '○ Bajarildi deb belgilash'}
      </button>
    </div>

    <div class="ldp-nav-tabs">
      ${lesson.topics.map((t, i) => `
        <button class="ldp-tab ${i === ti ? 'active' : ''} ${getLessonDone(li, i) ? 'tab-done' : ''}"
          data-li="${li}" data-ti="${i}"
          style="${i === ti ? `color:${lesson.color};border-color:${lesson.color}` : ''}">
          ${getLessonDone(li, i) ? '✓ ' : ''}${i + 1}. ${t.title}
        </button>`).join('')}
    </div>

    <div class="ldp-body">
      <h2 class="ldp-topic-title" style="color:${lesson.color}">${topic.title}</h2>
      <p class="ldp-desc">${topic.desc}</p>

      <div class="ldp-section-label">💻 KOD NAMUNASI</div>
      <pre class="ldp-code" tabindex="0">${escHtml(topic.code)}</pre>

      <div class="ldp-section-label">👁️ NATIJA</div>
      <div class="ldp-output">${topic.output}</div>

      <div class="ldp-tip" style="background:${lesson.color}10;border-color:${lesson.color}30;color:${lesson.color}">
        💡 <strong>Pro Tip:</strong> ${lesson.tip}
      </div>

      <div class="ldp-nav-btns">
        ${ti > 0 ? `<button class="ldp-nav-prev" data-li="${li}" data-ti="${ti - 1}">← Oldingi</button>` : '<span></span>'}
        ${ti < lesson.topics.length - 1
          ? `<button class="ldp-nav-next" data-li="${li}" data-ti="${ti + 1}" style="border-color:${lesson.color};color:${lesson.color}">Keyingi →</button>`
          : `<button class="ldp-nav-next ldp-finish" data-li="${li}" style="background:${lesson.color};color:#000">🏆 Bo'limni yakunlash</button>`}
      </div>
    </div>`;

  panel.classList.add('open');
  panel.scrollTop = 0;

  // Events
  document.getElementById('ldp-back').addEventListener('click', closeLesson);
  document.getElementById('ldp-done').addEventListener('click', () => toggleTopicDone(li, ti));
  panel.querySelectorAll('.ldp-tab').forEach(btn => {
    btn.addEventListener('click', () => openLesson(parseInt(btn.dataset.li), parseInt(btn.dataset.ti)));
  });
  panel.querySelectorAll('.ldp-nav-prev, .ldp-nav-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('ldp-finish')) {
        closeLesson();
        showNotification(`🏆 "${lesson.title}" bo'limi yakunlandi!`);
      } else {
        openLesson(parseInt(btn.dataset.li), parseInt(btn.dataset.ti));
      }
    });
  });
}

function closeLesson() {
  const panel = document.getElementById('lesson-detail-panel');
  panel.classList.remove('open');
  activeLessonCard = null;
  activeTopic = null;
  renderLessons();
}

function toggleTopicDone(li, ti) {
  const cur = getLessonDone(li, ti);
  setLessonDone(li, ti, !cur);
  openLesson(li, ti);
  updateLessonCardProgress(li);
}

function updateLessonCardProgress(li) {
  const { done, total, pct } = getLessonCardProgress(li);
  const card = document.querySelector(`.lesson-card[data-li="${li}"]`);
  if (!card) return;
  const fill = card.querySelector('.lc-prog-fill');
  const txt = card.querySelector('.lc-prog-txt');
  if (fill) fill.style.width = pct + '%';
  if (txt) txt.textContent = `${done}/${total}`;
}

function renderLessons() {
  const content = document.getElementById('lessons-content');

  // Global progress hisoblash
  const totalTopics = LESSONS_DATA.reduce((a, l) => a + l.topics.length, 0);
  let doneTopics = 0;
  Object.values(lessonProgress).forEach(l => {
    doneTopics += Object.values(l).filter(Boolean).length;
  });
  const globalPct = totalTopics ? Math.round(doneTopics / totalTopics * 100) : 0;
  const allDone = doneTopics === totalTopics && totalTopics > 0;

  content.innerHTML = `
    <div id="lesson-detail-panel" class="lesson-detail-panel"></div>

    <div class="lessons-summary">
      <div class="ls-left">
        <span class="ls-count">${doneTopics}<span class="ls-total"> / ${totalTopics}</span></span>
        <span class="ls-label">topic bajarildi</span>
      </div>
      <div class="ls-bar-wrap">
        <div class="ls-bar">
          <div class="ls-fill" style="width:${globalPct}%"></div>
        </div>
        <span class="ls-pct">${globalPct}%</span>
      </div>
      ${allDone ? '<span class="ls-badge">🏆 Hammasi yakunlandi!</span>' : ''}
    </div>

    <div class="lessons-grid" id="lessons-grid">
      ${LESSONS_DATA.map((l, li) => {
        const { done, total, pct } = getLessonCardProgress(li);
        const isComplete = done === total && total > 0;
        return `
        <article class="lesson-card lc-clickable ${isComplete ? 'lc-complete' : ''}"
          data-li="${li}" style="--lc:${l.color};"
          tabindex="0" role="button" aria-label="${l.title} darsini ochish">
          <div class="lc-top">
            <span class="lc-icon">${l.icon}</span>
            <div class="lc-meta">
              <span class="lc-level" style="color:${l.color}">${l.level}</span>
              <span class="lc-dur">⏱ ${l.duration}</span>
            </div>
            ${isComplete ? '<span class="lc-badge-done">✓ Yakunlandi</span>' : ''}
          </div>
          <h3 class="lesson-card-title" style="color:${l.color}">${l.title}</h3>
          <ul class="lesson-topics">
            ${l.topics.map((t, ti) => `
              <li class="lesson-topic lc-topic-item ${getLessonDone(li, ti) ? 'topic-done' : ''}"
                data-li="${li}" data-ti="${ti}">
                <span class="lesson-topic-bullet" style="color:${l.color}">
                  ${getLessonDone(li, ti) ? '✓' : '▸'}
                </span>
                <span>${t.title}</span>
              </li>`).join('')}
          </ul>
          <div class="lc-footer">
            <div class="lc-progress">
              <div class="lc-prog-bar">
                <div class="lc-prog-fill" style="width:${pct}%;background:${l.color}"></div>
              </div>
              <span class="lc-prog-txt">${done}/${total}</span>
            </div>
            <div class="lc-tip-preview" style="border-color:${l.color}20;color:${l.color}cc">
              💡 ${l.tip}
            </div>
            <button class="lc-start-btn" style="border-color:${l.color};color:${l.color}" data-li="${li}">
              ${done > 0 ? '▶ Davom etish' : '▶ Boshlash'}
            </button>
          </div>
        </article>`;
      }).join('')}
    </div>`;

  // Card click
  content.querySelectorAll('.lesson-card.lc-clickable').forEach(card => {
    const li = parseInt(card.dataset.li);
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('lc-start-btn') || e.target.classList.contains('lc-topic-item') || e.target.closest('.lc-topic-item')) return;
      const firstUndone = LESSONS_DATA[li].topics.findIndex((_, ti) => !getLessonDone(li, ti));
      openLesson(li, firstUndone >= 0 ? firstUndone : 0);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // Topic item click
  content.querySelectorAll('.lc-topic-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      openLesson(parseInt(item.dataset.li), parseInt(item.dataset.ti));
    });
  });

  // Start/Continue btn
  content.querySelectorAll('.lc-start-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const li = parseInt(btn.dataset.li);
      const firstUndone = LESSONS_DATA[li].topics.findIndex((_, ti) => !getLessonDone(li, ti));
      openLesson(li, firstUndone >= 0 ? firstUndone : 0);
    });
  });
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

  c.innerHTML = EXAMS.map((e, ei) => {
    const storageKey = 'exam_' + ei;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const answeredCount = Object.keys(saved).length;
    const total = e.quizzes.length;
    const score = Object.values(saved).filter(v => v.correct).length;
    const finished = answeredCount === total;

    const quizHTML = e.quizzes.map((qz, qi) => {
      const ans = saved[qi];
      const isAnswered = ans !== undefined;

      const optsHTML = qz.opts.map((opt, oi) => {
        let cls = 'exam-quiz-opt';
        if (isAnswered) {
          cls += ' disabled';
          if (oi === qz.ans) cls += ' correct';
          else if (oi === ans.chosen) cls += ' wrong';
        }
        return `<button class="${cls}"
          data-exam="${ei}" data-q="${qi}" data-opt="${oi}" data-ans="${qz.ans}"
          ${isAnswered ? 'disabled' : ''}
          type="button">${opt}</button>`;
      }).join('');

      return `
      <div class="exam-quiz-item" id="eq-${ei}-${qi}">
        <div class="exam-quiz-num">Savol ${qi + 1} / ${total}</div>
        <div class="exam-quiz-q">${escHtml(qz.q)}</div>
        <div class="exam-quiz-opts" role="group">${optsHTML}</div>
        ${isAnswered ? `<div class="exam-quiz-result ${ans.correct ? 'result-correct' : 'result-wrong'}">
          ${ans.correct ? '✅ To\'g\'ri!' : `❌ Noto'g'ri! To'g'ri javob: <strong>${escHtml(qz.opts[qz.ans])}</strong>`}
        </div>` : ''}
      </div>`;
    }).join('');

    return `
    <article class="exam-card" id="exam-card-${ei}">
      <div class="exam-header">
        <span class="exam-week">${e.week}</span>
        <h3 class="exam-title">${e.title}</h3>
        <div class="exam-score-badge ${finished ? (score >= total * 0.7 ? 'badge-pass' : 'badge-fail') : 'badge-pending'}" id="badge-${ei}">
          ${finished ? `${score}/${total} ${score >= total * 0.7 ? '🏆' : '📖'}` : `${answeredCount}/${total} javob`}
        </div>
      </div>
      <div class="exam-body">
        <p class="exam-desc">${e.desc}</p>
        <ul class="exam-list" aria-label="${e.title} tarkibi">
          ${e.items.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <div class="exam-quiz-section">
          <div class="exam-quiz-header">
            <span class="exam-quiz-title">🧪 INTERAKTIV TEST</span>
            <div class="exam-progress-wrap">
              <div class="exam-progress-bar"><div class="exam-progress-fill" id="epfill-${ei}" style="width:${total ? Math.round(answeredCount/total*100) : 0}%"></div></div>
              <span class="exam-progress-txt" id="eptxt-${ei}">${answeredCount}/${total}</span>
            </div>
            <button class="exam-reset-btn" data-exam="${ei}" type="button">↺ Qayta boshlash</button>
          </div>
          <div class="exam-quizzes" id="equizzes-${ei}">${quizHTML}</div>
          ${finished ? `<div class="exam-final-result ${score >= total * 0.7 ? 'final-pass' : 'final-fail'}" id="efinal-${ei}">
            ${score >= total * 0.7
              ? `🏆 Tabriklayman! ${score}/${total} — A'lo natija! Keyingi bo'limga o'ting.`
              : `📖 ${score}/${total} — Yaxshi urinish! Mavzularni takrorlang va qayta ishlang.`}
          </div>` : `<div class="exam-final-result" id="efinal-${ei}" style="display:none"></div>`}
        </div>
      </div>
    </article>`;
  }).join('');

  // Bind quiz buttons
  c.querySelectorAll('.exam-quiz-opt:not([disabled])').forEach(btn => {
    btn.addEventListener('click', handleExamAnswer);
  });

  // Bind reset buttons
  c.querySelectorAll('.exam-reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ei = parseInt(btn.dataset.exam);
      localStorage.removeItem('exam_' + ei);
      renderExams();
      showNotification('🔄 Imtihon qayta boshlandi!');
    });
  });
}

function handleExamAnswer(e) {
  const btn = e.currentTarget;
  const ei = parseInt(btn.dataset.exam);
  const qi = parseInt(btn.dataset.q);
  const oi = parseInt(btn.dataset.opt);
  const ans = parseInt(btn.dataset.ans);
  const isCorrect = oi === ans;

  const storageKey = 'exam_' + ei;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (saved[qi] !== undefined) return;
  saved[qi] = { chosen: oi, correct: isCorrect };
  localStorage.setItem(storageKey, JSON.stringify(saved));

  // Update buttons in this question
  const container = document.getElementById(`eq-${ei}-${qi}`);
  container.querySelectorAll('.exam-quiz-opt').forEach((ob, idx) => {
    ob.disabled = true;
    ob.classList.add('disabled');
    if (idx === ans) ob.classList.add('correct');
    else if (idx === oi) ob.classList.add('wrong');
  });

  // Show result
  let resultEl = container.querySelector('.exam-quiz-result');
  if (!resultEl) {
    resultEl = document.createElement('div');
    container.appendChild(resultEl);
  }
  const exam = EXAMS[ei];
  resultEl.className = `exam-quiz-result ${isCorrect ? 'result-correct' : 'result-wrong'}`;
  resultEl.innerHTML = isCorrect
    ? `✅ To'g'ri!`
    : `❌ Noto'g'ri! To'g'ri javob: <strong>${escHtml(exam.quizzes[qi].opts[ans])}</strong>`;

  // Update progress
  const total = exam.quizzes.length;
  const answeredCount = Object.keys(saved).length;
  const score = Object.values(saved).filter(v => v.correct).length;
  const fillEl = document.getElementById(`epfill-${ei}`);
  const txtEl = document.getElementById(`eptxt-${ei}`);
  if (fillEl) fillEl.style.width = Math.round(answeredCount / total * 100) + '%';
  if (txtEl) txtEl.textContent = `${answeredCount}/${total}`;

  // Update badge
  const badge = document.getElementById(`badge-${ei}`);
  if (badge) {
    const finished = answeredCount === total;
    badge.textContent = finished ? `${score}/${total} ${score >= total * 0.7 ? '🏆' : '📖'}` : `${answeredCount}/${total} javob`;
    badge.className = `exam-score-badge ${finished ? (score >= total * 0.7 ? 'badge-pass' : 'badge-fail') : 'badge-pending'}`;
  }

  // Show final result when done
  if (answeredCount === total) {
    const finalEl = document.getElementById(`efinal-${ei}`);
    if (finalEl) {
      finalEl.style.display = '';
      finalEl.className = `exam-final-result ${score >= total * 0.7 ? 'final-pass' : 'final-fail'}`;
      finalEl.innerHTML = score >= total * 0.7
        ? `🏆 Tabriklayman! ${score}/${total} — A'lo natija! Keyingi bo'limga o'ting.`
        : `📖 ${score}/${total} — Yaxshi urinish! Mavzularni takrorlang va qayta ishlang.`;
    }
    showNotification(score >= total * 0.7
      ? `🏆 ${EXAMS[ei].title}: ${score}/${total} — O'tdingiz!`
      : `📖 ${EXAMS[ei].title}: ${score}/${total} — Qayta urinib ko'ring.`);
  }
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

  // Home sahifadagi hafta kartlarini bosganda Roadmap'ga o'tib filtr qo'ysin
  document.querySelectorAll('[data-nav-week]').forEach(card => {
    const go = () => {
      const week = parseInt(card.dataset.navWeek);
      showPage('roadmap');
      setTimeout(() => {
        const tab = document.querySelector(`.week-tab[data-week="${week}"]`);
        if (tab) filterWeek(week, tab);
      }, 60);
    };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
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
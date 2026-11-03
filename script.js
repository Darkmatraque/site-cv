const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const state = { secrets: new Set(JSON.parse(localStorage.getItem('kb-secrets') || '[]')), konamiIndex: 0 };
const bootScreen = $('#bootScreen');
window.addEventListener('load', () => setTimeout(() => bootScreen?.classList.add('done'), 900));
setTimeout(() => bootScreen?.classList.add('done'), 1800);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => revealObserver.observe(el));
const recruiterToggle = $('#recruiterToggle');
recruiterToggle?.addEventListener('click', () => {
  document.body.classList.toggle('recruiter-mode');
  const enabled = document.body.classList.contains('recruiter-mode');
  recruiterToggle.setAttribute('aria-pressed', String(enabled));
  if (enabled) {
    markSecret('recruiter', 'Mode recruteur activé. Efficace.');
    $('#recruiterPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
const reasons = [
  'Parce qu’un CV ne montre pas tout. Une discussion de 10 minutes, déjà beaucoup plus.',
  'Parce que je sais déjà ce que veut dire recommencer une pièce jusqu’à ce qu’elle soit propre.',
  'Parce que je préfère apprendre une méthode correctement plutôt que faire semblant de savoir.',
  'Parce que ponctuel, fiable et soigneux, ce n’est pas très spectaculaire — mais au travail, ça sert tous les jours.',
  'Parce que je cherche une vraie chance de faire mes preuves, pas juste une ligne de plus sur un CV.',
  'Parce que si vous êtes arrivé jusque-là sur le site, on peut au moins se parler.'
];
let reasonIndex = 0;
$('#whyButton')?.addEventListener('click', () => {
  reasonIndex = (reasonIndex + 1) % reasons.length;
  const answer = $('#whyAnswer');
  if (!answer) return;
  answer.animate([{ opacity: .1, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
  answer.textContent = reasons[reasonIndex];
  if (reasonIndex === reasons.length - 1) markSecret('reasons', 'Tu as lu toutes les raisons. Respect.');
});
$$('.tilt-card').forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    if (window.matchMedia('(max-width: 900px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(0)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});
$$('.magnetic').forEach((el) => {
  el.addEventListener('mousemove', (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left - r.width / 2) * .12;
    const y = (event.clientY - r.top - r.height / 2) * .12;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});
const cursorDot = $('.cursor-dot');
const cursorRing = $('.cursor-ring');
if (window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.body.classList.add('cursor-ready');
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursorDot) cursorDot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
  });
  const animateCursor = () => {
    ringX += (mouseX - ringX) * .16;
    ringY += (mouseY - ringY) * .16;
    if (cursorRing) cursorRing.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
  $$('a, button, input').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}
function updateTime() {
  const target = $('#localTime');
  if (!target) return;
  const time = new Intl.DateTimeFormat('fr-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  target.textContent = `Neuchâtel — ${time}`;
}
updateTime();
setInterval(updateTime, 30000);
const terminal = $('#terminal');
const terminalInput = $('#terminalInput');
const terminalOutput = $('#terminalOutput');
const terminalForm = $('#terminalForm');
function openTerminal() {
  terminal?.classList.add('open');
  terminal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  setTimeout(() => terminalInput?.focus(), 100);
}
function closeTerminal() {
  terminal?.classList.remove('open');
  terminal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}
$('#terminalOpen')?.addEventListener('click', () => { openTerminal(); markSecret('terminal', 'Console secrète trouvée.'); });
$('#terminalClose')?.addEventListener('click', closeTerminal);
terminal?.addEventListener('click', (e) => { if (e.target === terminal) closeTerminal(); });
const commands = {
  help: () => 'Commandes : <b>profil</b>, <b>skills</b>, <b>cfc</b>, <b>cv</b>, <b>contact</b>, <b>astro</b>, <b>clear</b>',
  profil: () => 'Kevin Baumann · Neuchâtel · profil manuel, précis, sérieux et motivé.',
  skills: () => 'Polissage · avivage · sablage · satinage · contrôle visuel · MS Office · SAP · adaptation.',
  cfc: () => 'Pas de CFC obtenu. Mais plusieurs années de pratique en atelier et une vraie envie de continuer à apprendre.',
  cv: () => { window.open('assets/CV-Kevin-Baumann.pdf', '_blank', 'noopener'); return 'CV ouvert dans un nouvel onglet.'; },
  contact: () => 'Téléphone : <a href="tel:+41774737344">077 473 73 44</a><br>E-mail : <a href="mailto:kevin2007baumann@gmail.com">kevin2007baumann@gmail.com</a>',
  astro: () => { setTimeout(openSpace, 250); markSecret('astro-command', 'Commande astro trouvée.'); return 'Coordonnées verrouillées. Ouverture du ciel…'; }
};
terminalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = terminalInput.value.trim();
  const cmd = raw.toLowerCase();
  if (!raw) return;
  const line = document.createElement('p');
  line.innerHTML = `<span class="term-accent">$</span> ${escapeHtml(raw)}`;
  terminalOutput.appendChild(line);
  terminalInput.value = '';
  if (cmd === 'clear') terminalOutput.innerHTML = '';
  else {
    const answer = document.createElement('p');
    answer.className = 'term-muted';
    answer.innerHTML = commands[cmd] ? commands[cmd]() : `Commande inconnue : <b>${escapeHtml(cmd)}</b>. Essaie <b>help</b>.`;
    terminalOutput.appendChild(answer);
  }
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
});
function escapeHtml(str) { return str.replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char])); }
const spaceOverlay = $('#spaceOverlay');
let starAnimation = null;
function openSpace() {
  closeTerminal();
  spaceOverlay?.classList.add('open');
  spaceOverlay?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  startStars();
  markSecret('space', 'Astronomie débloquée ✦');
}
function closeSpace() {
  spaceOverlay?.classList.remove('open');
  spaceOverlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  if (starAnimation) cancelAnimationFrame(starAnimation);
}
$('#spaceSecret')?.addEventListener('click', openSpace);
$('#spaceClose')?.addEventListener('click', closeSpace);
$('#spaceExit')?.addEventListener('click', closeSpace);
function startStars() {
  const canvas = $('#starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const stars = Array.from({ length: Math.min(230, Math.floor(innerWidth / 4)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, z: Math.random() * 1.8 + .2, r: Math.random() * 1.4 + .2 }));
  const draw = () => {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    stars.forEach((s) => {
      s.y += .08 * s.z;
      if (s.y > innerHeight + 4) { s.y = -4; s.x = Math.random() * innerWidth; }
      ctx.globalAlpha = .25 + s.z / 2.2;
      ctx.fillStyle = s.z > 1.55 ? '#c7ff35' : '#ffffff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    starAnimation = requestAnimationFrame(draw);
  };
  draw();
}
$$('.secret-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const secret = button.dataset.secret;
    button.animate([{ transform: getComputedStyle(button).transform }, { transform: 'scale(1.15) rotate(-2deg)' }, { transform: getComputedStyle(button).transform }], { duration: 380, easing: 'ease-out' });
    if (secret === '1') markSecret('chip-1', 'Oui, plusieurs années à travailler avec les mains.');
    if (secret === '2') markSecret('chip-2', 'Le site vient officiellement de dire “bullshit”.');
    if (secret === '3') markSecret('chip-3', 'Motivation confirmée.');
  });
});
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
window.addEventListener('keydown', (event) => {
  if (terminal?.classList.contains('open')) return;
  const expected = konami[state.konamiIndex];
  if (event.key === expected || event.key.toLowerCase() === expected) {
    state.konamiIndex += 1;
    if (state.konamiIndex === konami.length) {
      state.konamiIndex = 0;
      document.documentElement.style.setProperty('--accent', '#7cf7ff');
      document.documentElement.style.setProperty('--accent-dark', '#0dcbd8');
      markSecret('konami', 'Konami code. Tu fouilles vraiment tout.');
      setTimeout(() => { document.documentElement.style.removeProperty('--accent'); document.documentElement.style.removeProperty('--accent-dark'); }, 9000);
    }
  } else state.konamiIndex = 0;
});
function markSecret(id, message) {
  if (state.secrets.has(id)) return;
  state.secrets.add(id);
  localStorage.setItem('kb-secrets', JSON.stringify([...state.secrets]));
  updateSecretCounter();
  showToast(message);
}
function updateSecretCounter() {
  const count = Math.min(5, state.secrets.size);
  const target = $('#secretCounter b');
  if (target) target.textContent = count;
}
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}
updateSecretCounter();
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (spaceOverlay?.classList.contains('open')) closeSpace();
  else if (terminal?.classList.contains('open')) closeTerminal();
});

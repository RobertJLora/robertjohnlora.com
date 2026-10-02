// The terminal layer. Every page works without it; this adds the prompt, theme toggle,
// clock and copy action on top of plain links.
import quoteGroups from '../data/quotes.json';
import { CASES } from '../data/cases';

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const EMAIL = 'rjlora@gmail.com';
const cwd = root.dataset.cwd || '~';
const onGamePage = root.dataset.game === 'true';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 767px)');

/* ---------- theme ---------- */
const lightQuery = matchMedia('(prefers-color-scheme: light)');
const themeBtn = $<HTMLButtonElement>('#theme-toggle');
const storedTheme = () => {
  try { return localStorage.getItem('theme'); } catch { return null; }
};
const currentTheme = () => (root.dataset.theme === 'day' ? 'day' : 'night');
function applyTheme(t: 'day' | 'night') {
  root.dataset.theme = t;
  root.classList.toggle('dark', t === 'night');
  const next = t === 'day' ? 'night' : 'day';
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', `switch to ${next} theme`);
    themeBtn.title = `switch to ${next} theme`;
    const label = themeBtn.querySelector('.theme-label');
    if (label) label.textContent = next;
  }
}
function setTheme(t: 'day' | 'night') {
  applyTheme(t);
  try { localStorage.setItem('theme', t === 'day' ? 'light' : 'dark'); } catch { /* storage blocked */ }
}
applyTheme(currentTheme());
themeBtn?.addEventListener('click', () => setTheme(currentTheme() === 'day' ? 'night' : 'day'));
lightQuery.addEventListener('change', (e) => {
  if (!storedTheme()) applyTheme(e.matches ? 'day' : 'night');
});

/* ---------- Portrait: resolves from big blocks to the photo, like a terminal drawing an image ---------- */
const portrait = document.querySelector<HTMLElement>('[data-portrait]');
if (portrait) {
  const img = portrait.querySelector('img') as HTMLImageElement;
  const canvas = portrait.querySelector('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const steps = [6, 10, 16, 26, 42, 68, 110];
  let run = 0;
  const decode = () => {
    if (!ctx || reduceMotion.matches || !img.naturalWidth) return;
    const mine = ++run;
    const size = canvas.width;
    portrait.classList.add('is-decoding');
    ctx.imageSmoothingEnabled = false;
    steps.forEach((n, i) => {
      setTimeout(() => {
        if (mine !== run) return;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, n, n);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, n, n, 0, 0, size, size);
      }, i * 85);
    });
    setTimeout(() => { if (mine === run) portrait.classList.remove('is-decoding'); }, steps.length * 85);
  };
  if (img.complete) decode(); else img.addEventListener('load', decode, { once: true });
  portrait.addEventListener('click', decode);
}

/* ---------- Barcelona clock (same Europe/Madrid zone) ---------- */
const clock = $<HTMLTimeElement>('#clock');
const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const tick = () => {
  if (!clock) return;
  const now = new Date();
  clock.textContent = clockFmt.format(now);
  clock.dateTime = now.toISOString();
};
tick();
setInterval(tick, 15000);

/* ---------- copy the address ---------- */
const toast = $('#toast');
let toastTimer = 0;
function showToast(msg: string) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}
async function copyEmail(): Promise<boolean> {
  let ok = false;
  try {
    await navigator.clipboard.writeText(EMAIL);
    ok = true;
  } catch {
    const t = document.createElement('textarea');
    t.value = EMAIL;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.append(t);
    t.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    t.remove();
  }
  showToast(ok ? `copied ${EMAIL}` : `couldn't reach the clipboard. the address is ${EMAIL}`);
  return ok;
}

/* ---------- tabs: fade the edge when the strip scrolls, keep the active tab in view ---------- */
const tabs = $('.tabs');
function paintTabFade() {
  if (!tabs) return;
  const max = tabs.scrollWidth - tabs.clientWidth;
  if (max <= 1) { tabs.removeAttribute('data-fade'); return; }
  const atStart = tabs.scrollLeft <= 1;
  const atEnd = tabs.scrollLeft >= max - 1;
  tabs.dataset.fade = atStart ? 'end' : atEnd ? 'start' : 'both';
}
if (tabs) {
  const active = tabs.querySelector<HTMLElement>('[aria-current="page"]');
  if (active && tabs.scrollWidth > tabs.clientWidth) {
    tabs.scrollLeft = active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2;
  }
  paintTabFade();
  tabs.addEventListener('scroll', paintTabFade, { passive: true });
  addEventListener('resize', paintTabFade);
  document.fonts?.ready.then(paintTabFade);
}

/* ---------- keep the window's bottom padding equal to the fixed bar (it grows when the phone prompt opens) ---------- */
const bar = $('.bar');
if (bar && 'ResizeObserver' in window) {
  new ResizeObserver(() => root.style.setProperty('--bar-real', `${bar.getBoundingClientRect().height}px`)).observe(bar);
}

/* ---------- skip link: focus the content, nothing else ---------- */
const main = $('#content');
$('.skip')?.addEventListener('click', (e) => {
  e.preventDefault();
  main?.focus();
});

/* ---------- the prompt ---------- */
const form = $<HTMLFormElement>('#prompt');
const input = $<HTMLInputElement>('#cmd');
const out = $('#out');
const outEcho = $('#out-echo');
const outBody = $('#out-body');
const outClose = $<HTMLButtonElement>('#out-close');
const termToggle = $<HTMLButtonElement>('#term-toggle');

const ROUTES: Record<string, string> = {
  about: '/', work: '/case-studies/', builds: '/builds/', umbra: '/umbra/', play: '/play/',
  notes: '/resources/', resources: '/resources/', quotes: '/quotes/', contact: '/quick-links/',
};
const SECTIONS = ['about', 'work', 'builds', 'umbra', 'play', 'notes', 'contact'];
const ALIAS: Record<string, string> = {
  '~': 'about', home: 'about', me: 'about', whois: 'about', '..': 'about', '/': 'about',
  cases: 'work', 'case-studies': 'work', proof: 'work', results: 'work',
  build: 'builds', projects: 'builds',
  games: 'play', game: 'play',
  email: 'contact', mail: 'contact', hire: 'contact', 'quick-links': 'contact',
  reading: 'notes',
};
const GAMES = ['surge', 'serpent', 'keywords', 'updates', 'halftone'];
const EXTERNAL: Record<string, string> = {
  linkedin: 'https://linkedin.com/in/robert-john-lora',
  github: 'https://github.com/RobertJLora',
  userp: 'https://userp.io',
  umbra: 'https://chromewebstore.google.com/detail/umbra-browser-control-for/ccpcgfdklaihmikbpnnifegfonaojhli',
  'umbra-source': 'https://github.com/RobertJLora/umbra',
};
const CASE_SLUGS = CASES.map((c) => c.slug);
const CASE_ALIAS: Record<string, string> = {
  formhealth: 'form-health', form: 'form-health', 'chamber-of-commerce': 'chamber', chamberofcommerce: 'chamber', bigc: 'bigcommerce',
};
const COMMANDS = ['help', 'ls', 'cd', 'cat', 'open', 'whoami', 'theme', 'fortune', 'history', 'clear', 'copy', 'pwd', 'echo', 'sudo', 'exit', 'salsa', ...SECTIONS, 'quotes', 'resources'];
const QUOTES = (quoteGroups as { quotes: { text: string; by: string }[] }[]).flatMap((g) => g.quotes);

// Plain English: the first intent whose pattern matches wins.
const INTENTS: [string, RegExp][] = [
  ['contact', /\b(e-?mail|mail|contact|hire|hiring|get in touch|reach (you|out)|talk to|work with you|book a call|call you|phone|consult)/],
  ['umbra', /\b(extension|chrome|browser|umbra)\b/],
  ['play', /\b(games?|fun|play|snake|serpent|surge|quiz|halftone)\b/],
  ['quotes', /\b(quotes?|wisdom|stoic|motivation)\b/],
  ['notes', /\b(reading|resources?|read|newsletters?|podcasts?|blogs?|learn|notes|follow)\b/],
  ['work', /\b(results?|case ?stud(y|ies)|cases|clients?|numbers|proof|portfolio|wins|traffic|growth|rankings?)\b/],
  ['builds', /\b(tools?|built|builds?|mcp|projects?|claude|automations?|agents?|python|code)\b/],
  ['about', /\b(who are you|who is|about|background|story|bio|yourself|career|experience|robert)\b/],
];

const HIST_KEY = 'term-history';
const loadHist = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(HIST_KEY) || '[]'); } catch { return []; }
};
const hist = loadHist();
let histIdx = hist.length;
let typingRun = 0;

const el = (tag: string, cls?: string, text?: string) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const line = (text: string, cls = '') => el('p', `out-line ${cls}`.trim(), text);
const chip = (cmd: string, label?: string) => {
  const b = el('button', 'chip', label || cmd) as HTMLButtonElement;
  b.type = 'button';
  b.dataset.cmd = cmd;
  return b;
};
const linkChip = (href: string, label: string) => {
  const a = el('a', 'chip', label) as HTMLAnchorElement;
  a.href = href;
  return a;
};
const row = (...nodes: Node[]) => {
  const r = el('div', 'out-row');
  r.append(...nodes);
  return r;
};

function remember(cmd: string) {
  if (hist[hist.length - 1] !== cmd) hist.push(cmd);
  while (hist.length > 50) hist.shift();
  histIdx = hist.length;
  try { sessionStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch { /* storage blocked */ }
}

function print(cmd: string, ...nodes: Node[]) {
  if (!out || !outBody || !outEcho) return;
  outEcho.replaceChildren(el('span', 'cwd', cwd), el('span', 'chev'), el('span', 'cmd', cmd));
  outBody.replaceChildren(...nodes);
  out.classList.add('is-open');
  if (outClose) outClose.hidden = false;
  outBody.scrollTop = 0;
}
function closeOutput() {
  if (!out || !outBody || !outEcho) return;
  out.classList.remove('is-open');
  outBody.replaceChildren();
  outEcho.replaceChildren();
  if (outClose) {
    const hadFocus = document.activeElement === outClose;
    outClose.hidden = true;
    if (hadFocus) (input && isPromptVisible() ? input : main)?.focus({ preventScroll: true });
  }
}
outClose?.addEventListener('click', closeOutput);

function go(url: string) {
  closeOutput();
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener');
    return;
  }
  location.href = url;
}

function helpOut(): Node[] {
  const g = el('div', 'help-grid');
  ([
    ['work', 'case studies with the real numbers'],
    ['builds', "what I've built with claude code"],
    ['umbra', 'the chrome extension I shipped'],
    ['play', 'games and tools you can run'],
    ['notes', 'resources and quotes'],
    ['contact', 'email, linkedin, github'],
    ['cat onboard', 'open one case study'],
    ['open linkedin', 'open a link in a new tab'],
    ['theme day', 'switch to the light theme'],
    ['fortune', 'a random quote'],
    ['history', 'what you ran so far'],
    ['clear', 'close this output'],
  ] as [string, string][]).forEach(([c, d]) => g.append(chip(c), el('span', '', d)));
  return [g, line('or just ask in plain words, like "how do I reach you". tab completes, up arrow recalls.', 'out-dim')];
}

function distance(a: string, b: string) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return m[a.length][b.length];
}
function suggest(word: string) {
  const vocab = [...new Set([...COMMANDS, ...Object.keys(ALIAS), ...CASE_SLUGS])];
  const near = vocab
    .map((v) => [v, distance(word, v)] as [string, number])
    .filter(([v, n]) => n <= Math.max(1, Math.floor(v.length / 3)))
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([v]) => (CASE_SLUGS.includes(v) ? `cat ${v}` : v));
  return near.length ? near : ['work', 'contact', 'help'];
}

const resolveSection = (w: string) => (ROUTES[w] ? w : ALIAS[w]);
const resolveCase = (w: string) => (CASE_SLUGS.includes(w) ? w : CASE_ALIAS[w]);
const gameUrl = (g: string) => `/play/${g}/`;

function matchIntent(text: string) {
  const t = ` ${text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9#@.\- ]/g, ' ')} `;
  for (const [target, re] of INTENTS) if (re.test(t)) return target;
  return null;
}

function run(raw: string) {
  const cmd = raw.trim().replace(/\s+/g, ' ');
  if (!cmd) return;
  remember(cmd);
  const lower = cmd.toLowerCase();
  const [w0, ...rest] = lower.split(' ');
  const arg = rest.join(' ');
  const a0 = rest[0] || '';

  // the three easter eggs
  if (w0 === 'sudo') {
    if (/^hire robert( lora)?$/.test(arg)) {
      return print(cmd, line('[sudo] permission granted.', 'out-ok'), line('the fastest path is email. he answers.'),
        row(linkChip(`mailto:${EMAIL}`, 'email me'), chip('copy', 'copy address'), chip('open linkedin', 'linkedin')));
    }
    return print(cmd, line('nice try. you are not in the sudoers file. this incident will be reported to nobody.', 'out-dim'), row(chip('sudo hire robert')));
  }
  if (w0 === 'exit' || w0 === 'logout' || w0 === 'quit') {
    return print(cmd, line("there's no exit here. there's an email though."), row(linkChip(`mailto:${EMAIL}`, 'email me'), chip('copy', 'copy address')));
  }
  if (w0 === 'salsa') {
    return print(cmd, line('one, two, three. five, six, seven.'), line('back to work.', 'out-dim'), row(chip('work')));
  }

  switch (w0) {
    case 'help': case '?': case 'man':
      return print(cmd, ...helpOut());
    case 'ls': case 'dir': case 'll': {
      const s = resolveSection(a0);
      if (s === 'work') return print(cmd, row(...CASES.map((c) => chip(`cat ${c.slug}`, c.slug))));
      if (s === 'play') return print(cmd, row(...GAMES.map((g) => chip(`open ${g}`, `./${g}`))));
      if (a0 && s && s !== 'about') return go(ROUTES[s]);
      return print(cmd, row(...SECTIONS.map((t) => chip(`cd ${t}`, `${t}/`))));
    }
    case 'cd': {
      const target = a0.replace(/^~\//, '').replace(/\/$/, '');
      if (!target || target === '~') return go('/');
      const s = resolveSection(target);
      if (s) return go(ROUTES[s]);
      const c = resolveCase(target);
      if (c) return go(`/case-studies/#${c}`);
      if (GAMES.includes(target)) return go(gameUrl(target));
      return print(cmd, line(`cd: no such directory: ${a0}`, 'out-err'), row(...SECTIONS.map((t) => chip(`cd ${t}`, `${t}/`))));
    }
    case 'cat': case 'less': case 'more': case 'bat': {
      const name = a0.replace(/\.(md|txt)$/, '').replace(/^cases\//, '');
      const c = resolveCase(name);
      if (c) return go(`/case-studies/#${c}`);
      if (name === 'readme' || name === 'umbra') return go('/umbra/');
      if (name === 'quotes') return go('/quotes/');
      if (name === 'resources') return go('/resources/');
      if (!name) return print(cmd, line('cat what? try a case study:', 'out-dim'), row(...CASES.map((x) => chip(`cat ${x.slug}`, x.slug))));
      return print(cmd, line(`cat: ${name}: no such file`, 'out-err'), row(...CASES.map((x) => chip(`cat ${x.slug}`, x.slug))));
    }
    case 'open': case 'xdg-open': case 'start': {
      const key = a0 === 'store' || a0 === 'chrome' ? 'umbra' : a0;
      if (EXTERNAL[key]) {
        print(cmd, line(`opened ${EXTERNAL[key]}`, 'out-dim'));
        window.open(EXTERNAL[key], '_blank', 'noopener');
        return;
      }
      if (GAMES.includes(key)) return go(gameUrl(key));
      if (key === 'email' || key === 'mail') { location.href = `mailto:${EMAIL}`; return; }
      return print(cmd, line(a0 ? `open: nothing called "${a0}". these work:` : 'open what? these work:', a0 ? 'out-err' : 'out-dim'),
        row(...[...Object.keys(EXTERNAL), ...GAMES].map((k) => chip(`open ${k}`, k))));
    }
    case 'whoami':
      return print(cmd, line('robert lora. director of SEO at uSERP, running a ~$1M B2B client portfolio.'), line('miami kid, based in barcelona.', 'out-dim'));
    case 'theme': {
      const want = ({ day: 'day', light: 'day', dawn: 'day', night: 'night', dark: 'night', moon: 'night' } as Record<string, 'day' | 'night'>)[a0];
      if (want) { setTheme(want); return print(cmd, line(`theme set to ${want}`, 'out-dim')); }
      if (!a0 || a0 === 'toggle') { setTheme(currentTheme() === 'day' ? 'night' : 'day'); return print(cmd, line(`theme set to ${currentTheme()}`, 'out-dim')); }
      return print(cmd, line('theme: pick day or night', 'out-err'), row(chip('theme day'), chip('theme night')));
    }
    case 'fortune': {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      return print(cmd, line(`"${q.text}"`), line(q.by, 'out-dim'), row(chip('fortune', 'another one'), linkChip('/quotes/', 'all quotes')));
    }
    case 'history':
      if (hist.length < 2) return print(cmd, line('only this one so far.', 'out-dim'));
      return print(cmd, ...hist.slice(0, -1).slice(-12).map((h, i) => {
        const r = row(el('span', 'out-dim', String(i + 1).padStart(3, ' ')), chip(h));
        r.style.alignItems = 'center';
        return r;
      }));
    case 'clear': case 'cls': case 'reset':
      return closeOutput();
    case 'copy': case 'pbcopy':
      copyEmail().then((ok) => print(cmd, line(ok ? `copied ${EMAIL}` : `couldn't reach the clipboard. the address is ${EMAIL}`, ok ? 'out-ok' : 'out-err')));
      return;
    case 'pwd':
      return print(cmd, line(`/home/robert/${cwd.replace(/^~\/?/, '')}`, 'out-dim'));
    case 'echo':
      return print(cmd, line(cmd.slice(5)));
  }

  const s = resolveSection(w0);
  if (s && rest.length === 0) return go(ROUTES[s]);
  const c = resolveCase(w0);
  if (c && rest.length === 0) return go(`/case-studies/#${c}`);
  if (GAMES.includes(w0) && rest.length === 0) return go(gameUrl(w0));

  const intent = matchIntent(cmd);
  if (intent) return go(ROUTES[intent]);

  const isQuestion = rest.length > 0 || /\?$/.test(cmd);
  return print(cmd,
    line(isQuestion ? "I don't have an answer for that one." : `command not found: ${w0}`, isQuestion ? '' : 'out-err'),
    line(isQuestion ? 'these might help:' : 'no problem. maybe one of these:', 'out-dim'),
    row(...(isQuestion ? ['work', 'contact', 'help'] : suggest(w0)).map((x) => chip(x))));
}

/* a very short typed echo for clicked commands, then run (instant with reduced motion) */
function typeThenRun(cmd: string) {
  if (!input || !isPromptVisible() || reduceMotion.matches) return run(cmd);
  const id = ++typingRun;
  const step = Math.max(1, Math.ceil(cmd.length / 10));
  let i = 0;
  const tickType = () => {
    if (id !== typingRun) return;
    i = Math.min(cmd.length, i + step);
    input.value = cmd.slice(0, i);
    if (i < cmd.length) setTimeout(tickType, 16);
    else setTimeout(() => { if (id === typingRun) { input.value = ''; run(cmd); } }, 60);
  };
  tickType();
}

function isPromptVisible() {
  return !!form && form.offsetParent !== null;
}

function complete(): boolean {
  if (!input) return false;
  const v = input.value.replace(/^\s+/, '').toLowerCase();
  const parts = v.split(' ');
  let pool: string[];
  if (parts.length === 1) pool = [...COMMANDS, ...GAMES];
  else if (parts[0] === 'cd' || parts[0] === 'ls') pool = SECTIONS;
  else if (parts[0] === 'cat') pool = [...CASE_SLUGS, 'readme', 'quotes', 'resources'];
  else if (parts[0] === 'open') pool = [...Object.keys(EXTERNAL), ...GAMES, 'email'];
  else if (parts[0] === 'theme') pool = ['day', 'night'];
  else if (parts[0] === 'sudo') pool = ['hire robert'];
  else return false;
  const word = parts.length === 1 ? parts[0] : parts.slice(1).join(' ');
  if (!word && parts.length === 1) return false;
  const hits = [...new Set(pool)].filter((p) => p.startsWith(word));
  const head = parts.length === 1 ? '' : `${parts[0]} `;
  if (hits.length === 1) {
    const next = `${head}${hits[0]} `;
    if (next === input.value) return false;
    input.value = next;
    return true;
  }
  if (!hits.length) return false;
  let pre = hits[0];
  hits.forEach((h) => { while (!h.startsWith(pre)) pre = pre.slice(0, -1); });
  if (pre.length > word.length) { input.value = head + pre; return true; }
  return false;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input) return;
  const v = input.value;
  input.value = '';
  typingRun++;
  run(v);
});

if (input) {
  input.addEventListener('input', () => { typingRun++; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (hist.length) {
        e.preventDefault();
        histIdx = Math.max(0, Math.min(hist.length, histIdx + (e.key === 'ArrowUp' ? -1 : 1)));
        input.value = hist[histIdx] || '';
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
      }
    } else if (e.key === 'Tab' && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
      if (complete()) e.preventDefault();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (out?.classList.contains('is-open')) closeOutput();
      else if (input.value) input.value = '';
      else if (root.classList.contains('prompt-open')) setPromptOpen(false, true);
      else input.blur();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      closeOutput();
    }
    // Game pages listen for keys on the whole document; keep typing in the prompt to the prompt.
    e.stopPropagation();
  });
  input.addEventListener('keyup', (e) => e.stopPropagation());
  input.addEventListener('keypress', (e) => e.stopPropagation());
}

/* phone: the >_ button opens the prompt as its own row */
function setPromptOpen(open: boolean, returnFocus = false) {
  root.classList.toggle('prompt-open', open);
  termToggle?.setAttribute('aria-expanded', String(open));
  if (open) input?.focus({ preventScroll: true });
  else if (returnFocus) termToggle?.focus({ preventScroll: true });
}
termToggle?.addEventListener('click', () => setPromptOpen(!root.classList.contains('prompt-open')));
narrow.addEventListener('change', () => setPromptOpen(false));

/* clicks on command chips in the output */
document.addEventListener('click', (e) => {
  const target = e.target as Element;
  const c = target.closest<HTMLElement>('[data-cmd]');
  if (c) {
    e.preventDefault();
    typeThenRun(c.dataset.cmd || '');
    return;
  }
  if (target.closest('[data-copy-email]')) {
    e.preventDefault();
    copyEmail();
  }
});

/* keys anywhere: Esc closes the output; with nothing focused, typing starts a command */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && out?.classList.contains('is-open')) {
    closeOutput();
    return;
  }
  if (onGamePage || e.metaKey || e.ctrlKey || e.altKey || e.isComposing || e.defaultPrevented) return;
  const active = document.activeElement;
  if (active && active !== document.body && active !== main) return;
  if (!input || !isPromptVisible()) return;
  if (e.key === '/') {
    e.preventDefault();
    input.focus({ preventScroll: true });
  } else if (e.key.length === 1 && /[a-z?]/i.test(e.key)) {
    e.preventDefault();
    input.focus({ preventScroll: true });
    input.value += e.key;
  }
});

/* no-JS fallbacks hide these until now */
document.querySelectorAll<HTMLElement>('[data-js-only]').forEach((n) => { n.hidden = false; });

console.log("%chey, you're curious. i like that.", 'color:#c4a7e7');
console.log(EMAIL);

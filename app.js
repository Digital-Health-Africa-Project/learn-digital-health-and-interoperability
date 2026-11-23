'use strict';

const $ = id => document.getElementById(id);
const topics = new Map([...document.querySelectorAll('#topic-nav a')].map(a => [a.hash.slice(1), a.textContent]));
topics.set('communities', 'Communities and discussion forums');
const icons = { Course: '▤', Lecture: '▶', Guide: '▣', Publication: '▧', Article: '¶', Exam: '✓', Community: '◇' };
const fields = ['topic', 'type', 'cost', 'certificate', 'level', 'resource-language', 'time', 'sort'];
const defaults = { q: '', topic: '', type: '', cost: '', certificate: '', level: '', 'resource-language': '', time: '', sort: 'beginner' };
const quickFields = { Beginner: 'level', Free: 'cost', yes: 'certificate', Course: 'type' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let resources = [];
let french = readStorage('health-hub-language', 'en') === 'fr';
const translate = (en, fr) => french ? fr : en;

function updateLanguage() {
  $('language-toggle').textContent = translate('Français', 'English');
  $('language-toggle').lang = translate('fr', 'en');
}
updateLanguage();
$('language-toggle').addEventListener('click', () => {
  french = !french;
  store('health-hub-language', french ? 'fr' : 'en');
  updateLanguage();
  render();
});

function resourceLanguages(item) {
  return ['English', 'French', 'Spanish', 'Portuguese', 'Arabic']
    .filter(language => item.languages.some(label => label.includes(language)));
}

let state = { ...defaults };
let noticeTimer;
let selectedSection = '';
let saved = readStorage('health-hub-path', {});
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const animations = typeof IntersectionObserver === 'function' && new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    if (!reduced.matches) entry.target.classList.add('enter');
    animations.unobserve(entry.target);
  }
}, { threshold: .12 });

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { notify('Browser storage is unavailable. Changes last until you close this page.'); }
}

function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}

function control(text, action, cls) {
  const button = el('button', text, cls);
  button.type = 'button';
  button.addEventListener('click', action);
  return button;
}

function external(text, url, cls) {
  const link = el('a', text, cls);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', text + ' (opens in a new tab)');
  return link;
}

function notify(message) {
  $('notice').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('notice').textContent = ''; }, 4500);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify('Copied to clipboard.');
  } catch {
    const field = el('textarea');
    field.value = text;
    field.setAttribute('aria-label', 'Text to copy');
    const dialog = el('dialog');
    dialog.append(el('p', 'Copy the selected text.'), field, control('Close', () => dialog.close()));
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
    field.select();
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme').setAttribute('aria-pressed', String(theme === 'dark'));
}
setTheme(readStorage('health-hub-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('theme').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  store('health-hub-theme', theme);
});

function setOptions(id, label, pairs) {
  $(id).replaceChildren(new Option(label, ''), ...pairs.map(([value, name]) => new Option(name, value)));
}

function loadHash() {
  const hash = location.hash.slice(1);
  if (!hash.startsWith('view?')) {
    if (topics.has(hash)) resetAndShow(hash);
    else if (!hash) apply(defaults, false);
    return;
  }
  const params = new URLSearchParams(hash.slice(5));
  const values = { ...defaults, q: params.get('q') || '' };
  for (const field of fields) {
    const value = params.get(field);
    if ([...$(field).options].some(option => option.value === value)) values[field] = value;
  }
  apply(values, false);
  const target = params.get('resource');
  if (target) {
    requestAnimationFrame(() => $(target)?.scrollIntoView());
  } else {
    $('directory').scrollIntoView();
  }
}

function apply(values, sync = true) {
  state = { ...defaults, ...values };
  $('search').value = state.q;
  for (const field of fields) $(field).value = state[field];
  for (const button of $('chips').querySelectorAll('button')) {
    const value = button.dataset.quick;
    button.setAttribute('aria-pressed', String(state[quickFields[value]] === value));
  }
  if (sync) {
    const params = new URLSearchParams(Object.entries(state).filter(([key, value]) => value !== defaults[key]));
    history.replaceState(null, '', params.size ? '#view?' + params : location.pathname + location.search);
  }
  render();
}

function resetAndShow(topic) {
  apply(defaults, false);
  if (topic) requestAnimationFrame(() => $(topic)?.scrollIntoView());
}

function appendHighlighted(node, text, words) {
  if (!words.length) {
    node.textContent = text;
    return;
  }
  const escaped = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp('(' + escaped.join('|') + ')', 'gi');
  text.split(pattern).forEach((part, i) => node.append(i % 2 ? el('mark', part) : document.createTextNode(part)));
}

function scoreOrder(item, sort) {
  const price = item.cost === 'Free' ? (item.certificate ? 0 : 1) : item.cost === 'Paid' ? 3 : 2;
  const level = ['Beginner', 'All levels', 'Intermediate'].indexOf(item.level);
  return sort === 'free' ? price * 3 + level : level * 4 + price;
}

function ordering(a, b) {
  if (state.sort === 'provider') return a.provider.localeCompare(b.provider) || a.title.localeCompare(b.title);
  if (state.sort === 'title') return a.title.localeCompare(b.title);
  const influence = scoreOrder(a, state.sort) - scoreOrder(b, state.sort);
  return influence || Number(b.tags.includes('Start here')) - Number(a.tags.includes('Start here')) ||
    (state.sort === 'free' ? a.title.localeCompare(b.title) : 0);
}

function card(item, words) {
  const node = el('li', '', 'card');
  node.id = item.id;
  const badges = el('div', '', 'badges');
  if (item.tags.includes('Start here')) badges.append(el('span', 'Start here', 'badge ribbon'));
  const provider = el('span', '', 'badge');
  appendHighlighted(provider, item.provider, words);
  badges.append(provider, el('span', icons[item.type] + ' ' + item.type, 'badge'));
  const title = el('h3');
  appendHighlighted(title, item.title, words);
  const description = el('p');
  description.lang = translate('en', 'fr');
  appendHighlighted(description, translate(item.description, item.descriptionFr || item.description), words);
  const facts = el('div', '', 'badges');
  for (const label of [item.level, item.cost, ...(item.certificate ? ['Certificate available'] : []), ...item.languages]) {
    facts.append(el('span', label, 'badge'));
  }
  const matchedTags = item.tags.filter(tag => words.some(word => tag.toLowerCase().includes(word)));
  for (const tag of matchedTags) {
    const badge = el('span', '', 'badge');
    appendHighlighted(badge, tag, words);
    facts.append(badge);
  }
  const actions = el('div', '', 'actions');
  if (item.url === '#') actions.append(el('span', 'Link coming soon'));
  else actions.append(external('Open resource', item.url, 'button'));
  const saveButton = control('', () => toggleBookmark(item), 'secondary');
  renderSaveButton(saveButton, item);
  actions.append(saveButton);
  const copyButton = control('Copy link', () => {
    const url = new URL(location.href);
    url.hash = 'view?' + new URLSearchParams({ resource: item.id });
    copy(url.href);
  }, 'secondary');
  copyButton.setAttribute('aria-label', 'Copy link to ' + item.title);
  actions.append(copyButton);
  node.append(badges, title, description, facts, el('p', item.duration + ' · ' + item.fee, 'duration'));
  const verification = [
    translate('Link checked', 'Lien vérifié') + ' ' + (item.linkVerifiedOn || translate('no date recorded', 'date non renseignée')),
    translate('Certificate checked', 'Attestation vérifiée') + ' ' + (item.certificateVerifiedOn || translate('no date recorded', 'date non renseignée'))
  ];
  const dates = el('p', verification.join(' · '), 'verification');
  dates.lang = translate('en', 'fr');
  node.append(dates, actions);
  animations && animations.observe(node);
  return node;
}

function render() {
  const words = state.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = resources.filter(item => {
    const text = [item.title, item.provider, item.description, item.descriptionFr, ...item.tags].join(' ').toLowerCase();
    return words.every(word => text.includes(word)) &&
      (!state.topic || state.topic === item.topic) &&
      (!state.type || (state.type === 'PDF' ? item.tags.includes('PDF') || /\.pdf\b/i.test(item.url) : state.type === item.type)) &&
      (!state.cost || state.cost === item.cost) &&
      (!state.level || state.level === item.level) &&
      (!state['resource-language'] || resourceLanguages(item).includes(state['resource-language'])) &&
      (!state.time || state.time === item.timeCommitment) &&
      (!state.certificate || item.certificate === (state.certificate === 'yes'));
  });
  const result = $('results');
  animations && animations.disconnect();
  result.replaceChildren();
  $('count').textContent = 'Showing ' + visible.length + ' of ' + resources.length + ' resources';
  if (!visible.length) result.append(el('p', 'No resources match. Try a different keyword or clear the filters.'));
  for (const [id, title] of topics) {
    const group = visible.filter(item => item.topic === id).sort(ordering);
    if (!group.length) continue;
    const section = el('section');
    section.id = id;
    const list = el('ul', '', 'cards');
    list.append(...group.map(item => card(item, words)));
    section.append(el('h3', title), list);
    result.append(section);
  }
  updateActive();
}

function renderSaveButton(button, item) {
  const has = Object.hasOwn(saved, item.id);
  button.textContent = has ? 'Saved' : 'Save';
  button.setAttribute('aria-pressed', String(has));
  button.setAttribute('aria-label', (has ? 'Remove bookmark for ' : 'Bookmark ') + item.title);
  button.dataset.bookmark = item.id;
}

function toggleBookmark(item) {
  if (Object.hasOwn(saved, item.id)) delete saved[item.id];
  else saved[item.id] = false;
  store('health-hub-path', saved);
  for (const button of document.querySelectorAll('[data-bookmark]')) {
    if (button.dataset.bookmark === item.id) renderSaveButton(button, item);
  }
  renderPath();
}

function pathItems() {
  const byId = new Map(resources.map(item => [item.id, item]));
  return Object.keys(saved).map(id => byId.get(id)).filter(Boolean);
}

function updateProgress(items) {
  const done = items.filter(item => saved[item.id]).length;
  $('progress').max = items.length || 1;
  $('progress').value = done;
  $('progress-text').textContent = done + ' of ' + items.length + ' completed';
}

function renderPath() {
  const items = pathItems();
  updateProgress(items);
  $('copy-path').disabled = $('print-path').disabled = $('export-path').disabled = !items.length;
  $('saved-list').replaceChildren();
  if (!items.length) $('saved-list').append(el('li', 'No saved resources yet.'));
  for (const item of items) {
    const row = el('li');
    const choice = el('input');
    choice.type = 'checkbox';
    choice.checked = Boolean(saved[item.id]);
    choice.setAttribute('aria-label', 'Completed: ' + item.title);
    choice.addEventListener('change', () => {
      saved[item.id] = choice.checked;
      store('health-hub-path', saved);
      updateProgress(items);
    });
    const label = el('label');
    label.append(choice, document.createTextNode('Complete'));
    const remove = control('Remove', () => {
      toggleBookmark(item);
      ($('saved-list').querySelector('button') || $('learning-path')).focus();
    }, 'secondary');
    remove.setAttribute('aria-label', 'Remove ' + item.title + ' from learning path');
    row.append(label, item.url === '#' ? el('span', item.title) : external(item.title, item.url), remove);
    $('saved-list').append(row);
  }
}

$('copy-path').addEventListener('click', () => copy(pathItems().map(item =>
  (saved[item.id] ? '[x] ' : '[ ] ') + item.title + (item.url === '#' ? '' : ' | ' + item.url)
).join('\n')));
$('export-path').addEventListener('click', () => {
  const entries = pathItems().map(item => ({ id: item.id, completed: saved[item.id] === true }));
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, entries }, null, 2)], { type: 'application/json' }));
  const link = el('a');
  link.href = url;
  link.download = 'health-learning-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('import-path').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    if (file.size > 1000000) throw new Error('File too large');
    const data = JSON.parse(await file.text());
    if (data.version !== 1 || !Array.isArray(data.entries) ||
      !data.entries.every(entry => entry && typeof entry.id === 'string' && typeof entry.completed === 'boolean')) {
      throw new Error('Unsupported file');
    }
    const ids = new Set(resources.map(item => item.id));
    const valid = data.entries.filter(entry => ids.has(entry.id));
    for (const { id, completed } of valid) saved[id] = saved[id] === true || completed;
    store('health-hub-path', saved);
    render();
    renderPath();
    notify('Imported ' + new Set(valid.map(entry => entry.id)).size + ' saved resources.');
  } catch {
    notify('Choose a valid learning progress JSON file exported from this hub.');
  }
});
$('print-path').addEventListener('click', () => {
  document.body.classList.add('print-path');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('print-path'));

$('quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  const role = $('role').value;
  const beginner = $('experience').value === 'Beginner';
  const region = $('focus').value;
  const roleTopics = {
    learner: ['start-here', 'health-data-standards', 'architecture-and-implementation'],
    implementer: ['architecture-and-implementation', 'health-data-standards', 'start-here'],
    policy: ['laws-and-regulations', 'health-data-spaces', 'architecture-and-implementation']
  };
  const relevant = resources.filter(item => item.type !== 'Community' && item.type !== 'Exam');
  const picks = [];
  function choose(test) {
    const item = relevant.filter(item => test(item) && !picks.includes(item)).sort((a, b) => {
      function rank(resource) {
        return (resource.level === (beginner ? 'Beginner' : 'Intermediate') ? 4 : 0) +
          (region !== 'Global' && resource.tags.includes(region) ? 3 : 0) +
          (resource.cost === 'Free' ? 1 : 0);
      }
      return rank(b) - rank(a);
    })[0];
    if (item) picks.push(item);
  }
  if (beginner) choose(item => item.tags.includes('Start here'));
  for (const topic of roleTopics[role]) choose(item => item.topic === topic && !item.tags.includes('Start here'));
  choose(item => item.topic === 'health-data-spaces' && (region === 'Global' || item.tags.includes(region)));
  choose(item => (region === 'Global' || item.tags.includes(region)) && !item.tags.includes('Start here'));
  while (picks.length < 6 && picks.length < relevant.length) choose(() => true);
  $('recommendations').replaceChildren(...picks.slice(0, 6).map(item => {
    const row = el('li');
    const bookmark = control('', () => toggleBookmark(item), 'secondary');
    renderSaveButton(bookmark, item);
    row.append(item.url === '#' ? el('span', item.title) : external(item.title, item.url), document.createTextNode(' '), bookmark);
    return row;
  }));
  $('quiz-status').textContent = 'Your suggested learning order';
});

function makeMap() {
  const ns = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) {
    const node = document.createElementNS(ns, tag);
    for (const [attr, value] of Object.entries(attrs)) node.setAttribute(attr, value);
    if (text) node.textContent = text;
    return node;
  }
  const groups = [
    { title: 'Standards', nodes: ['FHIR', 'LOINC', 'SNOMED CT', 'ICD-11'] },
    { title: 'Architectures', nodes: ['OpenHIE', 'DHIS2'] },
    { title: 'Governance', nodes: ['AU frameworks', 'GDPR', 'EHDS'] }
  ];
  const connectors = ['Data flows into connected systems', 'Governance shapes access and reuse'];
  groups.forEach(({ title, nodes }, index) => {
    const diagram = svg('svg', { viewBox: '0 0 310 118', role: 'group', 'aria-label': title });
    diagram.append(svg('text', { x: 8, y: 18, fill: 'currentColor' }, title));
    nodes.forEach((name, i) => {
      const x = 8 + (i % 2) * 150;
      const y = 30 + Math.floor(i / 2) * 43;
      const node = svg('a', { class: 'map-node', href: '#view?' + new URLSearchParams({ q: name }), 'aria-label': 'Filter by ' + name });
      node.append(svg('rect', { x, y, width: 140, height: 35, rx: 5 }),
        svg('text', { x: x + 70, y: y + 22, 'text-anchor': 'middle' }, name));
      node.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        apply({ ...defaults, q: name });
        $('directory-title').focus({ preventScroll: true });
        $('directory').scrollIntoView();
      });
      diagram.append(node);
    });
    $('map-diagram').append(diagram);
    if (connectors[index]) {
      const arrow = svg('svg', { class: 'map-connector', viewBox: '0 0 36 28', role: 'img', 'aria-label': connectors[index] });
      arrow.append(svg('path', { class: 'map-edge', d: 'M3 14h28m-8-7 8 7-8 7' }));
      $('map-diagram').append(arrow);
    }
  });
}

function compare(mode) {
  const regions = mode === 'both' ? ['Africa', 'Europe'] : [mode];
  const panels = regions.map(region => {
    const panel = el('div');
    const list = el('ul');
    const picks = resources.filter(item => item.tags.includes(region) &&
      ['laws-and-regulations', 'health-data-spaces'].includes(item.topic)).slice(0, 5);
    for (const item of picks) {
      const li = el('li');
      li.append(item.url === '#' ? el('span', item.title) : external(item.title, item.url));
      list.append(li);
    }
    panel.append(el('h3', region === 'Africa' ? 'African Health Data Space' : 'European Health Data Space'), list);
    return panel;
  });
  $('compare-content').replaceChildren(...panels);
  for (const button of $('compare-controls').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.compare === mode));
  }
}

function updateActive() {
  const threshold = document.querySelector('.topic-shell').offsetHeight + 115;
  let current = '';
  for (const id of topics.keys()) {
    const section = $(id);
    if (section && section.getBoundingClientRect().top <= threshold) current = id;
  }
  if (current === selectedSection) return;
  selectedSection = current;
  for (const anchor of $('topic-nav').querySelectorAll('a')) {
    if (anchor.hash === '#' + current) anchor.setAttribute('aria-current', 'location');
    else anchor.removeAttribute('aria-current');
  }
}

let pendingScroll = false;
window.addEventListener('scroll', () => {
  if (pendingScroll) return;
  pendingScroll = true;
  requestAnimationFrame(() => { updateActive(); pendingScroll = false; });
}, { passive: true });

function initialStats() {
  const values = [resources.length, topics.size - 1, resources.filter(item => item.cost === 'Free').length];
  const nodes = ['total-stat', 'topic-stat', 'free-stat'].map($);
  $('stats').hidden = false;
  const start = performance.now();
  function frame(now) {
    const ratio = reduced.matches ? 1 : Math.min(1, (now - start) / 550);
    nodes.forEach((node, i) => { node.textContent = Math.round(values[i] * ratio); });
    if (ratio < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function connectControls() {
  $('search-form').addEventListener('submit', event => {
    event.preventDefault();
    $('directory').scrollIntoView();
  });
  $('filters').addEventListener('submit', event => event.preventDefault());
  $('search').addEventListener('input', () => apply({ ...state, q: $('search').value }));
  for (const field of fields) $(field).addEventListener('change', () => apply({ ...state, [field]: $(field).value }));
  for (const button of document.querySelectorAll('[data-search]')) {
    button.addEventListener('click', () => {
      apply({ ...defaults, q: button.dataset.search });
      $('directory').scrollIntoView();
    });
  }
  for (const button of $('chips').querySelectorAll('button')) {
    button.addEventListener('click', () => {
      const value = button.dataset.quick;
      const field = quickFields[value];
      apply({ ...state, [field]: state[field] === value ? '' : value });
    });
  }
  for (const button of $('compare-controls').querySelectorAll('button')) {
    button.addEventListener('click', () => compare(button.dataset.compare));
  }
  $('clear').addEventListener('click', () => apply(defaults));
  window.addEventListener('hashchange', loadHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (topics.has(link.hash.slice(1))) resetAndShow(link.hash.slice(1));
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey ||
      event.target.closest('input, textarea, select, [contenteditable], dialog')) return;
    event.preventDefault();
    $('search').focus();
  });
}

async function init() {
  try {
    const response = await fetch('data/resources.json');
    if (!response.ok) throw new Error('Resource file returned ' + response.status);
    resources = await response.json();
    if (!Array.isArray(resources)) throw new Error('Resource file must contain an array.');
    setOptions('topic', 'All topics', [...topics]);
    setOptions('type', 'All types', [['Course', 'Online courses'], ['Lecture', 'Video lectures'], ['PDF', 'PDFs'],
      ['Guide', 'Guides and references'], ['Publication', 'Publications'], ['Article', 'Blogs and articles'],
      ['Exam', 'Certification exams'], ['Community', 'Communities']]);
    setOptions('cost', 'Any cost', ['Free', 'Paid', 'Check provider'].map(value => [value, value]));
    setOptions('level', 'Any level', ['Beginner', 'All levels', 'Intermediate'].map(value => [value, value]));
    setOptions('certificate', 'All resources', [['yes', 'Certificate available'], ['no', 'No confirmed certificate']]);
    const languages = [...new Set(resources.flatMap(resourceLanguages))].sort();
    const times = [...new Set(resources.map(item => item.timeCommitment).filter(Boolean))].sort();
    setOptions('resource-language', 'Any resource language', languages.map(value => [value, value]));
    setOptions('time', 'Any time commitment', times.map(value => [value, value]));
    makeMap();
    compare('both');
    connectControls();
    initialStats();
    apply(defaults, false);
    loadHash();
    renderPath();
  } catch (error) {
    $('count').textContent = 'The resource list could not be loaded. Open the published site or use a local HTTP server.';
    console.error(error);
  }
}
init();

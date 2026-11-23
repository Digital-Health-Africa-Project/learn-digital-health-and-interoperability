'use strict';

const $ = id => document.getElementById(id);
const topics = new Map([...document.querySelectorAll('#topic-nav a')].map(a => [a.hash.slice(1), a.textContent]));
topics.set('communities', 'Communities and discussion forums');
const icons = { Course: '▤', Lecture: '▶', Guide: '▣', Publication: '▧', Article: '¶', Exam: '✓', Community: '◇' };
const fields = ['type', 'cost', 'certificate', 'level', 'resource-language', 'time', 'sort'];
const defaults = { q: '', topic: '', type: '', cost: '', certificate: '', level: '', 'resource-language': '', time: '', sort: 'beginner' };
const quickFields = { Beginner: 'level', Free: 'cost', yes: 'certificate', Course: 'type' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let resources = [];
let french = readStorage('health-hub-language', 'en') === 'fr';
const strings = {
  "Welcome to the learning hub! You'll find curated courses, videos, guides, and reports on health data standards, interoperability architecture, governance, and the African and European Health Data Spaces.": "Bienvenue sur ce portail de formation ! Vous y trouverez une sélection de cours, de vidéos, de guides et de rapports sur les normes relatives aux données de santé, l’architecture d’interopérabilité, la gouvernance et les espaces africain et européen des données de santé.",
  "Use the filters to find resources by topic, format, level, cost, language, time commitment, or certificate availability.": "Utilisez les filtres pour trouver des ressources par thème, format, niveau, coût, langue, durée ou disponibilité d’une attestation.",
  "Browse and filter resources": "Parcourir et filtrer les ressources",

  "Learn Health Data Interoperability and Health Data Spaces": "Découvrir l’interopérabilité et les espaces de données de santé",
  "Find courses, guides and communities on health data interoperability and health data spaces.": "Trouvez des cours, des guides et des communautés sur l’interopérabilité et les espaces de données de santé.",
  "Skip to resources": "Aller aux ressources",
  "GIZ logo": "Logo GIZ",
  "Dark mode": "Mode sombre",
  "Addis workshop · 24 November 2026": "Atelier d’Addis-Abeba · 24 novembre 2026",
  "Explore how health systems exchange, understand and reuse data across organizations and borders.": "Découvrez comment les systèmes de santé échangent, interprètent et réutilisent les données entre organisations et par-delà les frontières.",
  "Search the collection": "Rechercher dans le catalogue",
  "Search resources, providers or tags": "Rechercher une ressource, un organisme ou un mot-clé",
  "Suggested searches": "Suggestions de recherche",
  "Governance": "Gouvernance",
  "Start here": "Commencer ici",
  "Learning topics": "Thèmes d’apprentissage",
  "Start by understanding interoperability": "Comprendre les bases de l’interopérabilité",
  "Health data standards and terminologies": "Normes et terminologies des données de santé",
  "Health data interoperability architectures": "Architectures d’interopérabilité des données de santé",
  "Laws and regulations": "Lois et réglementations",
  "Health data spaces": "Espaces de données de santé",
  "Communities and discussion forums": "Communautés et forums de discussion",
  "resources": "ressources",
  "topics": "thèmes",
  "free": "gratuites",
  "Explore the collection": "Explorer le catalogue",
  "Browse courses, lectures, reports, and practical guides, from the fundamentals to implementation.": "Parcourez les cours, conférences, rapports et guides pratiques, des bases à la mise en œuvre.",
  "Find my path": "Trouver mon parcours",
  "My learning path": "Mon parcours d’apprentissage",
  "Find resources": "Trouver des ressources",
  "Quick filters": "Filtres rapides",
  "Beginner": "Débutant",
  "Free": "Gratuit",
  "Certificate available": "Attestation disponible",
  "Online courses": "Cours en ligne",
  "Topic": "Thème",
  "Resource type": "Type de ressource",
  "Cost": "Coût",
  "Certificate availability": "Disponibilité d’une attestation",
  "Level": "Niveau",
  "Resource language": "Langue de la ressource",
  "Time commitment": "Temps à prévoir",
  "Sort by": "Trier par",
  "Beginner first": "Débutants d’abord",
  "Free first": "Ressources gratuites d’abord",
  "A to Z": "De A à Z",
  "Provider": "Organisme",
  "Clear filters": "Effacer les filtres",
  "Loading resources…": "Chargement des ressources…",
  "Enable JavaScript to search and browse the directory.": "Activez JavaScript pour rechercher et consulter le catalogue.",
  "Save resources as you browse, then mark them complete here. Your progress stays in this browser.": "Enregistrez des ressources en parcourant le catalogue, puis marquez-les ici comme terminées. Vos progrès sont conservés dans ce navigateur.",
  "0 of 0 completed": "0 sur 0 terminées",
  "Learning path completion": "Progression du parcours",
  "Copy text list": "Copier la liste",
  "Print path": "Imprimer le parcours",
  "Export progress": "Exporter mes progrès",
  "Import progress": "Importer mes progrès",
  "Your role": "Votre rôle",
  "Choose a role": "Choisir un rôle",
  "Student or learner": "Étudiant ou apprenant",
  "Health IT implementer": "Spécialiste des systèmes d’information de santé",
  "Policy or program lead": "Responsable de politiques ou de programmes",
  "Your experience": "Votre expérience",
  "Choose a level": "Choisir un niveau",
  "Intermediate": "Intermédiaire",
  "Your focus": "Votre zone d’intérêt",
  "Choose an area": "Choisir une zone",
  "Africa": "Afrique",
  "Europe": "Europe",
  "Global": "Monde",
  "Recommend resources": "Suggérer des ressources",
  "Interoperability map": "Carte de l’interopérabilité",
  "Choose a node to find related resources. Standards define what is exchanged, architectures connect systems, and governance sets rules for access and reuse.": "Sélectionnez un élément pour trouver les ressources associées. Les normes définissent les données échangées, les architectures relient les systèmes et la gouvernance fixe les règles d’accès et de réutilisation.",
  "Compare health data space resources": "Comparer les ressources sur les espaces de données de santé",
  "Comparison layout": "Mode de comparaison",
  "Side by side": "Côte à côte",
  "Keep the conversation going": "Poursuivre la discussion",
  "Join our Digital Health Africa community on Zulip to ask questions, share resources and discuss implementation experiences.": "Rejoignez notre communauté Digital Health Africa sur Zulip pour poser vos questions, partager des ressources et échanger sur vos expériences de mise en œuvre.",
  "Introduce yourself and your work.": "Présentez-vous et parlez de votre travail.",
  "Ask about standards, architecture or governance.": "Posez vos questions sur les normes, l’architecture ou la gouvernance.",
  "Share courses, guides and useful examples.": "Partagez des cours, des guides et des exemples utiles.",
  "Join us on Zulip": "Nous rejoindre sur Zulip",
  "GIZ workshop resource · Addis Ababa · 24 November 2026": "Ressource de l’atelier GIZ · Addis-Abeba · 24 novembre 2026",
  "Back to top ↑": "Retour en haut ↑",
  "More filters": "Plus de filtres",
  "Filter by topic": "Filtrer par thème",
  "All topics": "Tous les thèmes",
  "All types": "Tous les types",
  "Video lectures": "Conférences vidéo",
  "PDFs": "PDF",
  "Guides and references": "Guides et références",
  "Publications": "Publications",
  "Blogs and articles": "Blogs et articles",
  "Certification exams": "Examens de certification",
  "Communities": "Communautés",
  "Any cost": "Tous les coûts",
  "Paid": "Payant",
  "Check provider": "Voir auprès de l’organisme",
  "Any level": "Tous les niveaux",
  "All levels": "Tous niveaux",
  "All resources": "Toutes les ressources",
  "No confirmed certificate": "Aucune attestation confirmée",
  "Any resource language": "Toutes les langues",
  "Any time commitment": "Toutes les durées",
  "English": "Anglais",
  "French": "Français",
  "Spanish": "Espagnol",
  "Portuguese": "Portugais",
  "Arabic": "Arabe",
  "English; most modules also in French": "Anglais ; la plupart des modules sont aussi en français",
  "other EU languages": "autres langues de l’UE",
  "governance": "gouvernance",
  "Self-paced reading": "Lecture à son rythme",
  "Self-paced reference": "Référence à consulter à son rythme",
  "Not listed": "Non indiqué",
  "Full day or longer": "Une journée ou plus",
  "Multi-day schedule": "Sur plusieurs jours",
  "Ongoing": "En continu",
  "About 13 hours (core)": "Environ 13 heures (tronc commun)",
  "18-day email course": "Cours par courriel sur 18 jours",
  "Free access": "Accès gratuit",
  "US$39 (listed fee)": "39 USD (tarif indiqué)",
  "Course": "Cours",
  "Lecture": "Conférence",
  "Guide": "Guide",
  "Publication": "Publication",
  "Article": "Article",
  "Exam": "Examen",
  "Community": "Communauté",
  "Link coming soon": "Lien à venir",
  "Open resource": "Ouvrir la ressource",
  "Copy link": "Copier le lien",
  "No resources match. Try a different keyword or clear the filters.": "Aucune ressource ne correspond. Essayez un autre mot-clé ou effacez les filtres.",
  "Saved": "Enregistrée",
  "Save": "Enregistrer",
  "No saved resources yet.": "Aucune ressource enregistrée pour le moment.",
  "Complete": "Terminée",
  "Remove": "Retirer",
  "Your suggested learning order": "Votre parcours d’apprentissage suggéré",
  "Standards": "Normes",
  "Architectures": "Architectures",
  "AU frameworks": "Cadres de l’Union africaine",
  "GDPR": "RGPD",
  "EHDS": "EEDS",
  "Data flows into connected systems": "Les données circulent entre les systèmes connectés",
  "Governance shapes access and reuse": "La gouvernance encadre l’accès et la réutilisation",
  "African Health Data Space": "Espace africain des données de santé",
  "European Health Data Space": "Espace européen des données de santé",
  "Browser storage is unavailable. Changes last until you close this page.": "Le stockage du navigateur est indisponible. Les modifications seront perdues à la fermeture de cette page.",
  "Copied to clipboard.": "Copié dans le presse-papiers.",
  "Text to copy": "Texte à copier",
  "Copy the selected text.": "Copiez le texte sélectionné.",
  "Close": "Fermer",
  "Choose a valid learning progress JSON file exported from this hub.": "Sélectionnez un fichier JSON de progression exporté depuis ce portail.",
  "The resource list could not be loaded. Open the published site or use a local HTTP server.": "Impossible de charger le catalogue. Ouvrez le site publié ou utilisez un serveur HTTP local.",
  "Switch the website language": "Changer la langue du site",
  "Light mode": "Mode clair",
  " (opens in a new tab)": " (s’ouvre dans un nouvel onglet)",
  "Copy link to ": "Copier le lien vers ",
  "Remove bookmark for ": "Retirer le favori pour ",
  "Bookmark ": "Ajouter aux favoris : ",
  "Completed: ": "Terminée : ",
  "Remove from learning path: ": "Retirer du parcours : ",
  "Filter by ": "Filtrer par : "
};
const t = text => french ? (strings[text] ?? text) : text;
const translate = (en, fr) => french ? fr : en;

const staticText = [];
const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    return node.parentElement.closest('script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  }
});
while (walker.nextNode()) {
  const node = walker.currentNode;
  const key = node.nodeValue.trim();
  if (Object.hasOwn(strings, key)) staticText.push([node, node.nodeValue, key]);
}
const staticAttributes = [...document.querySelectorAll('[aria-label], [placeholder], meta[name="description"]')]
  .flatMap(node => ['aria-label', 'placeholder', 'content'].filter(attr => node.hasAttribute(attr))
    .map(attr => [node, attr, node.getAttribute(attr)]));

function updateLanguage() {
  document.documentElement.lang = french ? 'fr' : 'en';
  for (const [node, original, key] of staticText) node.nodeValue = original.replace(key, t(key));
  for (const [node, attr, value] of staticAttributes) node.setAttribute(attr, t(value));
  $('language-toggle').textContent = translate('Français', 'English');
  $('language-toggle').lang = translate('fr', 'en');
  setTheme(document.documentElement.dataset.theme);
}

$('language-toggle').addEventListener('click', () => {
  french = !french;
  store('health-hub-language', french ? 'fr' : 'en');
  updateLanguage();
  if (!resources.length) {
    $('count').textContent = t(loadError || 'Loading resources…');
    return;
  }
  setupOptions();
  renderTopicFilters();
  apply(state, false);
  renderPath();
  $('map-diagram').replaceChildren();
  makeMap();
  compare($('compare-controls').querySelector('[aria-pressed="true"]').dataset.compare);
  if ($('recommendations').children.length) $('quiz-form').requestSubmit();
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
  if (text) node.textContent = t(text);
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
  link.setAttribute('aria-label', t(text) + t(' (opens in a new tab)'));
  return link;
}

function notify(message) {
  $('notice').textContent = t(message);
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
    field.setAttribute('aria-label', t('Text to copy'));
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
  $('theme').textContent = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
  $('theme').setAttribute('aria-pressed', String(theme === 'dark'));
}
setTheme(readStorage('health-hub-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('theme').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  store('health-hub-theme', theme);
});

function setOptions(id, label, pairs) {
  $(id).replaceChildren(new Option(t(label), ''), ...pairs.map(([value, name]) => new Option(t(name), value)));
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
  if (topics.has(params.get('topic'))) values.topic = params.get('topic');
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
  for (const button of $('topic-chips').children) {
    button.setAttribute('aria-pressed', String(button.dataset.topic === state.topic));
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
    node.textContent = t(text);
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
  badges.append(provider, el('span', icons[item.type] + ' ' + t(item.type), 'badge'));
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
    appendHighlighted(badge, t(tag), words);
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
  copyButton.setAttribute('aria-label', t('Copy link to ') + item.title);
  actions.append(copyButton);
  node.append(badges, title, description, facts, el('p', t(item.duration) + ' · ' + t(item.fee), 'duration'));
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
    const text = [item.title, item.provider, item.description, item.descriptionFr, ...item.tags, ...item.tags.map(t)].join(' ').toLowerCase();
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
  $('count').textContent = translate(`Showing ${visible.length} of ${resources.length} resources`, `${visible.length} ressources affichées sur ${resources.length}`);
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
  button.textContent = t(has ? 'Saved' : 'Save');
  button.setAttribute('aria-pressed', String(has));
  button.setAttribute('aria-label', t(has ? 'Remove bookmark for ' : 'Bookmark ') + item.title);
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
  $('progress-text').textContent = translate(`${done} of ${items.length} completed`, `${done} sur ${items.length} terminées`);
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
    choice.setAttribute('aria-label', t('Completed: ') + item.title);
    choice.addEventListener('change', () => {
      saved[item.id] = choice.checked;
      store('health-hub-path', saved);
      updateProgress(items);
    });
    const label = el('label');
    label.append(choice, document.createTextNode(t('Complete')));
    const remove = control('Remove', () => {
      toggleBookmark(item);
      ($('saved-list').querySelector('button') || $('learning-path')).focus();
    }, 'secondary');
    remove.setAttribute('aria-label', t('Remove from learning path: ') + item.title);
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
    const count = new Set(valid.map(entry => entry.id)).size;
    notify(translate(`Imported ${count} saved resources.`, `${count} ressources importées.`));
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
  $('quiz-status').textContent = t('Your suggested learning order');
});

function makeMap() {
  const ns = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) {
    const node = document.createElementNS(ns, tag);
    for (const [attr, value] of Object.entries(attrs)) node.setAttribute(attr, value);
    if (text) node.textContent = t(text);
    return node;
  }
  const groups = [
    { title: 'Standards', nodes: ['FHIR', 'LOINC', 'SNOMED CT', 'ICD-11'] },
    { title: 'Architectures', nodes: ['OpenHIE', 'DHIS2'] },
    { title: 'Governance', nodes: ['AU frameworks', 'GDPR', 'EHDS'] }
  ];
  const connectors = ['Data flows into connected systems', 'Governance shapes access and reuse'];
  groups.forEach(({ title, nodes }, index) => {
    const diagram = svg('svg', { viewBox: '0 0 310 118', role: 'group', 'aria-label': t(title) });
    diagram.append(svg('text', { x: 8, y: 18, fill: 'currentColor' }, title));
    nodes.forEach((name, i) => {
      const x = 8 + (i % 2) * 150;
      const y = 30 + Math.floor(i / 2) * 43;
      const node = svg('a', { class: 'map-node', href: '#view?' + new URLSearchParams({ q: name }), 'aria-label': t('Filter by ') + t(name) });
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
      const arrow = svg('svg', { class: 'map-connector', viewBox: '0 0 36 28', role: 'img', 'aria-label': t(connectors[index]) });
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
  $('filters').addEventListener('submit', event => event.preventDefault());
  $('search').addEventListener('input', () => apply({ ...state, q: $('search').value }));
  for (const field of fields) $(field).addEventListener('change', () => apply({ ...state, [field]: $(field).value }));
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

function setupOptions() {
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
  for (const option of $('sort').options) {
    const labels = { beginner: 'Beginner first', free: 'Free first', title: 'A to Z', provider: 'Provider' };
    option.textContent = t(labels[option.value]);
  }
}

function renderTopicFilters() {
  $('topic-chips').replaceChildren(...[['', 'All topics'], ...topics].map(([id, label]) => {
    const button = control(label, () => apply({ ...state, topic: state.topic === id ? '' : id }));
    button.dataset.topic = id;
    return button;
  }));
}

let loadError;
updateLanguage();
async function init() {
  try {
    const response = await fetch('./resources.json');
    if (!response.ok) throw new Error('Resource file returned ' + response.status);
    resources = await response.json();
    if (!Array.isArray(resources)) throw new Error('Resource file must contain an array.');
    setupOptions();
    renderTopicFilters();
    makeMap();
    compare('both');
    connectControls();
    initialStats();
    apply(defaults, false);
    loadHash();
    renderPath();
  } catch (error) {
    loadError = 'The resource list could not be loaded. Open the published site or use a local HTTP server.';
    $('count').textContent = t(loadError);
    console.error(error);
  }
}
init();

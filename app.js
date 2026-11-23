'use strict';

const $ = id => document.getElementById(id);
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current session can still use the site if storage is unavailable.
  }
};

let resources = [];
let french = read('health-hub-language', 'en') === 'fr';
let bookmarks = read('health-hub-path', {});
let comparison = 'both';

const translate = (english, français) => french ? français : english;
const fields = ['type', 'cost', 'certificate', 'level', 'resource-language', 'time', 'sort'];
const topicLabels = {
  'start-here': ['Start by understanding interoperability', 'Comprendre les bases de l’interopérabilité'],
  'health-data-standards': ['Health data standards and terminologies', 'Normes et terminologies des données de santé'],
  'architecture-and-implementation': ['Health data interoperability architectures', 'Architectures d’interopérabilité des données de santé'],
  'laws-and-regulations': ['Laws and regulations', 'Législation et gouvernance'],
  'health-data-spaces': ['Health data spaces', 'Espaces de données de santé'],
  communities: ['Communities and discussion forums', 'Communautés et forums']
};

const labels = {
  'Learn Health Data Interoperability and Health Data Spaces': 'Découvrir l’interopérabilité et les espaces de données de santé',
  'Addis workshop · 24 November 2026': 'Atelier d’Addis-Abeba · 24 novembre 2026',
  "Welcome to the learning hub! You'll find curated courses, videos, guides, and reports on health data standards, interoperability architecture, governance, and the African and European Health Data Spaces.": 'Bienvenue sur ce portail de formation ! Découvrez des cours, des vidéos, des guides et des rapports sur les normes, les architectures, la gouvernance et les espaces africain et européen des données de santé.',
  'Use the filters to find resources by topic, format, level, cost, language, time commitment, or certificate availability.': 'Utilisez les filtres par thème, format, niveau, coût, langue, durée ou disponibilité d’une attestation.',
  'Browse and filter resources': 'Parcourir et filtrer les ressources',
  'Skip to resources': 'Aller aux ressources',
  'Find my path': 'Trouver mon parcours',
  'My learning path': 'Mon parcours',
  'Your role': 'Votre rôle',
  'Choose a role': 'Choisissez un rôle',
  'Student or learner': 'Étudiant ou apprenant',
  'Health IT implementer': 'Spécialiste de la mise en œuvre',
  'Policy or program lead': 'Responsable des politiques ou de programme',
  'Your experience': 'Votre expérience',
  'Choose a level': 'Choisissez un niveau',
  Beginner: 'Débutant',
  Intermediate: 'Intermédiaire',
  Advanced: 'Avancé',
  'All levels': 'Tous niveaux',
  'Recommend resources': 'Recommander des ressources',
  'Save resources as you browse, then mark them complete here. Your progress stays in this browser.': 'Enregistrez les ressources, puis marquez-les comme terminées ici. Votre progression reste dans ce navigateur.',
  'Copy text list': 'Copier la liste',
  'Print path': 'Imprimer le parcours',
  'Export progress': 'Exporter la progression',
  'Import progress': 'Importer la progression',
  'Filter resources': 'Filtrer les ressources',
  Topic: 'Thème',
  'All topics': 'Tous les thèmes',
  'Resource type': 'Type de ressource',
  'All types': 'Tous les types',
  Cost: 'Coût',
  'Any cost': 'Tous les coûts',
  'Certificate availability': 'Disponibilité d’une attestation',
  'All resources': 'Toutes les ressources',
  'Certificate available': 'Attestation disponible',
  'No confirmed certificate': 'Aucune attestation confirmée',
  Level: 'Niveau',
  'Any level': 'Tous les niveaux',
  'Resource language': 'Langue de la ressource',
  'Any resource language': 'Toutes les langues',
  'Time commitment': 'Durée',
  'Any time commitment': 'Toutes les durées',
  'Sort by': 'Trier par',
  'Beginner first': 'Débutants en premier',
  'Free first': 'Gratuit en premier',
  'A to Z': 'De A à Z',
  Provider: 'Organisme',
  'Clear filters': 'Réinitialiser les filtres',
  'Interoperability map': 'Carte de l’interopérabilité',
  'Choose a node to find related resources. Standards define what is exchanged, architectures connect systems, and governance sets rules for access and reuse.': 'Choisissez un terme pour trouver des ressources. Les normes définissent les données échangées, les architectures relient les systèmes et la gouvernance encadre l’accès et la réutilisation.',
  'Compare health data space resources': 'Comparer les ressources sur les espaces de données de santé',
  Africa: 'Afrique',
  Europe: 'Europe',
  'Side by side': 'Côte à côte',
  'Keep the conversation going': 'Poursuivre la discussion',
  'Join our Digital Health Africa community on Zulip to ask questions, share resources and discuss implementation experiences.': 'Rejoignez la communauté Digital Health Africa sur Zulip pour poser vos questions, partager des ressources et discuter de vos expériences.',
  'Introduce yourself and your work.': 'Présentez-vous et présentez votre travail.',
  'Ask about standards, architecture or governance.': 'Posez vos questions sur les normes, les architectures ou la gouvernance.',
  'Share courses, guides and useful examples.': 'Partagez des cours, des guides et des exemples utiles.',
  'Join us on Zulip': 'Rejoignez-nous sur Zulip',
  'GIZ workshop resource · Addis Ababa · 24 November 2026': 'Ressource de l’atelier GIZ · Addis-Abeba · 24 novembre 2026',
  'Back to top ↑': 'Retour en haut ↑',
  resources: 'ressources',
  topics: 'thèmes',
  free: 'gratuites',
  Free: 'Gratuit',
  Paid: 'Payant',
  'Check provider': 'Vérifier auprès de l’organisme',
  'Free access': 'Accès gratuit',
  'Not listed': 'Non indiqué',
  English: 'Anglais',
  French: 'Français',
  Spanish: 'Espagnol',
  Portuguese: 'Portugais',
  Arabic: 'Arabe',
  Course: 'Cours',
  Lecture: 'Vidéo',
  Guide: 'Guide',
  Publication: 'Publication',
  Article: 'Article',
  Exam: 'Examen',
  Community: 'Communauté',
  Save: 'Enregistrer',
  Saved: 'Enregistré',
  'Open resource': 'Ouvrir la ressource',
  'Copy link': 'Copier le lien'
};

const t = text => french ? labels[text] || text : text;
const topicName = id => topicLabels[id] ? translate(...topicLabels[id]) : id;

const standards = 'health-data-standards';
const governance = 'laws-and-regulations';
const spaces = 'health-data-spaces';
const check = 'Check provider';

const additions = [
  ['medblocks-fhir-fundamentals', 'Medblocks FHIR® Fundamentals', 'Medblocks', standards, 'Course',
    'https://medblocks.com/training/courses/fhir-fundamentals', 'Free', 'Beginner'],
  ['ahds-cross-border-prototype', 'Africa Health Data Space: Description of a Cross-Border Prototype', 'Kievit, Wanjiku, van Reisen et al.', spaces, 'Publication',
    'https://www.researchgate.net/publication/417064846_Africa_Health_Data_Space_Description_of_a_Cross-Border_Prototype', check],
  ['patient-data-autonomy-africa', 'Promotion of data autonomy to support insights from patient health data records in Africa', 'Purnama Jati, van Reisen et al.', spaces, 'Publication',
    'https://www.researchgate.net/publication/416516395_Promotion_of_data_autonomy_to_support_insights_from_patient_health_data_records_in_Africa', check],
  ['fair-data-spaces-trust-training', 'Training for trust building of FAIR data spaces: The Humanitarian Data Space on Sensitive Data', 'Kievit, Stocker, van Reisen et al.', spaces, 'Publication',
    'https://www.researchgate.net/publication/417064962_Training_for_trust_building_of_FAIR_data_spaces_The_Humanitarian_Data_Space_on_Sensitive_Data', check],
  ['mirjam-van-reisen-publications', 'Professor Mirjam van Reisen: Publications', 'Tilburg University Research Portal', spaces, 'Guide',
    'https://research.tilburguniversity.edu/en/persons/mirjam-van-reisen/'],
  ['fair-health-infrastructure-africa', 'Design of a FAIR digital data health infrastructure in Africa', 'van Reisen et al.', spaces, 'Publication',
    'https://doi.org/10.1002/ggn2.10050'],
  ['ehds-state-of-play-webinar', 'EHDS webinar 0.1: State of play and supporting initiatives', 'European Commission', spaces, 'Lecture',
    'https://events.teams.microsoft.com/event/619b1193-71cf-4bad-b7ed-d0151240686c@b853f977-4183-428f-855c-ffe7328b6f13?source=copyLinkOneEventsShareDialog', check],
  ['afcfta-digital-trade', 'AfCFTA Protocol on Digital Trade', 'African Union', governance, 'Publication',
    'https://www.au.int/en/treaties/protocol-agreement-establishing-african-continental-free-trade-area-digital-trade'],
  ['afcfta-digital-trade-annexes', 'AfCFTA Digital Trade Protocol: Compiled Annexes', 'African Union', governance, 'Publication',
    'https://www.au.int/sites/default/files/treaties/44963-ax-ENG_Circulation_Digital_Trade_Compiled_Certified_Legal_Instruments_38thAssembly_Feb_2025_27_May2025.pdf'],
  ['igad-health-data-sharing', 'IGAD Regional Health Data Sharing and Protection Policy Framework', 'IGAD', governance, 'Publication',
    'https://igad.int/download/igad-regional-health-data-sharing-and-protection-policy-framework/'],
  ['ecowas-data-protection', 'ECOWAS Supplementary Act on Personal Data Protection', 'ECOWAS', governance, 'Publication',
    'https://www.ecodob.ecowas.int/legal_texts/journal_en/SIGNED_Data_Protection_Act.pdf'],
  ['au-digital-id-interoperability', 'AU Interoperability Framework for Digital ID', 'African Union', governance, 'Publication',
    'https://au.int/sites/default/files/documents/43393-doc-AU_Interoperability_framework_for_D_ID_English.pdf'],
  ['au-digital-transformation-strategy', 'Digital Transformation Strategy for Africa (2020–2030)', 'African Union', governance, 'Publication',
    'https://au.int/sites/default/files/documents/38507-doc-DTS_for_Africa_2020-2030_English.pdf'],
  ['africa-cdc-digital-strategy', 'Africa CDC Digital Transformation Strategy', 'Africa CDC', governance, 'Publication',
    'https://africacdc.org/download/digital-transformation-strategy/'],
  ['africa-data-protection-map', 'Mapping Data Protection Laws Across Africa', 'CIPIT, Strathmore University', governance, 'Guide',
    'https://cipit.strathmore.edu/ai_dashboard/data-governance-across-africa-mapping-of-data-protection-laws/'],
  ['unctad-cyberlaw-tracker', 'Global Cyberlaw Tracker: Data Protection and Privacy', 'UN Trade and Development', governance, 'Guide',
    'https://unctad.org/topic/ecommerce-and-digital-economy/ecommerce-law-reform/summary-adoption-e-commerce-legislation-worldwide'],
  ['ahds-project-website', 'Africa Health Data Space: Project Website', 'VODAN-Africa / Africa University Network', spaces, 'Guide',
    'https://aun.mu.edu.et/ahds/about/'],
  ['interopen-terminology-learnathon', 'Terminology Server: The Learnathon', 'INTEROPen', standards, 'Lecture',
    'https://www.youtube.com/watch?v=EBXtmTshNJ4', 'Free', 'Intermediate'],
  ['nhs-fhir-terminology-exercises', 'Use FHIR Terminology Service APIs', 'NHS England', standards, 'Guide',
    'https://digital.nhs.uk/services/terminology-server/how-to-use-the-terminology-server/use-fhir-terminology-service-apis',
    'Free', 'Intermediate']
];

function mergeCatalogue(base) {
  const catalogue = new Map(base.map(item => [item.id, item]));

  for (const [id, title, provider, topic, type, url, cost = 'Free', level = 'All levels'] of additions) {
    if (catalogue.has(id)) continue;

    catalogue.set(id, {
      id, title, provider, topic, type, url, cost, level,
      certificate: false,
      fee: cost === 'Free' ? 'Free access' : check,
      duration: 'Not listed',
      timeCommitment: 'Not listed',
      languages: ['English'],
      tags: title.split(/[\s:]+/).filter(word => word.length > 3)
    });
  }

  return [...catalogue.values()];
}

function el(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function external(text, url, className = '') {
  const link = el('a', text, className);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function button(text, action, className = 'secondary') {
  const node = el('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function notice(message) {
  $('notice').textContent = message;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    notice(translate('Copied.', 'Copié.'));
  } catch {
    notice(translate('The browser could not copy the text.', 'Le navigateur n’a pas pu copier le texte.'));
  }
}

const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    return node.parentElement.closest('script, style')
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT;
  }
});
const staticText = [];
while (walker.nextNode()) {
  const node = walker.currentNode;
  const key = node.nodeValue.trim();
  if (Object.hasOwn(labels, key)) staticText.push([node, node.nodeValue, key]);
}

function setLanguage() {
  for (const [node, original, key] of staticText) {
    node.nodeValue = original.replace(key, t(key));
  }

  document.title = t('Learn Health Data Interoperability and Health Data Spaces');
  document.documentElement.lang = translate('en', 'fr');
  $('language-toggle').textContent = translate('Français', 'English');
  $('language-toggle').lang = translate('fr', 'en');

  [...$('topic-nav').querySelectorAll('a')].forEach((link, index) => {
    const roman = ['I', 'II', 'III', 'IV', 'V'][index];
    link.textContent = `${roman}. ${topicName(link.hash.slice(1))}`;
  });

  setTheme(document.documentElement.dataset.theme === 'dark');
}

function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('theme').setAttribute('aria-pressed', String(dark));
  $('theme').textContent = dark
    ? translate('Light mode', 'Mode clair')
    : translate('Dark mode', 'Mode sombre');
}

const defaults = {
  q: '', topic: '', type: '', cost: '', certificate: '',
  level: '', 'resource-language': '', time: '', sort: 'beginner'
};
let state = { ...defaults };

function catalogueLanguages(item) {
  return Array.isArray(item.languages) ? item.languages : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function setOptions(id, first, values) {
  $(id).replaceChildren(new Option(t(first), ''), ...values.map(value => new Option(t(value), value)));
  $(id).value = state[id];
}

function setupOptions() {
  setOptions('type', 'All types', unique(resources.map(item => item.type)));
  setOptions('cost', 'Any cost', unique(resources.map(item => item.cost)));
  setOptions('level', 'Any level', unique(resources.map(item => item.level)));
  setOptions('resource-language', 'Any resource language', unique(resources.flatMap(catalogueLanguages)));
  setOptions('time', 'Any time commitment', unique(resources.map(item => item.timeCommitment)));
  $('certificate').replaceChildren(
    new Option(t('All resources'), ''),
    new Option(t('Certificate available'), 'yes'),
    new Option(t('No confirmed certificate'), 'no')
  );

  const sortNames = {
    beginner: 'Beginner first',
    free: 'Free first',
    title: 'A to Z',
    provider: 'Provider'
  };
  for (const option of $('sort').options) option.textContent = t(sortNames[option.value]);

  const topics = ['', ...Object.keys(topicLabels).filter(id => resources.some(item => item.topic === id))];
  $('topic-chips').replaceChildren(...topics.map(id => {
    const chip = button(id ? topicName(id) : t('All topics'), () => {
      apply({ ...state, topic: id });
    });
    chip.dataset.topic = id;
    return chip;
  }));
}

function apply(values, syncHash = true) {
  state = { ...defaults, ...values };
  for (const field of fields) $(field).value = state[field];
  $('search').value = state.q;

  for (const chip of $('topic-chips').children) {
    chip.setAttribute('aria-pressed', String(chip.dataset.topic === state.topic));
  }

  if (syncHash) {
    const params = new URLSearchParams(Object.entries(state).filter(([key, value]) => value !== defaults[key]));
    const url = location.pathname + location.search + (params.size ? '#view?' + params : '#directory');
    history.replaceState(null, '', url);
  }

  renderCatalogue();
}

function loadHash() {
  if (!location.hash.startsWith('#view?')) return;
  const params = new URLSearchParams(location.hash.slice(6));
  const values = {};
  for (const key of Object.keys(defaults)) {
    if (params.has(key)) values[key] = params.get(key);
  }

  const itemId = params.get('resource');
  apply(values, false);
  if (itemId) $(itemId)?.scrollIntoView();
}

function matches(item) {
  const terms = [item.title, item.provider, item.description, item.descriptionFr, ...(item.tags || [])]
    .join(' ').toLowerCase();
  const certificate = item.certificate === true;

  return (!state.q || terms.includes(state.q.toLowerCase())) &&
    (!state.topic || item.topic === state.topic) &&
    (!state.type || item.type === state.type) &&
    (!state.cost || item.cost === state.cost) &&
    (!state.level || item.level === state.level) &&
    (!state.certificate || certificate === (state.certificate === 'yes')) &&
    (!state['resource-language'] || catalogueLanguages(item).includes(state['resource-language'])) &&
    (!state.time || item.timeCommitment === state.time);
}

const utahIds = [
  'interoperability-intro-and-part-1',
  'interoperability-part-2',
  'interoperability-part-3'
];

function compareItems(a, b) {
  const priority = item => {
    const utah = utahIds.indexOf(item.id);
    if (utah !== -1) return utah;
    return item.id === 'medblocks-fhir-fundamentals' ? 3 : 4;
  };
  const titleOrder = a.title.localeCompare(b.title, french ? 'fr' : 'en');
  const featuredOrder = priority(a) - priority(b);
  if (featuredOrder) return featuredOrder;
  if (state.sort === 'provider') return a.provider.localeCompare(b.provider) || titleOrder;
  if (state.sort === 'free') return Number(b.cost === 'Free') - Number(a.cost === 'Free') || titleOrder;
  if (state.sort === 'title') return titleOrder;
  const ranks = { Beginner: 0, 'All levels': 1, Intermediate: 2, Advanced: 3 };
  return (ranks[a.level] ?? 4) - (ranks[b.level] ?? 4) || titleOrder;
}

function renderSaveButton(save, item) {
  const saved = Object.hasOwn(bookmarks, item.id);
  save.textContent = t(saved ? 'Saved' : 'Save');
  save.dataset.bookmark = item.id;
  save.setAttribute('aria-pressed', String(saved));
}

function toggleBookmark(item) {
  if (Object.hasOwn(bookmarks, item.id)) delete bookmarks[item.id];
  else bookmarks[item.id] = false;

  write('health-hub-path', bookmarks);

  for (const save of document.querySelectorAll('button[data-bookmark]')) {
    if (save.dataset.bookmark === item.id) renderSaveButton(save, item);
  }
  renderPath();
}

function card(item) {
  const article = el('article', '', 'card');
  article.id = `resource-${item.id}`;
  const facts = el('div', '', 'badges');

  if (utahIds.includes(item.id)) {
    facts.append(el('span', translate('Start here', 'Commencer ici'), 'badge ribbon'));
  }
  for (const value of [item.provider, t(item.type), t(item.level), t(item.cost), ...catalogueLanguages(item).map(t)]) {
    if (value) facts.append(el('span', value, 'badge'));
  }
  if (item.certificate === true) facts.append(el('span', t('Certificate available'), 'badge'));

  article.append(facts, el('h3', item.title));
  const description = french ? item.descriptionFr || item.description : item.description;
  if (description) article.append(el('p', description));
  const details = [item.duration, item.fee].filter(Boolean).map(t).join(' · ');
  if (details) article.append(el('p', details, 'duration'));

  const actions = el('div', '', 'actions');
  if (item.url && item.url !== '#') {
    actions.append(external(t('Open resource'), item.url, 'button'));
    actions.append(button(t('Copy link'), () => copyText(item.url)));
  }
  const save = button('', () => toggleBookmark(item));
  renderSaveButton(save, item);
  actions.append(save);
  article.append(actions);
  return article;
}

function renderCatalogue() {
  const matching = resources.filter(matches).sort(compareItems);
  $('count').textContent = translate(
    `Showing ${matching.length} of ${resources.length} resources`,
    `${matching.length} ressources affichées sur ${resources.length}`
  );

  const sections = [];
  for (const id of Object.keys(topicLabels)) {
    const entries = matching.filter(item => item.topic === id);
    if (!entries.length) continue;

    const section = el('section');
    section.id = id;
    const grid = el('div', '', 'grid');
    grid.append(...entries.map(card));
    section.append(el('h3', topicName(id)), grid);
    sections.push(section);
  }

  if (!sections.length) {
    sections.push(el('p', translate('No resources match these filters.', 'Aucune ressource ne correspond à ces filtres.')));
  }
  $('results').replaceChildren(...sections);
}

function savedResources() {
  return resources.filter(item => Object.hasOwn(bookmarks, item.id));
}

function renderPath() {
  const saved = savedResources();
  const completed = saved.filter(item => bookmarks[item.id]).length;
  $('progress').max = Math.max(saved.length, 1);
  $('progress').value = completed;
  $('progress-text').textContent = translate(
    `${completed} of ${saved.length} completed`,
    `${completed} sur ${saved.length} terminées`
  );

  const rows = saved.map(item => {
    const row = el('li');
    const label = el('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(bookmarks[item.id]);
    checkbox.setAttribute('aria-label', translate(`Mark ${item.title} complete`, `Marquer ${item.title} comme terminée`));
    checkbox.addEventListener('change', () => {
      bookmarks[item.id] = checkbox.checked;
      write('health-hub-path', bookmarks);
      renderPath();
    });
    const title = item.url && item.url !== '#' ? external(item.title, item.url) : el('span', item.title);
    label.append(checkbox, document.createTextNode(' '));
    row.append(label, title, document.createTextNode(' '), button(
      translate('Remove', 'Retirer'),
      () => toggleBookmark(item)
    ));
    return row;
  });

  $('saved-list').replaceChildren(...(rows.length ? rows : [
    el('li', translate('No saved resources yet.', 'Aucune ressource enregistrée.'))
  ]));
}

function renderMap() {
  const groups = [
    [translate('Standards', 'Normes'), ['FHIR', 'LOINC', 'SNOMED CT', 'ICD-11']],
    [translate('Architectures', 'Architectures'), ['OpenHIE', 'DHIS2']],
    [translate('Governance', 'Gouvernance'), ['AfCFTA', 'IGAD', 'ECOWAS', 'GDPR']],
    [translate('Health data spaces', 'Espaces de données de santé'), ['AHDS', 'EHDS']]
  ];
  const aliases = { AHDS: 'Africa Health Data Space', EHDS: 'European Health Data Space' };

  $('map-diagram').replaceChildren(...groups.map(([name, terms]) => {
    const group = el('div');
    const chips = el('div', '', 'chips');
    for (const term of terms) {
      chips.append(button(term, () => {
        apply({ ...defaults, q: aliases[term] || term });
        $('directory').scrollIntoView();
      }));
    }
    group.append(el('h3', name), chips);
    return group;
  }));
}

function renderComparison() {
  const africa = [
    'ahds-project-website',
    'digital-health-systems-and-data-sovereignty',
    'ahds-cross-border-prototype',
    'african-continental-health-data-governance-framework'
  ];
  const europe = [
    'ehds-regulation-overview-and-timeline',
    'european-health-data-space-regulation-eu-2025-327',
    'frequently-asked-questions-on-the-european-health-data-space',
    'general-data-protection-regulation-gdpr'
  ];
  const byId = new Map(resources.map(item => [item.id, item]));

  function column(heading, ids) {
    const section = el('div');
    const list = el('ul');
    for (const id of ids) {
      const item = byId.get(id);
      if (!item?.url || item.url === '#') continue;
      const row = el('li');
      row.append(external(item.title, item.url));
      list.append(row);
    }
    section.append(el('h3', heading), list);
    return section;
  }

  const columns = [];
  if (comparison !== 'Europe') columns.push(column(translate('African Health Data Space', 'Espace africain des données de santé'), africa));
  if (comparison !== 'Africa') columns.push(column(translate('European Health Data Space', 'Espace européen des données de santé'), europe));
  $('compare-content').replaceChildren(...columns);
  for (const option of $('compare-controls').querySelectorAll('[data-compare]')) {
    option.setAttribute('aria-pressed', String(option.dataset.compare === comparison));
  }
}

function updateStats() {
  $('total-stat').textContent = resources.length;
  $('topic-stat').textContent = new Set(
    resources.filter(item => item.topic !== 'communities').map(item => item.topic)
  ).size;
  $('free-stat').textContent = resources.filter(item => item.cost === 'Free').length;
  $('stats').hidden = false;
}

$('language-toggle').addEventListener('click', () => {
  french = !french;
  write('health-hub-language', translate('en', 'fr'));
  setLanguage();
  if (!resources.length) return;
  setupOptions();
  apply(state, false);
  renderPath();
  renderMap();
  renderComparison();
});

$('theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  write('health-hub-theme', dark ? 'dark' : 'light');
});

$('filters').addEventListener('submit', event => event.preventDefault());
for (const field of fields) {
  $(field).addEventListener('change', () => apply({ ...state, [field]: $(field).value }));
}
$('search').addEventListener('input', () => apply({ ...state, q: $('search').value }));
$('clear').addEventListener('click', () => apply(defaults));

for (const link of $('topic-nav').querySelectorAll('a')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    apply({ ...defaults, topic: link.hash.slice(1) });
    $(link.hash.slice(1))?.scrollIntoView();
  });
}

$('compare-controls').addEventListener('click', event => {
  const option = event.target.closest('[data-compare]');
  if (!option) return;
  comparison = option.dataset.compare;
  renderComparison();
});

$('copy-path').addEventListener('click', () => {
  const text = savedResources().map(item => `${item.title}\n${item.url}`).join('\n\n');
  if (text) copyText(text);
});

$('print-path').addEventListener('click', () => {
  document.body.classList.add('print-path');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('print-path'));

$('export-path').addEventListener('click', () => {
  const entries = savedResources().map(item => ({
    id: item.id,
    completed: Boolean(bookmarks[item.id])
  }));
  const file = new Blob([JSON.stringify({ version: 1, entries }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = el('a');
  link.href = url;
  link.download = 'my-learning-path.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('import-path').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async event => {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.entries)) throw new Error('Invalid learning path');
    const ids = new Set(resources.map(item => item.id));
    for (const entry of data.entries) {
      if (entry && ids.has(entry.id)) {
        bookmarks[entry.id] = Boolean(bookmarks[entry.id] || entry.completed === true);
      }
    }
    write('health-hub-path', bookmarks);
    renderPath();
    renderCatalogue();
    if ($('recommendations').children.length) $('quiz-form').requestSubmit();
    notice(translate('Progress imported.', 'Progression importée.'));
  } catch {
    notice(translate('Choose a valid learning path JSON file.', 'Choisissez un fichier JSON de parcours valide.'));
  } finally {
    input.value = '';
  }
});

window.addEventListener('hashchange', loadHash);

async function init() {
  setTheme(read('health-hub-theme', 'light') === 'dark');
  setLanguage();

  try {
    const response = await fetch('./resources.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`resources.json returned HTTP ${response.status}`);
    const catalogue = await response.json();
    if (!Array.isArray(catalogue)) throw new Error('resources.json must contain an array');

    resources = mergeCatalogue(catalogue);
    setupOptions();
    updateStats();
    apply(defaults, false);
    loadHash();
    renderPath();
    renderMap();
    renderComparison();
  } catch (error) {
    $('count').textContent = translate(
      'The catalogue could not be loaded. Please reload the page.',
      'Le catalogue n’a pas pu être chargé. Veuillez recharger la page.'
    );
    console.error(error);
  }
}

init();

'use strict';

const $ = id => document.getElementById(id);
const tr = (en, fr) => french ? fr : en;

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;

    try {
      return JSON.parse(value);
    } catch {
      return typeof fallback === 'string' ? value : fallback;
    }
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The site can still work for the current browser session.
  }
}

function element(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, handler, className = 'secondary') {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', handler);
  return node;
}

function link(text, url, className = '') {
  const node = element('a', text, className);
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
}

function hasUrl(item) {
  return typeof item.url === 'string' && /^https?:\/\//i.test(item.url);
}

let french = read('health-hub-language', 'en') === 'fr';
let theme = read(
  'health-hub-theme',
  matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);
let saved = read('health-hub-path', {});
let resources = [];
let comparison = 'both';
let ready = false;

if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};

const topicNames = {
  'start-here': [
    'I. Start by understanding interoperability',
    'I. Comprendre les bases de l’interopérabilité'
  ],
  'health-data-standards': [
    'II. Health data standards and terminologies',
    'II. Normes et terminologies des données de santé'
  ],
  'architecture-and-implementation': [
    'III. Health data interoperability architectures',
    'III. Architectures d’interopérabilité des données de santé'
  ],
  'laws-and-regulations': [
    'IV. Laws and regulations',
    'IV. Législation et gouvernance'
  ],
  'health-data-spaces': [
    'V. Health data spaces',
    'V. Espaces de données de santé'
  ],
  communities: ['Communities and discussion forums', 'Communautés et forums']
};

const mainTopics = Object.keys(topicNames).filter(id => id !== 'communities');
const topicName = id => topicNames[id] ? tr(...topicNames[id]) : id;

const labels = {
  Beginner: 'Débutant',
  Intermediate: 'Intermédiaire',
  Advanced: 'Avancé',
  'All levels': 'Tous niveaux',
  Course: 'Cours',
  Lecture: 'Vidéo',
  Guide: 'Guide',
  Publication: 'Publication',
  Article: 'Article',
  Exam: 'Examen',
  Community: 'Communauté',
  Free: 'Gratuit',
  Paid: 'Payant',
  'Check provider': 'Vérifier auprès de l’organisme',
  'Free access': 'Accès gratuit',
  'Not listed': 'Non indiqué',
  'Self-paced reading': 'Lecture à votre rythme',
  'Self-paced reference': 'Ressource à consulter à votre rythme',
  English: 'Anglais',
  French: 'Français',
  Spanish: 'Espagnol',
  Portuguese: 'Portugais',
  Arabic: 'Arabe',
  German: 'Allemand'
};

const label = value => french ? labels[value] || value : value;

const utah = [
  'interoperability-intro-and-part-1',
  'interoperability-part-2',
  'interoperability-part-3'
];

const webinars = [
  'ehds-primary-use-webinar',
  'ehds-secondary-use-webinar',
  'ehds-implementation-webinar'
];

const defaults = {
  topic: '',
  type: '',
  cost: '',
  certificate: '',
  level: '',
  'resource-language': '',
  time: '',
  sort: 'beginner',
  q: ''
};

const filterIds = Object.keys(defaults).filter(key => key !== 'q');
let filters = { ...defaults };

const staticText = [...document.querySelectorAll('[data-fr]')].map(node => ({
  node,
  english: node.textContent
}));

function setLanguageAndTheme() {
  document.documentElement.lang = tr('en', 'fr');
  document.documentElement.dataset.theme = theme;

  for (const { node, english } of staticText) {
    node.textContent = tr(english, node.dataset.fr);
  }

  $('language-toggle').textContent = tr('Français', 'English');
  $('language-toggle').lang = tr('fr', 'en');

  const dark = theme === 'dark';
  $('theme').setAttribute('aria-pressed', String(dark));
  $('theme').textContent = dark
    ? tr('Light mode', 'Mode clair')
    : tr('Dark mode', 'Mode sombre');
}

function languages(item) {
  if (Array.isArray(item.languages)) return item.languages;
  return item.language ? [item.language] : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function setOptions(id, choices) {
  $(id).replaceChildren(...choices.map(([value, name]) => new Option(name, value)));
}

function filterOptions() {
  const choices = values => unique(values).map(value => [value, label(value)]);
  const all = ['', tr('All', 'Tous')];
  const topics = [...mainTopics, 'communities']
    .filter(id => resources.some(item => item.topic === id))
    .map(id => [id, topicName(id)]);

  setOptions('topic', [all, ...topics]);
  setOptions('type', [all, ...choices(resources.map(item => item.type))]);
  setOptions('cost', [all, ...choices(resources.map(item => item.cost))]);
  setOptions('level', [all, ...choices(resources.map(item => item.level))]);
  setOptions('resource-language', [all, ...choices(resources.flatMap(languages))]);
  setOptions('time', [all, ...choices(resources.map(item => item.timeCommitment))]);

  setOptions('certificate', [
    all,
    ['yes', tr('Certificate available', 'Attestation disponible')],
    ['no', tr('No confirmed certificate', 'Aucune attestation confirmée')]
  ]);

  setOptions('sort', [
    ['beginner', tr('Beginner first', 'Débutants en premier')],
    ['free', tr('Free first', 'Gratuit en premier')],
    ['title', tr('A to Z', 'De A à Z')],
    ['provider', tr('Provider', 'Organisme')]
  ]);
}

function syncFilters(writeUrl = true) {
  for (const id of filterIds) $(id).value = filters[id];

  if (writeUrl) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([id, value]) => value !== defaults[id])
    );
    const hash = params.size ? '#view?' + params : '#directory';
    history.replaceState(null, '', location.pathname + location.search + hash);
  }

  renderCatalogue();
}

function loadFilters() {
  if (!location.hash.startsWith('#view?')) return;

  const params = new URLSearchParams(location.hash.slice(6));
  filters = { ...defaults };

  for (const key of Object.keys(defaults)) {
    if (params.has(key)) filters[key] = params.get(key);
  }

  syncFilters(false);

  const target = params.get('resource');
  if (target) $(target)?.scrollIntoView();
}

function renderNav() {
  $('topic-nav').replaceChildren(...mainTopics.map(id => {
    const anchor = element('a', topicName(id));
    anchor.href = '#' + id;

    anchor.addEventListener('click', event => {
      if (!ready || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      filters = { ...defaults, topic: id };
      syncFilters();
      $(id)?.scrollIntoView();
    });

    return anchor;
  }));
}

function searchable(item) {
  return [item.title, item.provider, item.description, item.descriptionFr, ...(item.tags || [])]
    .join(' ')
    .toLowerCase();
}

function matches(item) {
  return (!filters.q || searchable(item).includes(filters.q.toLowerCase())) &&
    (!filters.topic || item.topic === filters.topic) &&
    (!filters.type || item.type === filters.type) &&
    (!filters.cost || item.cost === filters.cost) &&
    (!filters.level || item.level === filters.level) &&
    (!filters.certificate || (item.certificate === true) === (filters.certificate === 'yes')) &&
    (!filters['resource-language'] || languages(item).includes(filters['resource-language'])) &&
    (!filters.time || item.timeCommitment === filters.time);
}

function featuredOrder(item) {
  const series = item.topic === 'health-data-spaces' ? webinars : utah;
  const position = series.indexOf(item.id);
  if (position >= 0) return position;
  return item.id === 'medblocks-fhir-fundamentals' ? 3 : 4;
}

function readingRank(item) {
  const levels = { Beginner: 0, 'All levels': 1, Intermediate: 2, Advanced: 3 };
  const publicationOrPdf = item.type === 'Publication' || (item.tags || []).includes('PDF');

  if (item.level !== 'Beginner' && publicationOrPdf) return 4;
  return levels[item.level] ?? 4;
}

function ordering(a, b) {
  const featured = featuredOrder(a) - featuredOrder(b);
  if (featured) return featured;

  const titleOrder = a.title.localeCompare(b.title);

  if (filters.sort === 'provider') {
    return a.provider.localeCompare(b.provider) || titleOrder;
  }
  if (filters.sort === 'title') return titleOrder;
  if (filters.sort === 'free') {
    return Number(b.cost === 'Free') - Number(a.cost === 'Free') || titleOrder;
  }

  return readingRank(a) - readingRank(b) || titleOrder;
}

function notify(text) {
  $('notice').textContent = text;
}

async function copyText(text) {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    notify(tr('Copied.', 'Copié.'));
  } catch {
    notify(tr(
      'Copying is unavailable in this browser.',
      'La copie est indisponible dans ce navigateur.'
    ));
  }
}

function updateSaveControl(control, id) {
  const active = Object.hasOwn(saved, id);
  control.textContent = active ? tr('Saved', 'Enregistré') : tr('Save', 'Enregistrer');
  control.setAttribute('aria-pressed', String(active));
}

function saveButton(item) {
  const control = button('', () => toggleSave(item));
  control.dataset.bookmark = item.id;
  updateSaveControl(control, item.id);
  return control;
}

function toggleSave(item) {
  if (Object.hasOwn(saved, item.id)) delete saved[item.id];
  else saved[item.id] = false;

  store('health-hub-path', saved);

  for (const control of document.querySelectorAll('[data-bookmark]')) {
    if (control.dataset.bookmark === item.id) {
      updateSaveControl(control, item.id);
    }
  }

  renderPath();
}

function resourceCard(item) {
  const card = element('li', '', 'card');
  card.id = 'resource-' + item.id;

  const badges = element('div', '', 'badges');
  const webinar = webinars.indexOf(item.id);
  const lecture = utah.indexOf(item.id);

  if (webinar >= 0 || lecture >= 0) {
    const part = Math.max(webinar, lecture) + 1;
    badges.append(element(
      'span',
      tr(`Start here · Part ${part} of 3`, `Commencer ici · Partie ${part} sur 3`),
      'badge ribbon'
    ));
  }

  const facts = [item.provider, item.type, item.level, item.cost, ...languages(item)];
  for (const fact of facts.filter(Boolean)) {
    badges.append(element('span', label(fact), 'badge'));
  }

  if (item.certificate === true) {
    badges.append(element(
      'span',
      tr('Certificate available', 'Attestation disponible'),
      'badge'
    ));
  }

  card.append(badges, element('h3', item.title));

  const description = french ? item.descriptionFr || item.description : item.description;
  if (description) card.append(element('p', description));

  const details = [item.duration, item.fee].filter(Boolean).map(label).join(' · ');
  if (details) card.append(element('p', details, 'duration'));

  const actions = element('div', '', 'actions');

  if (hasUrl(item)) {
    actions.append(
      link(tr('Open resource', 'Ouvrir la ressource'), item.url, 'button'),
      button(tr('Copy link', 'Copier le lien'), () => copyText(item.url))
    );
  }

  actions.append(saveButton(item));
  card.append(actions);
  return card;
}

function renderCatalogue() {
  const matchesFilters = resources.filter(matches);

  $('count').textContent = tr(
    `Showing ${matchesFilters.length} of ${resources.length} resources`,
    `${matchesFilters.length} ressources affichées sur ${resources.length}`
  );

  const sections = [];

  for (const id of [...mainTopics, 'communities']) {
    const entries = matchesFilters.filter(item => item.topic === id).sort(ordering);
    if (!entries.length) continue;

    const section = element('section');
    section.id = id;

    const list = element('ul', '', 'cards plain');
    list.append(...entries.map(resourceCard));

    section.append(element('h3', topicName(id)), list);
    sections.push(section);
  }

  $('results').replaceChildren(...(sections.length ? sections : [
    element('p', tr(
      'No resources match these filters.',
      'Aucune ressource ne correspond à ces filtres.'
    ))
  ]));
}

function savedResources() {
  return resources.filter(item => Object.hasOwn(saved, item.id));
}

function renderPath() {
  const items = savedResources();
  const complete = items.filter(item => saved[item.id] === true).length;

  $('progress').max = items.length || 1;
  $('progress').value = complete;
  $('progress-text').textContent = tr(
    `${complete} of ${items.length} completed`,
    `${complete} sur ${items.length} terminées`
  );

  const rows = items.map(item => {
    const row = element('li');
    const checkbox = element('input');

    checkbox.type = 'checkbox';
    checkbox.checked = saved[item.id] === true;
    checkbox.setAttribute('aria-label', tr(
      `Mark ${item.title} complete`,
      `Marquer ${item.title} comme terminée`
    ));

    checkbox.addEventListener('change', () => {
      saved[item.id] = checkbox.checked;
      store('health-hub-path', saved);
      renderPath();
    });

    row.append(
      checkbox,
      document.createTextNode(' '),
      hasUrl(item) ? link(item.title, item.url) : element('span', item.title),
      document.createTextNode(' '),
      button(tr('Remove', 'Retirer'), () => toggleSave(item))
    );

    return row;
  });

  $('saved-list').replaceChildren(...(rows.length ? rows : [
    element('li', tr('No saved resources yet.', 'Aucune ressource enregistrée.'))
  ]));
}

const foundations = [
  [...utah, 'foundations-of-health-information-exchange'],
  ['medblocks-fhir-fundamentals', 'loinc', 'snomed-ct', 'icd-11', 'ucum', 'dicom'],
  ['openhie-architecture-overview', 'openhim-about'],
  ['african-union-data-policy-framework', 'african-union-hie-guidelines-and-standards'],
  [...webinars, 'ahds-project-website', 'ehds-regulation-overview-and-timeline']
];

// Each row follows the order of the five learning topics.
const pathways = {
  learner: {
    Beginner: [
      'digital-health-planning-national-systems',
      'health-data-standards',
      'dhis2-fundamentals',
      'digital-health-blueprint',
      'frequently-asked-questions-on-the-european-health-data-space'
    ],
    Intermediate: [
      'immunization-information-systems-elearning',
      'interopen-terminology-learnathon',
      'digital-health-platform-handbook',
      'malabo-convention',
      'digital-health-systems-and-data-sovereignty'
    ],
    Advanced: [
      'public-health-interoperability-training-catalog',
      'nhs-fhir-terminology-exercises',
      'ihe-technical-framework',
      'recommendation-on-health-data-governance',
      'fair-health-infrastructure-africa'
    ]
  },
  implementer: {
    Beginner: [
      'immunization-information-systems-elearning',
      'introduction-to-interoperability-and-fhir',
      'dhis2-fundamentals',
      'digital-health-blueprint',
      'frequently-asked-questions-on-the-european-health-data-space'
    ],
    Intermediate: [
      'public-health-interoperability-training-catalog',
      'interopen-terminology-learnathon',
      'dhis2-integration-concepts',
      'african-continental-health-data-governance-framework',
      'ahds-cross-border-prototype'
    ],
    Advanced: [
      'interoperability-in-healthcare-towards-an-interconnected-future',
      'nhs-fhir-terminology-exercises',
      'data-exchange-specification',
      'igad-health-data-sharing',
      'fair-health-infrastructure-africa'
    ]
  },
  policy: {
    Beginner: [
      'digital-health-planning-national-systems',
      'health-data-standards',
      'digital-health-platform-handbook',
      'digital-health-blueprint',
      'digital-health-systems-and-data-sovereignty'
    ],
    Intermediate: [
      'interoperability-in-healthcare-towards-an-interconnected-future',
      'introduction-to-interoperability-and-fhir',
      'health-information-exchange-maturity-assessment-tool',
      'african-continental-health-data-governance-framework',
      'ehds-committee-register'
    ],
    Advanced: [
      'public-health-interoperability-training-catalog',
      'interopen-terminology-learnathon',
      'digital-adaptation-kits',
      'afcfta-digital-trade-annexes',
      'european-health-data-space-regulation-eu-2025-327'
    ]
  }
};

const additional = [
  [
    'digital-health-planning-national-systems',
    'public-health-interoperability-training-catalog'
  ],
  ['hl7-fhir', 'interopen-terminology-learnathon', 'nhs-fhir-terminology-exercises'],
  ['openhim-design-overview', 'dhis2-fundamentals', 'dhis2-integration-concepts', 'ihe-technical-framework'],
  ['malabo-convention', 'afcfta-digital-trade', 'general-data-protection-regulation-gdpr'],
  ['ahds-cross-border-prototype', 'frequently-asked-questions-on-the-european-health-data-space']
];

function resourceList(items, ordered = false, includeSave = true) {
  const list = element(ordered ? 'ol' : 'ul');

  for (const item of items.filter(Boolean)) {
    const row = element('li');
    row.append(hasUrl(item) ? link(item.title, item.url) : element('span', item.title));

    if (includeSave) {
      row.append(document.createTextNode(' '), saveButton(item));
    }

    list.append(row);
  }

  return list;
}

function recommend() {
  const picks = pathways[$('role').value]?.[$('experience').value];
  if (!picks) return;

  if (!ready) {
    $('quiz-status').textContent = tr(
      'The catalogue is not ready yet.',
      'Le catalogue n’est pas encore disponible.'
    );
    return;
  }

  const catalogue = new Map(resources.map(item => [item.id, item]));

  const sections = mainTopics.map((topic, index) => {
    const section = element('section');
    const core = foundations[index];
    const tailored = catalogue.get(picks[index]);
    const used = new Set([...core, picks[index]]);

    section.append(
      element('h3', topicName(topic)),
      resourceList(core.map(id => catalogue.get(id)), true)
    );

    if (tailored && !core.includes(tailored.id)) {
      section.append(
        element('p', tr(
          'Recommended for your role and level',
          'Recommandé pour votre rôle et votre niveau'
        )),
        resourceList([tailored])
      );
    }

    const extras = additional[index]
      .filter(id => !used.has(id))
      .map(id => catalogue.get(id))
      .filter(Boolean);

    if (extras.length) {
      const details = element('details');
      details.append(
        element(
          'summary',
          tr('Additional materials to read', 'Ressources complémentaires à consulter'),
          'button secondary'
        ),
        resourceList(extras)
      );
      section.append(details);
    }

    return section;
  });

  $('recommendations').replaceChildren(...sections);
  $('quiz-status').textContent = tr(
    'Your suggested learning order',
    'Votre parcours d’apprentissage suggéré'
  );
}

function renderMap() {
  const groups = [
    [
      ['Point-of-service systems', 'Systèmes de prestation'],
      [['Clinical systems', 'Systèmes cliniques', 'OpenHIE']]
    ],
    [
      ['Interoperability layer', 'Couche d’interopérabilité'],
      [
        ['OpenHIE framework', 'Cadre OpenHIE', 'OpenHIE'],
        ['FHIR', 'FHIR', 'FHIR'],
        ['OpenHIM', 'OpenHIM', 'https://openhim.org/docs/dev-guide/design-overview/']
      ]
    ],
    [
      ['Shared services', 'Services partagés'],
      [
        ['Registries', 'Registres', 'registry'],
        ['Terminology', 'Terminologie', 'terminology'],
        ['Shared records', 'Dossiers partagés', 'OpenHIE']
      ]
    ],
    [
      ['Governance', 'Gouvernance'],
      [
        ['AU frameworks', 'Cadres de l’Union africaine', 'African Union'],
        ['AfCFTA', 'ZLECAf', 'AfCFTA'],
        ['GDPR', 'RGPD', 'GDPR']
      ]
    ]
  ];

  const sections = groups.map(([heading, nodes]) => {
    const section = element('section');
    const controls = element('div', '', 'chips');

    for (const [en, fr, destination] of nodes) {
      const text = tr(en, fr);

      if (destination.startsWith('https://')) {
        controls.append(link(text, destination, 'button secondary'));
      } else {
        controls.append(button(text, () => {
          if (!ready) return;

          filters = { ...defaults, q: destination };
          syncFilters();
          $('directory-title').focus({ preventScroll: true });
          $('directory').scrollIntoView();
        }));
      }
    }

    section.append(element('h3', tr(...heading)), controls);
    return section;
  });

  $('map-diagram').replaceChildren(...sections);
}

function renderComparison() {
  const regions = comparison === 'both' ? ['Africa', 'Europe'] : [comparison];

  const panels = regions.map(region => {
    const panel = element('div');
    const items = resources.filter(item =>
      ['laws-and-regulations', 'health-data-spaces'].includes(item.topic) &&
      (item.tags || []).includes(region)
    ).sort(ordering);

    const heading = region === 'Africa'
      ? tr('African Health Data Space', 'Espace africain des données de santé')
      : tr('European Health Data Space', 'Espace européen des données de santé');

    panel.append(element('h3', heading), resourceList(items, false, false));
    return panel;
  });

  $('compare-content').replaceChildren(...panels);

  for (const control of $('compare-controls').querySelectorAll('[data-compare]')) {
    control.setAttribute('aria-pressed', String(control.dataset.compare === comparison));
  }
}

function renderAll() {
  setLanguageAndTheme();
  renderNav();
  renderMap();
  if (!ready) return;

  filterOptions();
  syncFilters(false);
  renderPath();
  renderComparison();

  if ($('recommendations').children.length) recommend();
}

$('language-toggle').addEventListener('click', () => {
  french = !french;
  store('health-hub-language', french ? 'fr' : 'en');
  renderAll();
});

$('theme').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  store('health-hub-theme', theme);
  setLanguageAndTheme();
});

$('quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  recommend();
});

$('filters').addEventListener('submit', event => event.preventDefault());

for (const id of filterIds) {
  $(id).addEventListener('change', () => {
    filters[id] = $(id).value;
    if (id === 'topic') filters.q = '';

    if (ready) {
      syncFilters();
      if (id === 'sort') renderComparison();
    }
  });
}

$('clear').addEventListener('click', () => {
  filters = { ...defaults };

  if (ready) {
    syncFilters();
    renderComparison();
  }
});

$('compare-controls').addEventListener('click', event => {
  const control = event.target.closest('[data-compare]');
  if (!control) return;

  comparison = control.dataset.compare;
  if (ready) renderComparison();
});

$('copy-path').addEventListener('click', () => {
  const text = savedResources()
    .map(item => [item.title, hasUrl(item) ? item.url : ''].filter(Boolean).join('\n'))
    .join('\n\n');

  copyText(text);
});

$('print-path').addEventListener('click', () => {
  document.body.classList.add('print-path');
  window.print();
});

window.addEventListener('afterprint', () => {
  document.body.classList.remove('print-path');
});

$('export-path').addEventListener('click', () => {
  const entries = savedResources().map(item => ({
    id: item.id,
    completed: saved[item.id] === true
  }));

  const file = new Blob(
    [JSON.stringify({ version: 1, entries }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(file);
  const download = element('a');

  download.href = url;
  download.download = 'my-learning-path.json';
  document.body.append(download);
  download.click();
  download.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('import-path').addEventListener('click', () => $('import-file').click());

$('import-file').addEventListener('change', async event => {
  const input = event.target;
  const file = input.files[0];
  if (!file || !ready) return;

  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.entries)) throw new Error('Invalid learning path');

    const ids = new Set(resources.map(item => item.id));

    for (const entry of data.entries) {
      if (entry && ids.has(entry.id)) {
        saved[entry.id] = saved[entry.id] === true || entry.completed === true;
      }
    }

    store('health-hub-path', saved);
    renderAll();
    notify(tr('Progress imported.', 'Progression importée.'));
  } catch {
    notify(tr(
      'Choose a valid learning path JSON file.',
      'Choisissez un fichier JSON de parcours valide.'
    ));
  } finally {
    input.value = '';
  }
});

window.addEventListener('hashchange', () => {
  if (ready) loadFilters();
});

async function init() {
  renderAll();

  try {
    const response = await fetch('./resources.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`resources.json returned HTTP ${response.status}`);

    const catalogue = await response.json();
    if (!Array.isArray(catalogue)) {
      throw new Error('resources.json must contain an array');
    }

    resources = catalogue;
    ready = true;

    $('total-stat').textContent = resources.length;
    $('topic-stat').textContent = mainTopics.length;
    $('free-stat').textContent = resources.filter(item => item.cost === 'Free').length;
    $('stats').hidden = false;

    renderAll();
    loadFilters();
    renderComparison();
  } catch (error) {
    $('count').textContent = tr(
      'The catalogue could not be loaded. Check that resources.json is alongside index.html.',
      'Le catalogue n’a pas pu être chargé. Vérifiez que resources.json se trouve à côté de index.html.'
    );
    console.error(error);
  }
}

init();

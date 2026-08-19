"use strict";

// StorageAPI is loaded via <script src="../shared/storage.js"> before this file

// ── i18n strings ─────────────────────────────────────────────────────────────
const I18N = {
  en: {
    allPrompts:   "All Prompts",
    favorites:    "Favorites",
    mostUsed:     "Most Used",
    byStoryFlow:  "BY STORY FLOW",
    bySolution:   "BY SOLUTION",
    importExport: "Import / Export",
    settings:     "Settings",
    newPrompt:    "+ New Prompt",
    import:       "↑ Import",
    export:       "↓ Export",
    searchPlaceholder: "Search all prompts…",
    sortLabel:    "Sort:",
    sortUpdated:  "Last Updated",
    sortTitle:    "Title A–Z",
    sortUsage:    "Most Used",
    sortCreated:  "Date Created",
    title:        "Title",
    promptBody:   "Prompt Body (EN)",
    promptBodyFr: "Prompt Body (FR)",
    bodyPlaceholder:   "The full prompt text that will be copied to clipboard…",
    bodyPlaceholderFr: "Le texte complet du prompt qui sera copié dans le presse-papier…",
    storyFlow:    "Story Flow",
    favorite:     "Favorite",
    markFav:      "Mark as Favorite ★",
    solutions:    "Solutions",
    tags:         "Tags",
    tagsHint:     "(press Enter to add)",
    landscapes:   "Landscapes",
    landscapesHint: "(tenant URLs / system names)",
    notes:        "Notes",
    notesHint:    "(internal, not copied)",
    notesPlaceholder: "Demo tips, context notes…",
    cancel:       "Cancel",
    save:         "Save Prompt",
    copy:         "Copy",
    edit:         "Edit",
    del:          "Delete",
    openMgr:      "Open Prompt Manager",
    copied:       "Copied to clipboard ✓",
    promptUpdated:"Prompt updated ✓",
    promptCreated:"Prompt created ✓",
    promptDeleted:"Prompt deleted",
    settingsSaved:"Settings saved ✓",
    exportBtn:    "↓ Download prompts.json",
    importBtn:    "Choose JSON file…",
    importMerge:  "Merge (keep existing)",
    importReplace:"Replace all",
    exportTitle:  "Export Prompts",
    exportDesc:   "Download all your prompts as a JSON file to share with colleagues or back up your library.",
    importTitle:  "Import Prompts",
    importDesc:   "Import a previously exported JSON file. Choose merge (keep existing) or replace (overwrite all).",
    settingsTitle:"Extension Settings",
    autoFilter:   "Auto-filter prompts by detected SAP tool",
    autoFilterHint:"When enabled, the overlay shows only prompts matching the current SAP solution.",
    shortcutLabel:"Keyboard shortcut",
    shortcutHint: "Use Ctrl+Shift+Space to toggle the overlay on any page. Change in Edge extension shortcuts.",
    saveSettings: "Save Settings",
    solutionsAdmin:"Solutions",
    solutionsDesc: "Manage the list of SAP solutions available when creating or filtering prompts.",
    flowsAdmin:   "Story Flows",
    flowsDesc:    "Manage the end-to-end demo story flows used to organise and filter prompts.",
    landscapesAdmin:"Landscapes",
    landscapesDesc: "Manage the shared landscape catalogue (tenant URLs, system names) available when tagging prompts.",
    addSolution:  "+ Add Solution",
    addFlow:      "+ Add Story Flow",
    addLandscape: "+ Add Landscape",
    add:          "Add",
    unused:       "unused",
    noItems:      "No items yet. Click \"+ Add\" to create one.",
    noPrompts:    "No prompts found",
    noPromptsHint:"Try a different search or create a new prompt with the \"+ New Prompt\" button.",
    selectFlow:   "— Select —",
    renamed:      (v) => `Renamed to "${v}"`,
    added:        (v) => `"${v}" added`,
    deleted:      (v) => `"${v}" deleted`,
    deleteConfirm:(v,n) => `"${v}" is used by ${n} prompt${n!==1?'s':''}.\nDeleting it will remove it from those prompts. Continue?`,
    alreadyExists:"Already exists",
    nameExists:   "Name already exists",
    usedBy:       (n) => `Used by ${n} prompt${n!==1?'s':''}`,
    promptsCount: (n) => `${n} prompt${n!==1?'s':''}`,
    importOk:     (n,s) => `✓ Imported ${n} prompts${s ? `, skipped ${s} duplicates` : ""}.`,
    langSwitch:   "FR",
    bodyTabEn:    "EN",
    bodyTabFr:    "FR",
  },
  fr: {
    allPrompts:   "Tous les prompts",
    favorites:    "Favoris",
    mostUsed:     "Les plus utilisés",
    byStoryFlow:  "PAR PROCESSUS",
    bySolution:   "PAR SOLUTION",
    importExport: "Import / Export",
    settings:     "Paramètres",
    newPrompt:    "+ Nouveau prompt",
    import:       "↑ Importer",
    export:       "↓ Exporter",
    searchPlaceholder: "Rechercher des prompts…",
    sortLabel:    "Tri :",
    sortUpdated:  "Dernière mise à jour",
    sortTitle:    "Titre A–Z",
    sortUsage:    "Plus utilisés",
    sortCreated:  "Date de création",
    title:        "Titre",
    promptBody:   "Corps du prompt (EN)",
    promptBodyFr: "Corps du prompt (FR)",
    bodyPlaceholder:   "The full prompt text that will be copied to clipboard…",
    bodyPlaceholderFr: "Le texte complet du prompt qui sera copié dans le presse-papier…",
    storyFlow:    "Processus métier",
    favorite:     "Favori",
    markFav:      "Marquer comme favori ★",
    solutions:    "Solutions",
    tags:         "Tags",
    tagsHint:     "(Entrée pour ajouter)",
    landscapes:   "Paysages",
    landscapesHint: "(URL de tenant / noms de système)",
    notes:        "Notes",
    notesHint:    "(interne, non copié)",
    notesPlaceholder: "Conseils démo, notes de contexte…",
    cancel:       "Annuler",
    save:         "Enregistrer",
    copy:         "Copier",
    edit:         "Modifier",
    del:          "Supprimer",
    openMgr:      "Ouvrir le gestionnaire",
    copied:       "Copié dans le presse-papier ✓",
    promptUpdated:"Prompt mis à jour ✓",
    promptCreated:"Prompt créé ✓",
    promptDeleted:"Prompt supprimé",
    settingsSaved:"Paramètres enregistrés ✓",
    exportBtn:    "↓ Télécharger prompts.json",
    importBtn:    "Choisir un fichier JSON…",
    importMerge:  "Fusionner (conserver l'existant)",
    importReplace:"Tout remplacer",
    exportTitle:  "Exporter les prompts",
    exportDesc:   "Téléchargez tous vos prompts en JSON pour les partager ou les sauvegarder.",
    importTitle:  "Importer des prompts",
    importDesc:   "Importez un fichier JSON exporté précédemment. Choisissez fusionner ou remplacer.",
    settingsTitle:"Paramètres de l'extension",
    autoFilter:   "Filtrer les prompts par outil SAP détecté",
    autoFilterHint:"Si activé, l'overlay affiche uniquement les prompts correspondant à la solution SAP active.",
    shortcutLabel:"Raccourci clavier",
    shortcutHint: "Utilisez Ctrl+Maj+Espace pour afficher l'overlay. À modifier dans les raccourcis des extensions Edge.",
    saveSettings: "Enregistrer les paramètres",
    solutionsAdmin:"Solutions",
    solutionsDesc: "Gérez la liste des solutions SAP disponibles à la création et au filtrage des prompts.",
    flowsAdmin:   "Processus métier",
    flowsDesc:    "Gérez les processus de démonstration de bout en bout pour organiser et filtrer les prompts.",
    landscapesAdmin:"Paysages",
    landscapesDesc: "Gérez le catalogue partagé de paysages (URL de tenant, noms de système).",
    addSolution:  "+ Ajouter une solution",
    addFlow:      "+ Ajouter un processus",
    addLandscape: "+ Ajouter un paysage",
    add:          "Ajouter",
    unused:       "non utilisé",
    noItems:      "Aucun élément. Cliquez sur \"+ Ajouter\" pour en créer un.",
    noPrompts:    "Aucun prompt trouvé",
    noPromptsHint:"Essayez une autre recherche ou créez un prompt avec le bouton \"+ Nouveau prompt\".",
    selectFlow:   "— Sélectionner —",
    renamed:      (v) => `Renommé en "${v}"`,
    added:        (v) => `"${v}" ajouté`,
    deleted:      (v) => `"${v}" supprimé`,
    deleteConfirm:(v,n) => `"${v}" est utilisé par ${n} prompt${n!==1?'s':''}.\nLe supprimer l'effacera de ces prompts. Continuer ?`,
    alreadyExists:"Existe déjà",
    nameExists:   "Ce nom existe déjà",
    usedBy:       (n) => `Utilisé par ${n} prompt${n!==1?'s':''}`,
    promptsCount: (n) => `${n} prompt${n!==1?'s':''}`,
    importOk:     (n,s) => `✓ ${n} prompts importés${s ? `, ${s} doublons ignorés` : ""}.`,
    langSwitch:   "EN",
    bodyTabEn:    "EN",
    bodyTabFr:    "FR",
  }
};

function t(key, ...args) {
  const val = I18N[currentLang]?.[key] ?? I18N.en[key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}

// ── State ─────────────────────────────────────────────────────────────────────
let STORY_FLOWS = [];
let SOLUTIONS   = [];
let LANDSCAPES  = [];

let allPrompts = [];
let editingId  = null;
let currentView = "all";
let currentFilter = { storyFlow: null, solution: null };
let pendingDeleteId = null;
let currentLang = "en";

// ── Startup ────────────────────────────────────────────────────────────────
async function init() {
  const [prompts, catalog, settings] = await Promise.all([
    StorageAPI.getAllPrompts(),
    StorageAPI.getCatalog(),
    StorageAPI.getSettings()
  ]);
  allPrompts  = prompts;
  STORY_FLOWS = catalog.storyFlows;
  SOLUTIONS   = catalog.solutions;
  LANDSCAPES  = catalog.landscapes;
  currentLang = settings.lang || "en";

  applyLang();
  buildSidebarFlows();
  buildSidebarSolutions();
  renderGrid();
  updateNavBadges();
  loadSettings();
  renderAdminPanels();
  bindEvents();
}

// ── Language application ───────────────────────────────────────────────────
function applyLang() {
  // Top bar
  document.getElementById("btn-new-prompt").textContent = t("newPrompt");
  document.getElementById("btn-import").textContent     = t("import");
  document.getElementById("btn-export").textContent     = t("export");
  document.getElementById("lang-toggle").textContent    = t("langSwitch");

  // Sidebar static labels
  document.getElementById("nav-label-library").textContent    = "LIBRARY";
  document.getElementById("nav-all-text").textContent         = t("allPrompts");
  document.getElementById("nav-favs-text").textContent        = t("favorites");
  document.getElementById("nav-most-used-text").textContent   = t("mostUsed");
  document.getElementById("nav-label-flows").textContent      = t("byStoryFlow");
  document.getElementById("nav-label-solutions").textContent  = t("bySolution");
  document.getElementById("nav-import-export-text").textContent = t("importExport");
  document.getElementById("nav-settings-text").textContent    = t("settings");

  // Search & sort
  document.getElementById("list-search").placeholder = t("searchPlaceholder");
  document.querySelector("#sort-controls label").childNodes[0].textContent = t("sortLabel") + " ";
  const sortSel = document.getElementById("sort-select");
  sortSel.options[0].text = t("sortUpdated");
  sortSel.options[1].text = t("sortTitle");
  sortSel.options[2].text = t("sortUsage");
  sortSel.options[3].text = t("sortCreated");

  // Import/Export view
  document.getElementById("ie-export-title").textContent = t("exportTitle");
  document.getElementById("ie-export-desc").textContent  = t("exportDesc");
  document.getElementById("do-export").textContent       = t("exportBtn");
  document.getElementById("ie-import-title").textContent = t("importTitle");
  document.getElementById("ie-import-desc").textContent  = t("importDesc");
  document.getElementById("do-import-btn").textContent   = t("importBtn");
  document.getElementById("import-merge-label").textContent  = " " + t("importMerge");
  document.getElementById("import-replace-label").textContent = " " + t("importReplace");

  // Settings view
  document.getElementById("settings-title").textContent      = t("settingsTitle");
  document.getElementById("setting-auto-filter-label").textContent = t("autoFilter");
  document.getElementById("setting-auto-filter-hint").textContent  = t("autoFilterHint");
  document.getElementById("setting-shortcut-label").textContent    = t("shortcutLabel");
  document.getElementById("do-save-settings").textContent          = t("saveSettings");
  document.getElementById("admin-sol-title").textContent    = t("solutionsAdmin");
  document.getElementById("admin-sol-desc").textContent     = t("solutionsDesc");
  document.getElementById("btn-add-solution").textContent   = t("addSolution");
  document.getElementById("admin-flow-title").textContent   = t("flowsAdmin");
  document.getElementById("admin-flow-desc").textContent    = t("flowsDesc");
  document.getElementById("btn-add-flow").textContent       = t("addFlow");
  document.getElementById("admin-ls-title").textContent     = t("landscapesAdmin");
  document.getElementById("admin-ls-desc").textContent      = t("landscapesDesc");
  document.getElementById("btn-add-landscape-admin").textContent = t("addLandscape");
}

// ── Sidebar dynamic items ──────────────────────────────────────────────────
function buildSidebarFlows() {
  const el = document.getElementById("nav-flows");
  el.innerHTML = STORY_FLOWS.map(f => `
    <button class="nav-item" data-view="flow" data-flow="${esc(f)}">
      <span class="nav-icon">▶</span> ${esc(f)}
      <span class="nav-badge">${allPrompts.filter(p => p.storyFlow === f).length}</span>
    </button>`).join("");
  el.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      setView("flow");
      currentFilter.storyFlow = btn.dataset.flow;
      currentFilter.solution = null;
      setActiveNav(btn);
      renderGrid();
    });
  });
}

function buildSidebarSolutions() {
  const el = document.getElementById("nav-solutions");
  el.innerHTML = SOLUTIONS.map(s => `
    <button class="nav-item" data-view="solution" data-solution="${esc(s)}">
      <span class="nav-icon">◆</span> ${esc(s)}
      <span class="nav-badge">${allPrompts.filter(p => (p.solutions||[]).includes(s)).length}</span>
    </button>`).join("");
  el.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      setView("solution");
      currentFilter.solution = btn.dataset.solution;
      currentFilter.storyFlow = null;
      setActiveNav(btn);
      renderGrid();
    });
  });
}

// ── Grid rendering ─────────────────────────────────────────────────────────
function getFilteredSorted() {
  const q = document.getElementById("list-search").value.toLowerCase().trim();
  const sort = document.getElementById("sort-select").value;

  let pool = allPrompts;

  if (currentView === "favorites")  pool = pool.filter(p => p.isFavorite);
  if (currentView === "most-used")  pool = pool.filter(p => (p.usageCount || 0) > 0);
  if (currentView === "flow")       pool = pool.filter(p => p.storyFlow === currentFilter.storyFlow);
  if (currentView === "solution")   pool = pool.filter(p => (p.solutions||[]).includes(currentFilter.solution));

  if (q) {
    pool = pool.filter(p =>
      [p.title, p.body, p.body_fr, p.notes, p.storyFlow, ...(p.solutions||[]), ...(p.tags||[]), ...(p.landscapes||[])]
        .some(v => (v||"").toLowerCase().includes(q))
    );
  }

  const effectiveSort = currentView === "most-used" ? "usage" : sort;
  pool = [...pool].sort((a, b) => {
    if (effectiveSort === "title")   return (a.title||"").localeCompare(b.title||"");
    if (effectiveSort === "usage")   return (b.usageCount||0) - (a.usageCount||0);
    if (effectiveSort === "created") return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return pool;
}

function renderGrid() {
  const grid = document.getElementById("prompt-grid");
  const pool = getFilteredSorted();
  if (!pool.length) {
    grid.innerHTML = `<div class="empty-state"><h3>${t("noPrompts")}</h3><p>${t("noPromptsHint")}</p></div>`;
    return;
  }

  const showSections = currentView === "all" && !document.getElementById("list-search").value.trim();
  if (showSections) {
    const favs = pool.filter(p => p.isFavorite);
    const rest = pool.filter(p => !p.isFavorite);
    let html = "";
    if (favs.length) {
      html += `<div class="grid-section-label">⭐ ${t("favorites")}</div>`;
      html += favs.map(cardHTML).join("");
    }
    if (rest.length) {
      html += `<div class="grid-section-label">${favs.length ? "All Prompts" : t("allPrompts")}</div>`;
      html += rest.map(cardHTML).join("");
    }
    grid.innerHTML = html;
  } else {
    grid.innerHTML = pool.map(cardHTML).join("");
  }

  grid.querySelectorAll(".prompt-card").forEach(card => {
    const id = card.dataset.id;
    card.querySelector(".prompt-card-fav").addEventListener("click", e => { e.stopPropagation(); toggleFav(id); });
    card.querySelector(".card-action-btn.copy").addEventListener("click", e => { e.stopPropagation(); copyPrompt(id); });
    card.querySelector(".card-action-btn.edit").addEventListener("click", e => { e.stopPropagation(); openEdit(id); });
    card.querySelector(".card-action-btn.del").addEventListener("click",  e => { e.stopPropagation(); confirmDelete(id); });
  });
}

function cardHTML(p) {
  const sols = (p.solutions||[]).map(s => `<span class="pill">${esc(s)}</span>`).join("");
  const flow = p.storyFlow ? `<span class="pill flow">${esc(p.storyFlow)}</span>` : "";
  const tags = (p.tags||[]).slice(0,3).map(t => `<span class="pill tag">#${esc(t)}</span>`).join("");
  const favClass = p.isFavorite ? "active" : "";
  const usage = p.usageCount ? `<div class="usage-hint">Used ${p.usageCount}× ${p.lastUsedAt ? "· " + relTime(p.lastUsedAt) : ""}</div>` : "";
  const body = (currentLang === "fr" && p.body_fr) ? p.body_fr : p.body;
  const hasTranslation = p.body_fr ? "" : `<span class="pill lang-missing" title="No French translation yet">EN only</span>`;
  const langBadge = currentLang === "fr" ? (p.body_fr ? `<span class="pill lang-badge fr">FR</span>` : `<span class="pill lang-missing">EN only</span>`) : "";
  return `
    <div class="prompt-card" data-id="${esc(p.id)}">
      <div class="prompt-card-header">
        <div class="prompt-card-title">${esc(p.title)}</div>
        <button class="prompt-card-fav ${favClass}" title="Toggle favorite">★</button>
      </div>
      <div class="prompt-card-body-preview">${esc(body)}</div>
      <div class="prompt-card-meta">${sols}${flow}${tags}${langBadge}</div>
      ${usage}
      <div class="prompt-card-actions">
        <button class="card-action-btn copy">${t("copy")}</button>
        <button class="card-action-btn edit">${t("edit")}</button>
        <button class="card-action-btn del">${t("del")}</button>
      </div>
    </div>`;
}

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

// ── Copy ────────────────────────────────────────────────────────────────────
function copyPrompt(id) {
  const p = allPrompts.find(x => x.id === id);
  if (!p) return;
  const body = (currentLang === "fr" && p.body_fr) ? p.body_fr : p.body;
  navigator.clipboard.writeText(body).then(async () => {
    await StorageAPI.incrementUsage(id);
    allPrompts = await StorageAPI.getAllPrompts();
    renderGrid();
    showToast(t("copied"));
  });
}

// ── Favorite toggle ─────────────────────────────────────────────────────────
async function toggleFav(id) {
  const p = allPrompts.find(x => x.id === id);
  if (!p) return;
  p.isFavorite = !p.isFavorite;
  await StorageAPI.upsertPrompt(p);
  allPrompts = await StorageAPI.getAllPrompts();
  renderGrid();
  updateNavBadges();
}

// ── Edit modal ──────────────────────────────────────────────────────────────
let currentTags = [];
let currentLandscapes = [];

function openEdit(id) {
  const p = id ? allPrompts.find(x => x.id === id) : null;
  editingId = id || null;
  document.getElementById("modal-title").textContent = p ? t("edit") + " Prompt" : t("newPrompt").replace("+ ","");

  document.getElementById("f-title").value    = p?.title || "";
  document.getElementById("f-body-en").value  = p?.body || "";
  document.getElementById("f-body-fr").value  = p?.body_fr || "";
  document.getElementById("f-favorite").checked = p?.isFavorite || false;
  document.getElementById("f-notes").value    = p?.notes || "";

  // Show EN tab by default
  switchBodyTab("en");

  // Update modal labels
  document.getElementById("modal-cancel").textContent = t("cancel");
  document.getElementById("modal-save").textContent   = t("save");
  document.getElementById("f-body-tab-en").textContent = t("bodyTabEn");
  document.getElementById("f-body-tab-fr").textContent = t("bodyTabFr");

  // Rebuild Story Flow dropdown from catalog
  const sfSelect = document.getElementById("f-story-flow");
  sfSelect.innerHTML = `<option value="">${t("selectFlow")}</option>` +
    STORY_FLOWS.map(f => `<option${p?.storyFlow === f ? " selected" : ""}>${esc(f)}</option>`).join("");

  // Rebuild Solutions checkboxes from catalog
  const solGroup = document.getElementById("f-solutions");
  solGroup.innerHTML = SOLUTIONS.map(s => `
    <label>
      <input type="checkbox" value="${esc(s)}"${(p?.solutions||[]).includes(s) ? " checked" : ""}/>
      ${esc(s)}
    </label>`).join("");

  // Tags
  currentTags = [...(p?.tags || [])];
  renderTagChips();

  // Landscapes
  const allLandscapes = [...new Set([...LANDSCAPES, ...(p?.landscapes||[])])];
  currentLandscapes = [...(p?.landscapes || [])];
  renderLandscapeRows(allLandscapes);

  updateBodyCount();
  document.getElementById("modal-backdrop").style.display = "flex";
  document.getElementById("f-title").focus();
}

function switchBodyTab(lang) {
  document.getElementById("f-body-en").style.display = lang === "en" ? "" : "none";
  document.getElementById("f-body-fr").style.display = lang === "fr" ? "" : "none";
  document.getElementById("f-body-tab-en").classList.toggle("active-tab", lang === "en");
  document.getElementById("f-body-tab-fr").classList.toggle("active-tab", lang === "fr");
}

function updateBodyCount() {
  const en = document.getElementById("f-body-en")?.value || "";
  const fr = document.getElementById("f-body-fr")?.value || "";
  const active = document.getElementById("f-body-fr")?.style.display === "none" ? en : fr;
  document.getElementById("f-body-count").textContent = `${active.length} chars`;
}

function renderTagChips() {
  const wrap = document.getElementById("tag-input-wrap");
  // Remove existing chips (keep the input)
  wrap.querySelectorAll(".tag-chip").forEach(el => el.remove());
  const input = document.getElementById("f-tag-input");
  currentTags.forEach(tag => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.innerHTML = `${esc(tag)} <span class="tag-chip-remove" data-tag="${esc(tag)}">×</span>`;
    chip.querySelector(".tag-chip-remove").addEventListener("click", () => {
      currentTags = currentTags.filter(t => t !== tag);
      renderTagChips();
    });
    wrap.insertBefore(chip, input);
  });
}

function renderLandscapeRows(catalogLandscapes) {
  const catalog = catalogLandscapes || LANDSCAPES;
  const container = document.getElementById("f-landscapes-list");
  // Rebuild datalist
  let dl = document.getElementById("landscape-datalist");
  if (!dl) { dl = document.createElement("datalist"); dl.id = "landscape-datalist"; document.body.appendChild(dl); }
  dl.innerHTML = catalog.map(l => `<option value="${esc(l)}"/>`).join("");

  container.innerHTML = currentLandscapes.map((l, i) => `
    <div class="landscape-row" data-idx="${i}">
      <input type="text" list="landscape-datalist" value="${esc(l)}" placeholder="e.g. https://my12345.ibpcloud.sap.com"/>
      <button class="landscape-remove" title="Remove">×</button>
    </div>`).join("");
  container.querySelectorAll(".landscape-row").forEach(row => {
    const idx = parseInt(row.dataset.idx);
    row.querySelector("input").addEventListener("input", e => { currentLandscapes[idx] = e.target.value; });
    row.querySelector(".landscape-remove").addEventListener("click", () => {
      currentLandscapes.splice(idx, 1);
      renderLandscapeRows();
    });
  });
}

function closeModal() {
  document.getElementById("modal-backdrop").style.display = "none";
  editingId = null;
}

async function savePrompt() {
  const title  = document.getElementById("f-title").value.trim();
  const body   = document.getElementById("f-body-en").value.trim();
  const bodyFr = document.getElementById("f-body-fr").value.trim();
  if (!title || !body) { alert(currentLang === "fr" ? "Le titre et le corps (EN) sont obligatoires." : "Title and Prompt Body (EN) are required."); return; }

  const solutions = Array.from(document.querySelectorAll("#f-solutions input:checked")).map(cb => cb.value);
  const storyFlow  = document.getElementById("f-story-flow").value;
  const isFavorite = document.getElementById("f-favorite").checked;
  const notes = document.getElementById("f-notes").value.trim();
  const landscapes = currentLandscapes.filter(l => l.trim());

  const now = new Date().toISOString();
  const existing = editingId ? allPrompts.find(p => p.id === editingId) : null;

  const prompt = {
    id:         editingId || crypto.randomUUID(),
    title, body, body_fr: bodyFr || null, notes, storyFlow, solutions, landscapes,
    tags:       currentTags,
    isFavorite,
    usageCount: existing?.usageCount || 0,
    lastUsedAt: existing?.lastUsedAt || null,
    createdAt:  existing?.createdAt || now,
    updatedAt:  now
  };

  await StorageAPI.upsertPrompt(prompt);
  allPrompts = await StorageAPI.getAllPrompts();
  buildSidebarFlows();
  buildSidebarSolutions();
  updateNavBadges();
  renderGrid();
  closeModal();
  showToast(editingId ? t("promptUpdated") : t("promptCreated"));
}

// ── Delete ──────────────────────────────────────────────────────────────────
function confirmDelete(id) {
  const p = allPrompts.find(x => x.id === id);
  document.getElementById("confirm-msg").textContent = `Delete "${p?.title || "this prompt"}"?`;
  pendingDeleteId = id;
  document.getElementById("confirm-backdrop").style.display = "flex";
}

async function doDelete() {
  if (!pendingDeleteId) return;
  await StorageAPI.deletePrompt(pendingDeleteId);
  allPrompts = await StorageAPI.getAllPrompts();
  buildSidebarFlows();
  buildSidebarSolutions();
  updateNavBadges();
  renderGrid();
  pendingDeleteId = null;
  document.getElementById("confirm-backdrop").style.display = "none";
  showToast("Prompt deleted");
}

// ── Admin panels (Solutions / Story Flows / Landscapes) ────────────────────

function renderAdminPanels() {
  renderAdminList("admin-solutions-list",  SOLUTIONS,  "solution");
  renderAdminList("admin-flows-list",      STORY_FLOWS, "flow");
  renderAdminList("admin-landscapes-list", LANDSCAPES,  "landscape");
}

function inUseCount(type, value) {
  if (type === "solution")  return allPrompts.filter(p => (p.solutions||[]).includes(value)).length;
  if (type === "flow")      return allPrompts.filter(p => p.storyFlow === value).length;
  if (type === "landscape") return allPrompts.filter(p => (p.landscapes||[]).includes(value)).length;
  return 0;
}

function renderAdminList(containerId, items, type) {
  const el = document.getElementById(containerId);
  if (!items.length) {
    el.innerHTML = `<div class="admin-empty">${t("noItems")}</div>`;
    return;
  }
  el.innerHTML = items.map((item, idx) => {
    const count = inUseCount(type, item);
    return `
      <div class="admin-row" data-idx="${idx}" data-type="${type}">
        <span class="admin-drag-handle" title="Drag to reorder">⠿</span>
        <input class="admin-item-input" type="text" value="${esc(item)}" data-original="${esc(item)}"/>
        <span class="admin-in-use ${count ? 'has-uses' : ''}" title="${count} prompt${count !== 1 ? 's' : ''} use this">
          ${count ? t("promptsCount", count) : t("unused")}
        </span>
        <button class="admin-save-btn" title="Save rename" style="display:none">✓</button>
        <button class="admin-del-btn ${count ? 'has-uses' : ''}" title="${count ? t("usedBy", count) : t("del")}">✕</button>
      </div>`;
  }).join("");

  // Bind inline edit events
  el.querySelectorAll(".admin-row").forEach(row => {
    const idx   = parseInt(row.dataset.idx);
    const input = row.querySelector(".admin-item-input");
    const saveBtn = row.querySelector(".admin-save-btn");
    const delBtn  = row.querySelector(".admin-del-btn");

    input.addEventListener("input", () => {
      const changed = input.value.trim() !== input.dataset.original;
      saveBtn.style.display = changed ? "" : "none";
    });

    saveBtn.addEventListener("click", () => renameItem(type, idx, input.value.trim()));

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") renameItem(type, idx, input.value.trim());
      if (e.key === "Escape") {
        input.value = input.dataset.original;
        saveBtn.style.display = "none";
      }
    });

    delBtn.addEventListener("click", () => deleteItem(type, idx));
  });

  // Drag-to-reorder
  bindDragReorder(el, type);
}

function getList(type) {
  if (type === "solution")  return SOLUTIONS;
  if (type === "flow")      return STORY_FLOWS;
  if (type === "landscape") return LANDSCAPES;
}

async function persistCatalog() {
  await StorageAPI.saveCatalog({ solutions: SOLUTIONS, storyFlows: STORY_FLOWS, landscapes: LANDSCAPES });
}

async function addItem(type, value) {
  const list = getList(type);
  const v = value.trim();
  if (!v) return;
  if (list.includes(v)) { showToast(t("alreadyExists")); return; }
  list.push(v);
  await persistCatalog();
  renderAdminPanels();
  refreshAfterCatalogChange();
  showToast(t("added", v));
}

async function renameItem(type, idx, newVal) {
  const list = getList(type);
  const oldVal = list[idx];
  if (!newVal) return;
  if (newVal === oldVal) return;
  if (list.includes(newVal)) { showToast(t("nameExists")); return; }

  list[idx] = newVal;
  await persistCatalog();

  // Cascade rename in all prompts
  const prompts = await StorageAPI.getAllPrompts();
  let changed = false;
  prompts.forEach(p => {
    if (type === "flow" && p.storyFlow === oldVal) { p.storyFlow = newVal; changed = true; }
    if (type === "solution") {
      const i = (p.solutions||[]).indexOf(oldVal);
      if (i >= 0) { p.solutions[i] = newVal; changed = true; }
    }
    if (type === "landscape") {
      const i = (p.landscapes||[]).indexOf(oldVal);
      if (i >= 0) { p.landscapes[i] = newVal; changed = true; }
    }
  });
  if (changed) await chrome.storage.local.set({ prompts });
  allPrompts = await StorageAPI.getAllPrompts();

  renderAdminPanels();
  refreshAfterCatalogChange();
  showToast(t("renamed", newVal));
}

async function deleteItem(type, idx) {
  const list = getList(type);
  const val = list[idx];
  const count = inUseCount(type, val);

  if (count > 0) {
    const ok = confirm(t("deleteConfirm", val, count));
    if (!ok) return;
    // Remove from all prompts
    const prompts = await StorageAPI.getAllPrompts();
    prompts.forEach(p => {
      if (type === "flow" && p.storyFlow === val) p.storyFlow = "";
      if (type === "solution") p.solutions = (p.solutions||[]).filter(s => s !== val);
      if (type === "landscape") p.landscapes = (p.landscapes||[]).filter(l => l !== val);
    });
    await chrome.storage.local.set({ prompts });
    allPrompts = await StorageAPI.getAllPrompts();
  }

  list.splice(idx, 1);
  await persistCatalog();
  renderAdminPanels();
  refreshAfterCatalogChange();
  showToast(t("deleted", val));
}

function bindDragReorder(container, type) {
  let dragIdx = null;

  container.querySelectorAll(".admin-row").forEach(row => {
    row.setAttribute("draggable", "true");

    row.addEventListener("dragstart", () => {
      dragIdx = parseInt(row.dataset.idx);
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      container.querySelectorAll(".admin-row").forEach(r => r.classList.remove("drag-over"));
    });

    row.addEventListener("dragover", e => {
      e.preventDefault();
      container.querySelectorAll(".admin-row").forEach(r => r.classList.remove("drag-over"));
      row.classList.add("drag-over");
    });

    row.addEventListener("drop", async e => {
      e.preventDefault();
      const dropIdx = parseInt(row.dataset.idx);
      if (dragIdx === null || dragIdx === dropIdx) return;
      const list = getList(type);
      const [moved] = list.splice(dragIdx, 1);
      list.splice(dropIdx, 0, moved);
      await persistCatalog();
      renderAdminPanels();
      refreshAfterCatalogChange();
    });
  });
}

function refreshAfterCatalogChange() {
  buildSidebarFlows();
  buildSidebarSolutions();
  renderGrid();
  updateNavBadges();
}

// ── Admin inline-add (triggered by "+ Add" buttons) ────────────────────────
function promptAddItem(type, containerId) {
  const container = document.getElementById(containerId);
  // Remove any existing inline-add row
  container.querySelector(".admin-add-row")?.remove();

  const row = document.createElement("div");
  row.className = "admin-row admin-add-row";
  row.innerHTML = `
    <span class="admin-drag-handle" style="visibility:hidden">⠿</span>
    <input class="admin-item-input" type="text" placeholder="${t("add")}…" style="border-color:#0070F2"/>
    <button class="action-btn primary admin-confirm-add">${t("add")}</button>
    <button class="action-btn admin-cancel-add">${t("cancel")}</button>`;
  container.appendChild(row);

  const input = row.querySelector(".admin-item-input");
  input.focus();

  row.querySelector(".admin-confirm-add").addEventListener("click", async () => {
    await addItem(type, input.value);
  });
  row.querySelector(".admin-cancel-add").addEventListener("click", () => row.remove());
  input.addEventListener("keydown", async e => {
    if (e.key === "Enter") await addItem(type, input.value);
    if (e.key === "Escape") row.remove();
  });
}

// ── Nav / View switching ────────────────────────────────────────────────────
function setView(view) {
  currentView = view;
  const showList = !["import-export", "settings"].includes(view);
  document.getElementById("view-list").style.display          = showList ? "" : "none";
  document.getElementById("list-toolbar").style.display       = showList ? "" : "none";
  document.getElementById("view-import-export").style.display = view === "import-export" ? "" : "none";
  document.getElementById("view-settings").style.display      = view === "settings"      ? "" : "none";
  if (view === "settings") renderAdminPanels();
}

function setActiveNav(btn) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  btn.classList.add("active");
}

function updateNavBadges() {
  document.getElementById("nav-count-all").textContent       = allPrompts.length;
  document.getElementById("nav-count-favs").textContent      = allPrompts.filter(p => p.isFavorite).length;
  const usedCount = allPrompts.filter(p => (p.usageCount || 0) > 0).length;
  document.getElementById("nav-count-most-used").textContent = usedCount;
}

// ── Settings ────────────────────────────────────────────────────────────────
async function loadSettings() {
  const s = await StorageAPI.getSettings();
  document.getElementById("setting-auto-filter").checked = s.autoFilterEnabled !== false;
}

async function saveSettings() {
  const autoFilterEnabled = document.getElementById("setting-auto-filter").checked;
  await StorageAPI.saveSettings({ autoFilterEnabled, lang: currentLang });
  showToast(t("settingsSaved"));
}

// ── Import / Export ─────────────────────────────────────────────────────────
async function doExport() {
  const data = await StorageAPI.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "sap-prompts-export.json"; a.click();
  URL.revokeObjectURL(url);
}

function doImportFlow() {
  document.getElementById("do-import-input").click();
}

async function handleImportFile(file) {
  const status = document.getElementById("import-status");
  status.style.display = "";
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const mode = document.querySelector("input[name=import-mode]:checked").value;
    const result = await StorageAPI.importAll(data, mode);
    allPrompts = await StorageAPI.getAllPrompts();
    buildSidebarFlows();
    buildSidebarSolutions();
    updateNavBadges();
    status.className = "import-status success";
    status.textContent = t("importOk", result.imported, result.skipped);
  } catch (e) {
    status.className = "import-status error";
    status.textContent = "Error: " + e.message;
  }
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastEl = null;
let toastTimer;
function showToast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.style.cssText = `
      position:fixed;bottom:24px;right:24px;background:#1D2D3E;color:#fff;
      font-size:13px;padding:10px 18px;border-radius:8px;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:9999;
      transition:opacity 0.2s;opacity:0;pointer-events:none;font-family:inherit`;
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.style.opacity = "0"; }, 2200);
}

// ── Event binding ────────────────────────────────────────────────────────────
function bindEvents() {
  // Top bar
  document.getElementById("btn-new-prompt").addEventListener("click", () => openEdit(null));
  document.getElementById("btn-export").addEventListener("click", doExport);
  document.getElementById("btn-import").addEventListener("click", () => document.getElementById("import-file-input").click());
  document.getElementById("import-file-input").addEventListener("change", e => {
    if (e.target.files[0]) handleImportFile(e.target.files[0]);
    e.target.value = "";
  });

  // Search & sort
  document.getElementById("list-search").addEventListener("input", renderGrid);
  document.getElementById("sort-select").addEventListener("change", renderGrid);

  // Sidebar static items
  document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
    if (btn.dataset.view === "flow" || btn.dataset.view === "solution") return;
    btn.addEventListener("click", () => {
      setActiveNav(btn);
      currentFilter = { storyFlow: null, solution: null };
      setView(btn.dataset.view);
      renderGrid();
    });
  });

  // Modal
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", savePrompt);
  document.getElementById("modal-backdrop").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-backdrop")) closeModal();
  });

  // Language toggle
  document.getElementById("lang-toggle").addEventListener("click", async () => {
    currentLang = currentLang === "en" ? "fr" : "en";
    await StorageAPI.saveSettings({ lang: currentLang });
    applyLang();
    buildSidebarFlows();
    buildSidebarSolutions();
    renderGrid();
    renderAdminPanels();
  });

  // Body char count
  document.getElementById("f-body-en").addEventListener("input", updateBodyCount);
  document.getElementById("f-body-fr").addEventListener("input", updateBodyCount);

  // Body language tabs
  document.getElementById("f-body-tab-en").addEventListener("click", () => switchBodyTab("en"));
  document.getElementById("f-body-tab-fr").addEventListener("click", () => switchBodyTab("fr"));

  // Tag input
  document.getElementById("f-tag-input").addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.target.value.trim().replace(/,$/, "");
      if (val && !currentTags.includes(val)) {
        currentTags.push(val);
        renderTagChips();
      }
      e.target.value = "";
    } else if (e.key === "Backspace" && !e.target.value && currentTags.length) {
      currentTags.pop();
      renderTagChips();
    }
  });

  // Landscape
  document.getElementById("f-add-landscape").addEventListener("click", () => {
    currentLandscapes.push("");
    renderLandscapeRows();
  });

  // Confirm dialog
  document.getElementById("confirm-cancel").addEventListener("click", () => {
    pendingDeleteId = null;
    document.getElementById("confirm-backdrop").style.display = "none";
  });
  document.getElementById("confirm-ok").addEventListener("click", doDelete);
  document.getElementById("confirm-backdrop").addEventListener("click", e => {
    if (e.target === document.getElementById("confirm-backdrop")) {
      pendingDeleteId = null;
      document.getElementById("confirm-backdrop").style.display = "none";
    }
  });

  // Import/Export view buttons
  document.getElementById("do-export").addEventListener("click", doExport);
  document.getElementById("do-import-btn").addEventListener("click", doImportFlow);
  document.getElementById("do-import-input").addEventListener("change", e => {
    if (e.target.files[0]) handleImportFile(e.target.files[0]);
    e.target.value = "";
  });

  // Settings save
  document.getElementById("do-save-settings").addEventListener("click", saveSettings);

  // Admin: add buttons
  document.getElementById("btn-add-solution").addEventListener("click", () =>
    promptAddItem("solution", "admin-solutions-list"));
  document.getElementById("btn-add-flow").addEventListener("click", () =>
    promptAddItem("flow", "admin-flows-list"));
  document.getElementById("btn-add-landscape-admin").addEventListener("click", () =>
    promptAddItem("landscape", "admin-landscapes-list"));

  // Keyboard
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (document.getElementById("modal-backdrop").style.display !== "none") closeModal();
      if (document.getElementById("confirm-backdrop").style.display !== "none") {
        pendingDeleteId = null;
        document.getElementById("confirm-backdrop").style.display = "none";
      }
    }
  });
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

init();

"use strict";

// StorageAPI is loaded via <script src="../shared/storage.js"> before this file

// These are populated from storage on init — no longer hardcoded constants
let STORY_FLOWS = [];
let SOLUTIONS   = [];
let LANDSCAPES  = [];

let allPrompts = [];
let editingId  = null;
let currentView = "all";
let currentFilter = { storyFlow: null, solution: null };
let pendingDeleteId = null;

// ── Startup ────────────────────────────────────────────────────────────────
async function init() {
  const [prompts, catalog] = await Promise.all([
    StorageAPI.getAllPrompts(),
    StorageAPI.getCatalog()
  ]);
  allPrompts = prompts;
  STORY_FLOWS = catalog.storyFlows;
  SOLUTIONS   = catalog.solutions;
  LANDSCAPES  = catalog.landscapes;

  buildSidebarFlows();
  buildSidebarSolutions();
  renderGrid();
  updateNavBadges();
  loadSettings();
  renderAdminPanels();
  bindEvents();
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
  if (currentView === "flow")       pool = pool.filter(p => p.storyFlow === currentFilter.storyFlow);
  if (currentView === "solution")   pool = pool.filter(p => (p.solutions||[]).includes(currentFilter.solution));

  if (q) {
    pool = pool.filter(p =>
      [p.title, p.body, p.notes, p.storyFlow, ...(p.solutions||[]), ...(p.tags||[]), ...(p.landscapes||[])]
        .some(v => (v||"").toLowerCase().includes(q))
    );
  }

  pool = [...pool].sort((a, b) => {
    if (sort === "title")   return (a.title||"").localeCompare(b.title||"");
    if (sort === "usage")   return (b.usageCount||0) - (a.usageCount||0);
    if (sort === "created") return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return pool;
}

function renderGrid() {
  const grid = document.getElementById("prompt-grid");
  const pool = getFilteredSorted();
  if (!pool.length) {
    grid.innerHTML = `<div class="empty-state"><h3>No prompts found</h3><p>Try a different search or create a new prompt with the "+ New Prompt" button.</p></div>`;
    return;
  }
  grid.innerHTML = pool.map(cardHTML).join("");
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
  return `
    <div class="prompt-card" data-id="${esc(p.id)}">
      <div class="prompt-card-header">
        <div class="prompt-card-title">${esc(p.title)}</div>
        <button class="prompt-card-fav ${favClass}" title="Toggle favorite">★</button>
      </div>
      <div class="prompt-card-body-preview">${esc(p.body)}</div>
      <div class="prompt-card-meta">${sols}${flow}${tags}</div>
      ${usage}
      <div class="prompt-card-actions">
        <button class="card-action-btn copy">Copy</button>
        <button class="card-action-btn edit">Edit</button>
        <button class="card-action-btn del">Delete</button>
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
  navigator.clipboard.writeText(p.body).then(async () => {
    await StorageAPI.incrementUsage(id);
    allPrompts = await StorageAPI.getAllPrompts();
    renderGrid();
    showToast("Copied to clipboard ✓");
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
  document.getElementById("modal-title").textContent = p ? "Edit Prompt" : "New Prompt";
  document.getElementById("f-title").value = p?.title || "";
  document.getElementById("f-body").value = p?.body || "";
  document.getElementById("f-favorite").checked = p?.isFavorite || false;
  document.getElementById("f-notes").value = p?.notes || "";

  // Rebuild Story Flow dropdown from catalog
  const sfSelect = document.getElementById("f-story-flow");
  sfSelect.innerHTML = `<option value="">— Select —</option>` +
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

  // Landscapes — populate from catalog + prompt's own values merged
  const allLandscapes = [...new Set([...LANDSCAPES, ...(p?.landscapes||[])])];
  currentLandscapes = [...(p?.landscapes || [])];
  renderLandscapeRows(allLandscapes);

  updateBodyCount();
  document.getElementById("modal-backdrop").style.display = "flex";
  document.getElementById("f-title").focus();
}

function updateBodyCount() {
  const v = document.getElementById("f-body").value;
  document.getElementById("f-body-count").textContent = `${v.length} chars`;
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
  const title = document.getElementById("f-title").value.trim();
  const body  = document.getElementById("f-body").value.trim();
  if (!title || !body) { alert("Title and Prompt Body are required."); return; }

  const solutions = Array.from(document.querySelectorAll("#f-solutions input:checked")).map(cb => cb.value);
  const storyFlow = document.getElementById("f-story-flow").value;
  const isFavorite = document.getElementById("f-favorite").checked;
  const notes = document.getElementById("f-notes").value.trim();
  const landscapes = currentLandscapes.filter(l => l.trim());

  const now = new Date().toISOString();
  const existing = editingId ? allPrompts.find(p => p.id === editingId) : null;

  const prompt = {
    id:         editingId || crypto.randomUUID(),
    title, body, notes, storyFlow, solutions, landscapes,
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
  showToast(editingId ? "Prompt updated ✓" : "Prompt created ✓");
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
    el.innerHTML = `<div class="admin-empty">No items yet. Click "+ Add" to create one.</div>`;
    return;
  }
  el.innerHTML = items.map((item, idx) => {
    const count = inUseCount(type, item);
    return `
      <div class="admin-row" data-idx="${idx}" data-type="${type}">
        <span class="admin-drag-handle" title="Drag to reorder">⠿</span>
        <input class="admin-item-input" type="text" value="${esc(item)}" data-original="${esc(item)}"/>
        <span class="admin-in-use ${count ? 'has-uses' : ''}" title="${count} prompt${count !== 1 ? 's' : ''} use this">
          ${count ? `${count} prompt${count !== 1 ? 's' : ''}` : 'unused'}
        </span>
        <button class="admin-save-btn" title="Save rename" style="display:none">✓</button>
        <button class="admin-del-btn ${count ? 'has-uses' : ''}" title="${count ? `Used by ${count} prompt${count !== 1 ? 's' : ''} — will be removed from them` : 'Delete'}">✕</button>
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
  if (list.includes(v)) { showToast("Already exists"); return; }
  list.push(v);
  await persistCatalog();
  renderAdminPanels();
  refreshAfterCatalogChange();
  showToast(`"${v}" added`);
}

async function renameItem(type, idx, newVal) {
  const list = getList(type);
  const oldVal = list[idx];
  if (!newVal) return;
  if (newVal === oldVal) return;
  if (list.includes(newVal)) { showToast("Name already exists"); return; }

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
  showToast(`Renamed to "${newVal}"`);
}

async function deleteItem(type, idx) {
  const list = getList(type);
  const val = list[idx];
  const count = inUseCount(type, val);

  if (count > 0) {
    const ok = confirm(`"${val}" is used by ${count} prompt${count !== 1 ? 's' : ''}.\nDeleting it will remove it from those prompts. Continue?`);
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
  showToast(`"${val}" deleted`);
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
    <input class="admin-item-input" type="text" placeholder="Enter name…" style="border-color:#0070F2"/>
    <button class="action-btn primary admin-confirm-add">Add</button>
    <button class="action-btn admin-cancel-add">Cancel</button>`;
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
  document.getElementById("nav-count-all").textContent  = allPrompts.length;
  document.getElementById("nav-count-favs").textContent = allPrompts.filter(p => p.isFavorite).length;
}

// ── Settings ────────────────────────────────────────────────────────────────
async function loadSettings() {
  const s = await StorageAPI.getSettings();
  document.getElementById("setting-auto-filter").checked = s.autoFilterEnabled !== false;
}

async function saveSettings() {
  const autoFilterEnabled = document.getElementById("setting-auto-filter").checked;
  await StorageAPI.saveSettings({ autoFilterEnabled });
  showToast("Settings saved ✓");
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
    status.textContent = `✓ Imported ${result.imported} prompts${result.skipped ? `, skipped ${result.skipped} duplicates` : ""}.`;
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

  // Body char count
  document.getElementById("f-body").addEventListener("input", updateBodyCount);

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

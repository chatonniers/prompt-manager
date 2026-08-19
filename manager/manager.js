"use strict";

// StorageAPI is loaded via <script src="../shared/storage.js"> before this file

const STORY_FLOWS = ["Procure-to-Pay","Order-to-Cash","Plan-to-Inventory","Hire-to-Retire","Record-to-Report","Lead-to-Cash","Design-to-Operate","Other"];
const SOLUTIONS   = ["S/4HANA","IBP","Ariba","Joule","Joule Studio","BTP","Datasphere","SuccessFactors"];

let allPrompts = [];
let editingId  = null;
let currentView = "all";
let currentFilter = { storyFlow: null, solution: null };
let pendingDeleteId = null;

// ── Startup ────────────────────────────────────────────────────────────────
async function init() {
  allPrompts = await StorageAPI.getAllPrompts();
  buildSidebarFlows();
  buildSidebarSolutions();
  renderGrid();
  updateNavBadges();
  loadSettings();
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
  document.getElementById("f-story-flow").value = p?.storyFlow || "";
  document.getElementById("f-favorite").checked = p?.isFavorite || false;
  document.getElementById("f-notes").value = p?.notes || "";

  // Solutions checkboxes
  document.querySelectorAll("#f-solutions input[type=checkbox]").forEach(cb => {
    cb.checked = (p?.solutions || []).includes(cb.value);
  });

  // Tags
  currentTags = [...(p?.tags || [])];
  renderTagChips();

  // Landscapes
  currentLandscapes = [...(p?.landscapes || [])];
  renderLandscapeRows();

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

function renderLandscapeRows() {
  const container = document.getElementById("f-landscapes-list");
  container.innerHTML = currentLandscapes.map((l, i) => `
    <div class="landscape-row" data-idx="${i}">
      <input type="text" value="${esc(l)}" placeholder="e.g. https://my12345.ibpcloud.sap.com"/>
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

// ── Nav / View switching ────────────────────────────────────────────────────
function setView(view) {
  currentView = view;
  const showList = !["import-export", "settings"].includes(view);
  document.getElementById("view-list").style.display          = showList ? "" : "none";
  document.getElementById("list-toolbar").style.display       = showList ? "" : "none";
  document.getElementById("view-import-export").style.display = view === "import-export" ? "" : "none";
  document.getElementById("view-settings").style.display      = view === "settings"      ? "" : "none";
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

"use strict";

const SAP_URL_RULES_POPUP = [
  { solution: "Joule Studio", patterns: [/joule-studio/i, /build\.joule\.cloud\.sap/i] },
  { solution: "Joule",        patterns: [/joule\.cloud\.sap/i, /\/joule\//i] },
  { solution: "IBP",          patterns: [/ibpcloud\.sap/i, /ibp\.cloud\.sap/i, /sapibp/i] },
  { solution: "Ariba",        patterns: [/ariba\.com/i, /businessnetwork\.sap/i] },
  { solution: "S/4HANA",      patterns: [/s4hana\.cloud\.sap/i] },
  { solution: "BTP",          patterns: [/cockpit\.btp\.cloud\.sap/i, /\.btp\.cloud\.sap/i] },
  { solution: "Datasphere",   patterns: [/datasphere\.cloud\.sap/i] },
  { solution: "SuccessFactors", patterns: [/successfactors\.com/i] },
  { solution: "SAP",          patterns: [/\.sap\.com/i, /\.sapcloud\.io/i, /\.hana\.ondemand\.com/i] }
];

function popupDetect(url) {
  if (!url) return null;
  for (const r of SAP_URL_RULES_POPUP) {
    if (r.patterns.some(p => p.test(url))) return r.solution;
  }
  return null;
}

function scorePopup(p, q) {
  if (!q) return 1;
  const ql = q.toLowerCase();
  let s = 0;
  if ((p.title||"").toLowerCase().includes(ql)) s += 10;
  if ((p.solutions||[]).join(" ").toLowerCase().includes(ql)) s += 7;
  if ((p.tags||[]).join(" ").toLowerCase().includes(ql)) s += 6;
  if ((p.body||"").toLowerCase().includes(ql)) s += 4;
  return s;
}

function cardHTML(p) {
  const sol = p.solutions && p.solutions.length ? p.solutions[0] : "";
  return `<div class="popup-card" data-id="${esc(p.id)}" title="${esc(p.body.slice(0,100))}">
    <span class="popup-card-title">${esc(p.title)}</span>
    ${sol ? `<span class="popup-card-solution">${esc(sol)}</span>` : ""}
  </div>`;
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

let allPrompts = [];

function renderSection(containerId, prompts, emptyText) {
  const el = document.getElementById(containerId);
  if (!prompts.length) {
    el.innerHTML = `<div class="popup-empty">${emptyText}</div>`;
    return;
  }
  el.innerHTML = prompts.map(cardHTML).join("");
  el.querySelectorAll(".popup-card").forEach(card => {
    card.addEventListener("click", () => copyAndClose(card.dataset.id));
  });
}

function copyAndClose(id) {
  const p = allPrompts.find(x => x.id === id);
  if (!p) return;
  navigator.clipboard.writeText(p.body).then(() => {
    chrome.runtime.sendMessage({ type: "INCREMENT_USAGE", id });
    window.close();
  }).catch(() => window.close());
}

function renderSearch(query) {
  const labelResults = document.getElementById("label-results");
  const resultsEl = document.getElementById("popup-results");
  const labelFavs = document.getElementById("label-favs");
  const labelRecent = document.getElementById("label-recent");
  const favsEl = document.getElementById("popup-favs");
  const recentEl = document.getElementById("popup-recent");

  if (query.trim()) {
    labelFavs.style.display = "none";
    labelRecent.style.display = "none";
    favsEl.style.display = "none";
    recentEl.style.display = "none";
    labelResults.style.display = "";

    const ranked = allPrompts
      .map(p => ({ p, s: scorePopup(p, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map(x => x.p);
    renderSection("popup-results", ranked, "No prompts match.");
  } else {
    labelFavs.style.display = "";
    labelRecent.style.display = "";
    favsEl.style.display = "";
    recentEl.style.display = "";
    labelResults.style.display = "none";
    resultsEl.innerHTML = "";

    const favs = allPrompts.filter(p => p.isFavorite).slice(0, 5);
    const recent = allPrompts
      .filter(p => p.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
      .slice(0, 3);
    renderSection("popup-favs", favs, "No favorites yet — star prompts to pin them here.");
    renderSection("popup-recent", recent, "No prompts used yet.");
  }
}

async function init() {
  // Detect current tab SAP context
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const solution = popupDetect(tab?.url || "");
  const badge = document.getElementById("popup-badge");
  if (solution) {
    badge.textContent = solution;
    badge.style.display = "";
  }

  // Load prompts
  allPrompts = await new Promise(res => chrome.runtime.sendMessage({ type: "GET_PROMPTS" }, res)) || [];

  renderSearch("");

  document.getElementById("popup-search").addEventListener("input", e => renderSearch(e.target.value));

  document.getElementById("popup-open-manager").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("manager/manager.html") });
    window.close();
  });
}

init();

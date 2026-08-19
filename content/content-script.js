// Content script — injects floating overlay into host page
// url-detector.js and search.js are loaded before this file by manifest (shared scope)

(function () {
  "use strict";

  const OVERLAY_ID = "sap-pm-overlay";
  const TOAST_ID   = "sap-pm-toast";

  let overlayEl = null;
  let toastEl   = null;
  let sessionShowAll = false;

  function ensureOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    overlayEl = buildOverlay();
    document.body.appendChild(overlayEl);
    toastEl = buildToast();
    document.body.appendChild(toastEl);
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) hideOverlay();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlayEl.classList.contains("sap-pm-visible")) hideOverlay();
    });
  }

  function buildOverlay() {
    const el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.innerHTML = `
      <div id="sap-pm-panel">
        <div id="sap-pm-header">
          <div class="sap-pm-logo">
            Prompt Manager
          </div>
          <div class="sap-pm-context-badge" id="sap-pm-badge" style="display:none"></div>
          <button class="sap-pm-close-btn" id="sap-pm-close" title="Close (Esc)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div id="sap-pm-search-bar">
          <input id="sap-pm-search-input" type="text" placeholder="Search prompts…" autocomplete="off" spellcheck="false"/>
          <div id="sap-pm-context-strip"></div>
        </div>
        <div id="sap-pm-list"></div>
        <div id="sap-pm-footer">
          <button class="sap-pm-manage-btn" id="sap-pm-manage">Manage Prompts →</button>
          <span class="sap-pm-count" id="sap-pm-count"></span>
        </div>
      </div>`;

    el.querySelector("#sap-pm-close").addEventListener("click", hideOverlay);
    el.querySelector("#sap-pm-manage").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "OPEN_MANAGER" });
      hideOverlay();
    });
    el.querySelector("#sap-pm-search-input").addEventListener("input", (e) => {
      renderList(e.target.value);
    });
    return el;
  }

  function buildToast() {
    const t = document.createElement("div");
    t.id = TOAST_ID;
    return t;
  }

  let _prompts = [];
  let _context = null;

  async function showOverlay() {
    ensureOverlay();
    overlayEl = document.getElementById(OVERLAY_ID);
    toastEl   = document.getElementById(TOAST_ID);

    _context = detectSAPContext(window.location.href);

    chrome.runtime.sendMessage({ type: "GET_PROMPTS" }, (prompts) => {
      _prompts = prompts || [];
      updateContextBadge();
      renderList("");
      overlayEl.classList.add("sap-pm-visible");
      document.getElementById("sap-pm-search-input").focus();
    });
  }

  function hideOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove("sap-pm-visible");
    const input = document.getElementById("sap-pm-search-input");
    if (input) input.value = "";
    sessionShowAll = false;
  }

  function updateContextBadge() {
    const badge = document.getElementById("sap-pm-badge");
    if (_context && _context.detected) {
      badge.textContent = _context.solution;
      badge.style.display = "";
    } else {
      badge.style.display = "none";
    }
  }

  function renderList(query) {
    const list = document.getElementById("sap-pm-list");
    const strip = document.getElementById("sap-pm-context-strip");
    const countEl = document.getElementById("sap-pm-count");
    if (!list) return;

    const ranked = filterAndRank(_prompts, query, _context, sessionShowAll || !!query.trim());
    const total = _prompts.length;

    // Context strip
    if (_context && _context.detected && !query.trim()) {
      const shown = ranked.length;
      strip.innerHTML = `
        <span class="sap-pm-filter-info">
          ${_context.solution} detected — ${sessionShowAll ? "showing all" : `${shown} of ${total}`} prompts
        </span>
        ${!sessionShowAll ? `<button class="sap-pm-show-all-btn" id="sap-pm-show-all">Show all</button>` : ""}
      `;
      const showAllBtn = strip.querySelector("#sap-pm-show-all");
      if (showAllBtn) {
        showAllBtn.addEventListener("click", () => {
          sessionShowAll = true;
          renderList(document.getElementById("sap-pm-search-input").value);
        });
      }
    } else {
      strip.innerHTML = "";
    }

    countEl.textContent = `${ranked.length} prompt${ranked.length !== 1 ? "s" : ""}`;

    if (ranked.length === 0) {
      list.innerHTML = `<div class="sap-pm-empty">No prompts found.<br><small>Try a different search or add prompts in the Manager.</small></div>`;
      return;
    }

    // Group favorites at top with section label if any
    const favs = ranked.filter(p => p.isFavorite);
    const rest  = ranked.filter(p => !p.isFavorite);

    let html = "";
    if (favs.length > 0 && rest.length > 0) {
      html += `<div class="sap-pm-section-label">⭐ Favorites</div>`;
      favs.forEach(p => { html += cardHTML(p); });
      html += `<div class="sap-pm-section-label">All Prompts</div>`;
      rest.forEach(p => { html += cardHTML(p); });
    } else {
      ranked.forEach(p => { html += cardHTML(p); });
    }

    list.innerHTML = html;

    list.querySelectorAll(".sap-pm-card").forEach(card => {
      const id = card.dataset.id;
      card.addEventListener("click", (e) => {
        if (e.target.closest(".sap-pm-card-fav")) return;
        copyPrompt(id);
      });
      const favBtn = card.querySelector(".sap-pm-card-fav");
      if (favBtn) {
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFav(id);
        });
      }
    });
  }

  function cardHTML(p) {
    const solutions = (p.solutions || []).map(s => `<span class="sap-pm-pill">${s}</span>`).join("");
    const flow = p.storyFlow ? `<span class="sap-pm-pill flow">${p.storyFlow}</span>` : "";
    const tags = (p.tags || []).slice(0, 2).map(t => `<span class="sap-pm-pill">#${t}</span>`).join("");
    const favClass = p.isFavorite ? "active" : "";
    const favTitle = p.isFavorite ? "Remove from favorites" : "Add to favorites";
    return `
      <div class="sap-pm-card" data-id="${escHtml(p.id)}" title="${escHtml(p.body.slice(0, 120))}">
        <div class="sap-pm-card-body">
          <div class="sap-pm-card-title">${escHtml(p.title)}</div>
          <div class="sap-pm-card-meta">${solutions}${flow}${tags}</div>
        </div>
        <button class="sap-pm-card-fav ${favClass}" title="${favTitle}">★</button>
        <div class="sap-pm-card-copy-hint">Click to copy</div>
      </div>`;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function copyPrompt(id) {
    const p = _prompts.find(x => x.id === id);
    if (!p) return;
    navigator.clipboard.writeText(p.body).then(() => {
      showToast("✓ Copied to clipboard");
      chrome.runtime.sendMessage({ type: "INCREMENT_USAGE", id });
      hideOverlay();
    }).catch(() => {
      // Fallback for pages where clipboard API requires focus
      const ta = document.createElement("textarea");
      ta.value = p.body;
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("✓ Copied to clipboard");
      chrome.runtime.sendMessage({ type: "INCREMENT_USAGE", id });
      hideOverlay();
    });
  }

  function toggleFav(id) {
    const p = _prompts.find(x => x.id === id);
    if (!p) return;
    p.isFavorite = !p.isFavorite;
    p.updatedAt = new Date().toISOString();
    chrome.runtime.sendMessage({ type: "SAVE_PROMPT", prompt: p });
    renderList(document.getElementById("sap-pm-search-input")?.value || "");
  }

  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("sap-pm-toast-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("sap-pm-toast-show"), 2000);
  }

  // Listen for messages from the service worker
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TOGGLE_OVERLAY") {
      if (document.getElementById(OVERLAY_ID)?.classList.contains("sap-pm-visible")) {
        hideOverlay();
      } else {
        showOverlay();
      }
    }
  });
})();

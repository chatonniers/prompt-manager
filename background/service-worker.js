// Service worker — all logic is self-contained (no ES module imports from shared/)
// because shared/ files are designed for content-script scope sharing.

const DEFAULT_STORY_FLOWS = ["Procure-to-Pay","Order-to-Cash","Plan-to-Inventory","Hire-to-Retire","Record-to-Report","Lead-to-Cash","Design-to-Operate","Other"];

function swDetectSAP(url) {
  if (!url) return { detected: false };
  const rules = [
    { solution: "Joule Studio", patterns: [/joule-studio/i, /build\.joule\.cloud\.sap/i] },
    { solution: "Joule",        patterns: [/joule\.cloud\.sap/i, /\/joule\//i, /ai-assistant/i] },
    { solution: "IBP",          patterns: [/ibpcloud\.sap/i, /ibp\.cloud\.sap/i, /sapibp/i] },
    { solution: "Ariba",        patterns: [/ariba\.com/i, /businessnetwork\.sap/i] },
    { solution: "S/4HANA",      patterns: [/s4hana\.cloud\.sap/i] },
    { solution: "BTP",          patterns: [/cockpit\.btp\.cloud\.sap/i, /cfapps\.[a-z0-9-]+\.hana\.ondemand\.com/i, /\.btp\.cloud\.sap/i] },
    { solution: "Datasphere",   patterns: [/datasphere\.cloud\.sap/i, /dwc\.cloud\.sap/i] },
    { solution: "SuccessFactors", patterns: [/successfactors\.com/i] },
    { solution: "SAP (Generic)", patterns: [/\.sap\.com/i, /\.sapcloud\.io/i, /\.hana\.ondemand\.com/i] }
  ];
  for (const r of rules) {
    if (r.patterns.some(p => p.test(url))) return { detected: true, solution: r.solution };
  }
  return { detected: false, solution: null };
}

async function getPrompts() {
  const d = await chrome.storage.local.get("prompts");
  return d.prompts || [];
}

async function getSettings() {
  const d = await chrome.storage.local.get("settings");
  return d.settings || { autoFilterEnabled: true, overlayPosition: "right", theme: "light" };
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;
  const existing = await getPrompts();
  if (existing.length > 0) return;
  // Seed default prompts
  const now = new Date().toISOString();
  function uid() { return crypto.randomUUID(); }
  const defaults = [
    { id: uid(), title: "IBP Demand Sensing — Weekly Consensus", body: "In IBP, show me the demand sensing run for the current week. Highlight any statistical forecast deviations greater than 15% and summarize the top three SKUs driving the variance in the EMEA region.", notes: "Use in the S&OP consensus meeting demo", storyFlow: "Plan-to-Inventory", solutions: ["IBP"], landscapes: [], tags: ["demand", "consensus", "EMEA"], isFavorite: true, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "S/4HANA Purchase Order Exception Review", body: "Show me all purchase orders in S/4HANA that are overdue by more than 5 days and have a net value above €50,000. Group them by supplier and highlight the top 3 at-risk deliveries.", notes: "Great for Procure-to-Pay story opening", storyFlow: "Procure-to-Pay", solutions: ["S/4HANA"], landscapes: [], tags: ["PO", "exception", "supplier"], isFavorite: true, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "Joule — Summarize Open Sales Orders", body: "Summarize all open sales orders for customer ACME Corp that have a requested delivery date within the next 14 days. List them by priority and flag any with inventory shortages.", notes: "Use with Joule in S/4HANA Order-to-Cash flow", storyFlow: "Order-to-Cash", solutions: ["Joule", "S/4HANA"], landscapes: [], tags: ["sales", "delivery", "Joule"], isFavorite: true, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "Ariba — Supplier Risk Assessment", body: "In SAP Business Network, identify suppliers in the Electronics category with a risk score above 70. Show their on-time delivery rate for the last 6 months and any active compliance issues.", notes: "", storyFlow: "Procure-to-Pay", solutions: ["Ariba"], landscapes: [], tags: ["supplier", "risk", "compliance"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "IBP Supply Planning — Constrained Run", body: "Run a supply planning simulation in IBP with the current demand plan, applying capacity constraints for the Frankfurt DC. Show me where we have shortfalls in the next 8 weeks and which products are most impacted.", notes: "Slide 3 of Plan-to-Inventory story deck", storyFlow: "Plan-to-Inventory", solutions: ["IBP"], landscapes: [], tags: ["supply", "capacity", "simulation"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "S/4HANA — Goods Receipt Discrepancy Report", body: "Show me all goods receipts in the last 30 days where the received quantity differs from the purchase order quantity by more than 10%. List the vendor, material, plant, and delta quantity.", notes: "", storyFlow: "Procure-to-Pay", solutions: ["S/4HANA"], landscapes: [], tags: ["GR", "discrepancy", "receiving"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "Joule Studio — Custom AR Skill", body: "Design a Joule skill that retrieves the top 5 overdue accounts receivable items for a given customer, formatted as a summary card showing invoice number, amount, days overdue, and contact person.", notes: "Demo for Joule Studio extensibility", storyFlow: "Record-to-Report", solutions: ["Joule Studio"], landscapes: [], tags: ["skill", "extensibility", "AR"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "BTP — Integration Flow Monitoring", body: "In SAP Integration Suite, show all integration flows that failed in the last 24 hours. Group by error type and display the top 3 flows by failure count with their retry status.", notes: "", storyFlow: "Design-to-Operate", solutions: ["BTP"], landscapes: [], tags: ["integration", "monitoring", "errors"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "Datasphere — Supply Chain KPI Dashboard", body: "Create a view in SAP Datasphere combining inventory turnover ratio, perfect order rate, and days of supply across all EMEA plants for the current fiscal quarter. Include trend lines versus prior year.", notes: "", storyFlow: "Plan-to-Inventory", solutions: ["Datasphere"], landscapes: [], tags: ["KPI", "dashboard", "analytics"], isFavorite: false, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now },
    { id: uid(), title: "End-to-End: P2P Exception to PO Amendment", body: "Walk me through a scenario where a goods receipt triggers an invoice discrepancy in Ariba, escalates to a buyer in S/4HANA, and Joule drafts a purchase order amendment — showing the full Procure-to-Pay exception handling flow.", notes: "Full E2E story closer — use last in demo", storyFlow: "Procure-to-Pay", solutions: ["S/4HANA", "Ariba", "Joule"], landscapes: [], tags: ["E2E", "exception", "amendment"], isFavorite: true, usageCount: 0, lastUsedAt: null, createdAt: now, updatedAt: now }
  ];
  await chrome.storage.local.set({ prompts: defaults });
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("manager/manager.html") });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-overlay") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_OVERLAY" });
  } catch (_) {}
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch(err => sendResponse({ error: err.message }));
  return true;
});

async function handleMessage(msg) {
  switch (msg.type) {
    case "GET_PROMPTS": return getPrompts();
    case "GET_SETTINGS": return getSettings();
    case "GET_CATALOG": {
      const d = await chrome.storage.local.get("catalog");
      return d.catalog || null;
    }
    case "SAVE_CATALOG": {
      await chrome.storage.local.set({ catalog: msg.catalog });
      return { ok: true };
    }
    case "SAVE_SETTINGS": {
      const cur = await getSettings();
      await chrome.storage.local.set({ settings: { ...cur, ...msg.settings } });
      return { ok: true };
    }
    case "SAVE_PROMPT": {
      const prompts = await getPrompts();
      const idx = prompts.findIndex(p => p.id === msg.prompt.id);
      const ts = new Date().toISOString();
      if (idx >= 0) {
        prompts[idx] = { ...prompts[idx], ...msg.prompt, updatedAt: ts };
      } else {
        prompts.push({ ...msg.prompt, createdAt: ts, updatedAt: ts });
      }
      await chrome.storage.local.set({ prompts });
      return { ok: true };
    }
    case "DELETE_PROMPT": {
      const prompts = await getPrompts();
      await chrome.storage.local.set({ prompts: prompts.filter(p => p.id !== msg.id) });
      return { ok: true };
    }
    case "INCREMENT_USAGE": {
      const prompts = await getPrompts();
      const p = prompts.find(p => p.id === msg.id);
      if (p) {
        p.usageCount = (p.usageCount || 0) + 1;
        p.lastUsedAt = new Date().toISOString();
        await chrome.storage.local.set({ prompts });
      }
      return { ok: true };
    }
    case "OPEN_MANAGER": {
      await chrome.tabs.create({ url: chrome.runtime.getURL("manager/manager.html") });
      return { ok: true };
    }
    default: throw new Error("Unknown: " + msg.type);
  }
}

async function updateBadge(tabId, url) {
  if (!url || url.startsWith("chrome://") || url.startsWith("edge://")) return;
  const ctx = swDetectSAP(url);
  if (ctx.detected) {
    const abbr = ctx.solution.split(/[\s/]/)[0].toUpperCase().slice(0, 4);
    chrome.action.setBadgeText({ text: abbr, tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#0070F2", tabId });
  } else {
    chrome.action.setBadgeText({ text: "", tabId });
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab?.url) updateBadge(tabId, tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) updateBadge(tabId, tab.url);
});

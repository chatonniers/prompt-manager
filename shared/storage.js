const DEFAULT_CATALOG = {
  solutions:  ["S/4HANA","IBP","Ariba","Joule","Joule Studio","BTP","Datasphere","SuccessFactors"],
  storyFlows: ["Procure-to-Pay","Order-to-Cash","Plan-to-Inventory","Hire-to-Retire","Record-to-Report","Lead-to-Cash","Design-to-Operate","Other"],
  landscapes: []
};

const StorageAPI = {
  async getAllPrompts() {
    const data = await chrome.storage.local.get("prompts");
    return data.prompts || [];
  },

  async getCatalog() {
    const data = await chrome.storage.local.get("catalog");
    return {
      solutions:  data.catalog?.solutions  ?? [...DEFAULT_CATALOG.solutions],
      storyFlows: data.catalog?.storyFlows ?? [...DEFAULT_CATALOG.storyFlows],
      landscapes: data.catalog?.landscapes ?? [...DEFAULT_CATALOG.landscapes]
    };
  },

  async saveCatalog(catalog) {
    await chrome.storage.local.set({ catalog });
  },

  async upsertPrompt(prompt) {
    const prompts = await this.getAllPrompts();
    const idx = prompts.findIndex(p => p.id === prompt.id);
    if (idx >= 0) {
      prompts[idx] = { ...prompts[idx], ...prompt, updatedAt: new Date().toISOString() };
    } else {
      prompts.push({ ...prompt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await chrome.storage.local.set({ prompts });
  },

  async deletePrompt(id) {
    const prompts = await this.getAllPrompts();
    await chrome.storage.local.set({ prompts: prompts.filter(p => p.id !== id) });
  },

  async incrementUsage(id) {
    const prompts = await this.getAllPrompts();
    const p = prompts.find(p => p.id === id);
    if (p) {
      p.usageCount = (p.usageCount || 0) + 1;
      p.lastUsedAt = new Date().toISOString();
      await chrome.storage.local.set({ prompts });
    }
  },

  async getSettings() {
    const data = await chrome.storage.local.get("settings");
    return data.settings || {
      autoFilterEnabled: true,
      overlayPosition: "right",
      theme: "light"
    };
  },

  async saveSettings(settings) {
    const current = await this.getSettings();
    await chrome.storage.local.set({ settings: { ...current, ...settings } });
  },

  async exportAll() {
    const [prompts, settings, catalog] = await Promise.all([this.getAllPrompts(), this.getSettings(), this.getCatalog()]);
    return { prompts, settings, catalog, exportVersion: "1.0", exportedAt: new Date().toISOString() };
  },

  async importAll(data, mode = "merge") {
    if (!data.prompts || !Array.isArray(data.prompts)) throw new Error("Invalid import format");
    if (mode === "replace") {
      await chrome.storage.local.set({ prompts: data.prompts });
      if (data.catalog) await this.saveCatalog(data.catalog);
      return { imported: data.prompts.length, skipped: 0 };
    }
    const existing = await this.getAllPrompts();
    const existingIds = new Set(existing.map(p => p.id));
    const toAdd = data.prompts.filter(p => !existingIds.has(p.id));
    await chrome.storage.local.set({ prompts: [...existing, ...toAdd] });
    if (data.catalog) {
      const cur = await this.getCatalog();
      await this.saveCatalog({
        solutions:  [...new Set([...cur.solutions,  ...(data.catalog.solutions  || [])])],
        storyFlows: [...new Set([...cur.storyFlows, ...(data.catalog.storyFlows || [])])],
        landscapes: [...new Set([...cur.landscapes,  ...(data.catalog.landscapes || [])])]
      });
    }
    return { imported: toAdd.length, skipped: data.prompts.length - toAdd.length };
  }
};

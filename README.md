# Prompt Manager

A Microsoft Edge extension for SAP Solution Advisors to store, organise, and copy demo prompts during live supply chain demonstrations.

## Features

- **Instant overlay** — press `Ctrl+Shift+Space` on any page to open the prompt library
- **Auto-detection** — recognises the active SAP tool (IBP, S/4HANA, Ariba, Joule, Joule Studio, BTP, Datasphere, SuccessFactors) from the URL and pre-filters relevant prompts
- **One-click copy** — click any prompt card to copy it to the clipboard
- **Bilingual** — prompts can have both English and French bodies; switch with the FR/EN toggle in the Manager
- **Organised library** — filter by Story Flow, Solution, tags, or free-text search
- **Favorites & Most Used** — pin prompts and track usage frequency
- **Full CRUD manager** — create, edit, delete prompts with rich metadata (story flow, solutions, landscapes, tags, notes)
- **Admin catalog** — manage the list of Solutions, Story Flows, and Landscapes directly in Settings
- **Import / Export** — share your prompt library as a JSON file

## Installation

1. Clone or download this repository
2. Install build dependencies and bundle the UI5 assets:
   ```bash
   npm install
   npm run build
   ```
3. Open Edge and go to `edge://extensions/`
4. Enable **Developer mode** (toggle, top-right)
5. Click **Load unpacked** and select the project folder
6. The Prompt Manager icon appears in the toolbar

## Usage

| Action | How |
|---|---|
| Open overlay | `Ctrl+Shift+Space` (or `Command+Shift+Space` on Mac) |
| Close overlay | `Escape` or click outside the panel |
| Copy a prompt | Click the prompt card |
| Open full manager | Click **Manage Prompts →** in the overlay footer, or the toolbar icon |
| Switch language | Click the **FR / EN** button in the Manager top bar |

## Project Structure

```
sap-demo-prompt-manager/
├── manifest.json
├── background/
│   └── service-worker.js       # Command handler, storage bridge, badge updates
├── content/
│   ├── content-script.js       # Floating overlay injected into every page
│   └── overlay.css
├── popup/
│   ├── popup.html / .js / .css # Toolbar popup (quick access)
├── manager/
│   ├── manager.html / .js / .css  # Full CRUD management page
├── shared/
│   ├── url-detector.js         # SAP URL pattern matching
│   ├── search.js               # Weighted full-text search & ranking
│   ├── storage.js              # chrome.storage.local wrappers
│   └── defaults.js             # Sample prompts loaded on first install
└── assets/
    ├── ui5-bundle.js           # Built by esbuild — SAP UI5 Web Components
    └── icons/
```

## Data Model

Each prompt is stored as a JSON object in `chrome.storage.local`:

```json
{
  "id": "uuid-v4",
  "title": "Short display name",
  "body": "Full prompt text (EN, required)",
  "body_fr": "Texte complet du prompt (FR, optional)",
  "notes": "Internal notes — not copied",
  "storyFlow": "Plan-to-Inventory",
  "solutions": ["IBP", "S/4HANA"],
  "landscapes": ["https://my12345.ibpcloud.sap.com"],
  "tags": ["demand", "consensus"],
  "isFavorite": false,
  "usageCount": 0,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## Keyboard Shortcut

The default shortcut is `Ctrl+Shift+Space`. To change it, go to `edge://extensions/shortcuts`.

## Author

Sylvain Chatonnier — SAP Solution Advisor, Supply Chain

# AMO Reviewer Notes — Session Switcher 2 v1.9.0

Hi reviewer, thanks for your time. Here's everything you need to evaluate this submission efficiently.

## What the extension does

Session Switcher 2 lets a user save the **complete session state** of a website (cookies + localStorage + sessionStorage + IndexedDB) under a named profile, then restore any saved profile to switch between accounts on the same site without logging out and back in.

Use cases:
- Personal Gmail vs work Gmail in the same browser
- Multiple GitHub / Twitter / Discord accounts
- Testing flows for web developers (logged-out vs logged-in vs admin states)
- Anyone who manages multiple accounts they own

The extension is **100% local**. No telemetry, no remote sync, no accounts, no servers.

## Build / source verification

- **No build step needed**. The extension is shipped as the actual loaded code.
- Source code in the submitted `.zip` is **identical** to the runtime code (no minification of our own code; only `libs/jszip.min.js` which is a third-party library).
- The original development was in TypeScript with esbuild, but the bundled output is checked into the repo and shipped directly. You can `diff` the submitted source against the GitHub tag `session-switcher2-v1.9.0`.
- Public repo: https://github.com/Erzambayu/sessionns-changerr
- Release tag: https://github.com/Erzambayu/sessionns-changerr/releases/tag/session-switcher2-v1.9.0

## Permissions justification

| Permission | Justification |
|---|---|
| `storage` | Persist the session list (`chrome.storage.local`) |
| `unlimitedStorage` | Sessions include full cookie sets + IndexedDB snapshots. Power users with 20+ saved sessions can exceed the default 5 MB quota |
| `tabs` | Read active tab URL (to know which domain we're on); reload tab after switching session |
| `cookies` | Core feature: save/restore cookies. Scoped to current site's cookie store via `cookieStoreId` so incognito stores never leak into normal stores |
| `activeTab` | Access tab content only when user explicitly triggers an action |
| `scripting` | Inject code via `chrome.scripting.executeScript` to read/write localStorage, sessionStorage, IndexedDB on the active tab |
| `<all_urls>` (host) | Users save sessions on arbitrary websites of their choosing (Gmail, GitHub, Twitter, internal company tools, etc). The extension genuinely cannot know which sites a given user will use it on. **On Firefox**, this is correctly treated as opt-in: the popup detects Firefox UA and shows a yellow banner with a "Grant access" button calling `chrome.permissions.request({ origins: ["<all_urls>"] })` only when the user clicks. The extension does not request `<all_urls>` at install time on Firefox. |

## Network activity

The extension makes **no network requests** of its own. The only outbound traffic is from the popup HTML loading Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) for the UI typography (Fraunces, Inter, JetBrains Mono). These are static font files, no user data is transmitted.

If you want a fully offline build, fonts can be self-hosted; happy to ship a font-embedded variant if AMO policy requires.

## Security-sensitive code paths

- **Cookie handling**: `background/index.js` lines 28-130 (`CookieHandler`). Uses `cookieStoreId` from the target tab to prevent cross-store leaks (incognito ↔ normal). Includes apex-domain matching (e.g. `.google.com` cookies apply to `accounts.google.com`).
- **Storage injection**: `background/index.js` lines ~150-580 (`extractStorageData`, `injectStorageData`, `clearStorage`). All three are pure functions executed via `chrome.scripting.executeScript` with `target.tabId`, no `world: "MAIN"` (default isolated world), no `code:` string injection. No `eval`, no `new Function()`, no dynamic import.
- **PIN hashing**: `popup/index.js` PBKDF2 SHA-256, 200K iterations, per-install random 16-byte salt via `crypto.getRandomValues`. Constant-time comparison via `crypto.subtle.timingSafeEqual` polyfill.
- **HTML rendering**: All session list items rendered via `document.createElement` + `setAttribute` (no `innerHTML` for user-controlled data). Imported backups can not inject HTML.

## Third-party code

- **JSZip 3.x** (`libs/jszip.min.js`) - MIT/GPLv3 dual-licensed - https://github.com/Stuk/jszip
  - Loaded only in popup context (`popup/index.html` line 17)
  - Used for ZIP export/import of session backups
  - Not loaded in background context

No other third-party code is bundled.

## Known limitations / intentional behavior

- **WhatsApp Web** is hard-coded to be disabled (`popup/index.js`) because WA's IndexedDB is hundreds of MB of media blobs and would freeze the popup. The extension shows a friendly "disabled for performance" message instead.
- **Heavy hosts** (Instagram, Facebook, Twitter/X, TikTok, Discord, YouTube, LinkedIn, Reddit, Messenger): IndexedDB capture is **skipped** entirely; only cookies + localStorage are saved. This is documented in code comments and is necessary because IDB on these hosts contains gigabytes of media cache.
- **General sites**: IDB capture has hard caps (800 records/store, skip blobs >256 KB, total 8 MB cap, per-operation timeout) to prevent freezes.

## Cross-browser implementation

- `manifest.json` declares both `background.service_worker` (Chromium) and `background.scripts` (Firefox event page). Chromium ignores `scripts`, Firefox ignores `service_worker` (or treats it as alias on FF 121+).
- All API calls use the `chrome.*` namespace which Firefox aliases to `browser.*` since FF 101.
- `browser_specific_settings.gecko.id` = `session-switcher-2@kuronekony4n` (preserved from upstream project).

## Privacy policy

Available at: https://github.com/Erzambayu/sessionns-changerr/blob/main/PRIVACY.md (also shipped in the source ZIP).

## Anything you'd like changed?

If the review surfaces issues, please open them on the repo or include them in the review notes. I'll respond and resubmit promptly.

Thanks again 🙏

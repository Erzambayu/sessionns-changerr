# Privacy Policy — Session Switcher 2

**Last updated**: 2026-05-20
**Version**: 1.9.0

## Summary (TL;DR)

Session Switcher 2 is a **local-first** browser extension. It does **not** transmit any user data to any server, ever. All session data (cookies, localStorage, sessionStorage, IndexedDB snapshots) stays inside your browser's local storage on your own device. There is no telemetry, no analytics, no tracking, no remote sync.

## What data does this extension access?

To provide its core functionality, the extension accesses the following data **only on websites you actively visit and only when you explicitly trigger an action** (Save, Switch, Restore, Delete):

| Data type | Purpose | Scope |
|---|---|---|
| **Cookies** | Save and restore login sessions | Current site's cookie store only |
| **localStorage** | Save and restore site state | Current tab only |
| **sessionStorage** | Save and restore tab-scoped state | Current tab only |
| **IndexedDB metadata** | Save and restore site databases | Current tab only (with size caps and skip rules for heavy hosts like Instagram, Twitter, Facebook) |
| **Tab URL / domain** | Determine which site you are on | Current active tab only |
| **Manifest version** | Display in About dialog | Read-only |

## Where is this data stored?

Exclusively in `chrome.storage.local` (Chromium) / `browser.storage.local` (Firefox). This is your browser's own local storage, on your device. It is never transmitted to any external server.

## What data is shared with third parties?

**None.** Zero. The extension makes no network requests, no API calls, no analytics pings. The only outbound connection is Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) loaded by the popup UI for typography, which is a read-only request for font files and contains no user data.

## What about the optional PIN feature?

If you enable PIN protection:
- Your PIN is hashed with **PBKDF2 (SHA-256, 200,000 iterations, per-install random salt)** using the Web Crypto API
- The hash is stored locally only
- Your raw PIN is never stored, logged, or transmitted
- PIN verification uses constant-time comparison

## What about export/import?

When you export a backup (JSON or ZIP), the file is downloaded to your local machine via your browser's standard download mechanism. The extension does not upload backups anywhere. You are responsible for the security of any backup files you create or share.

## What permissions does the extension request and why?

| Permission | Why |
|---|---|
| `storage` | Save your session list locally |
| `unlimitedStorage` | Some session data (cookies + IndexedDB snapshots) can exceed the default 5 MB quota for power users with many accounts |
| `tabs` | Read current tab URL to determine the active domain; reload tab after session switch |
| `cookies` | Read and write cookies for session save/restore |
| `activeTab` | Access content of the currently active tab when you trigger an action |
| `scripting` | Inject code into the active tab to read/write localStorage, sessionStorage, IndexedDB |
| `<all_urls>` (host_permissions) | Required because users save sessions on arbitrary websites (Gmail, Twitter, your company's intranet, etc.). The extension cannot know which sites a given user manages accounts on, so site-specific permissions are not viable. On Firefox MV3, this is opt-in and the user must explicitly grant it via the popup banner. |

## Children's privacy

The extension is not directed at children under 13 and does not knowingly collect any data from anyone (children or adults), since it collects no data at all.

## Changes to this policy

If the privacy practices ever change, this document and the extension's About dialog will be updated, and a notice will be included in the changelog of the version that introduces the change.

## Contact

- GitHub: https://github.com/Erzambayu/sessionns-changerr
- Issues: https://github.com/Erzambayu/sessionns-changerr/issues

## Source code

The extension is open source under the MIT license. You are encouraged to verify the privacy claims by inspecting the code yourself: https://github.com/Erzambayu/sessionns-changerr

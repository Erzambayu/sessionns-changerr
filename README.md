# 🔄 Session Switcher 2

<div align="center">

![Version](https://img.shields.io/badge/version-1.10.0-f59e0b?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-109%2B-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-84cc16?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-10a37f?style=for-the-badge&logo=openai&logoColor=white)

**Kelola multiple akun pada website yang sama. Local-first, keyboard-first, no telemetry.**

[Features](#-features) • [AI Integration](#-ai-integration) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [Credits](#-credits)

</div>

---

## 🤖 AI Integration

Session Switcher 2 is exploring **AI-powered features** to make session management smarter and more intuitive.

### 🎯 Planned AI Features

- **🔮 Smart Session Suggestions** — AI predicts which session you need based on time, domain, and usage patterns
- **📝 Auto-Generated Session Notes** — AI summarizes session context and extracts expiry dates
- **🧹 Intelligent Session Cleanup** — AI identifies duplicate/stale sessions and suggests safe-to-delete
- **📚 AI-Powered Documentation** — Auto-generate inline docs and answer contributor questions
- **🔄 Session Conflict Resolution** — AI analyzes import conflicts and suggests best merge strategy

### 🚀 Development Status

This project has applied for **[OpenAI Codex for OSS](https://openai.com/form/codex-for-oss)** grant to fund GPT-4o/o1 API usage for development.

**Current Phase:** Foundation (Q3 2026)
- [ ] OpenAI SDK integration
- [ ] Smart Session Suggestions MVP
- [ ] Privacy-preserving architecture

**Learn more:** [AI_INTEGRATION.md](AI_INTEGRATION.md)

**Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md#ai-assisted-development)

---

## ⚠️ Disclaimer

> **PERINGATAN PENTING - HARAP DIBACA**

Extension ini dibuat untuk **tujuan edukasi dan produktivitas personal**, seperti:
- Mengelola akun pribadi dan akun kerja pada satu browser
- Testing dan development web application
- Mengelola multiple akun yang **SAH milik Anda sendiri**

### ❌ DILARANG menggunakan extension ini untuk:
- Mengakses akun orang lain tanpa izin
- Melakukan aktivitas hacking, phishing, atau penipuan
- Bypass security systems atau authentication
- Aktivitas ilegal lainnya yang melanggar hukum

### ⚖️ Tanggung Jawab
**Pengembang TIDAK bertanggung jawab** atas segala bentuk penyalahgunaan extension ini. Dengan menggunakan extension ini, Anda setuju bahwa:
1. Anda bertanggung jawab penuh atas cara penggunaan extension
2. Anda tidak akan menggunakan untuk aktivitas ilegal
3. Anda memahami risiko keamanan dari menyimpan session data

**Gunakan dengan bijak dan bertanggung jawab!**

---

## ✨ Features

- 🔐 **Session Management** — Simpan dan switch antar session dengan sekali klik
- 📝 **Session Notes** — Tambahin context per session ("trial account expires 2026-06-01"), max 280 char
- 💾 **Multi-Account Support** — Kelola banyak akun pada website yang sama
- 🍪 **Complete Data Backup** — Cookies, localStorage, sessionStorage, IndexedDB
- ⚡ **Quick Switcher** — `Ctrl+K` / `Cmd+K` fuzzy search lintas semua site
- 🔢 **Badge Counter** — Jumlah session per domain langsung di icon toolbar
- ⌨️ **Keyboard Shortcuts** — `/` focus search, `1-9` switch ke session ke-N, `Esc` close modal
- 🔒 **Local & Secure** — Semua data tersimpan lokal, no telemetry
- 📤 **Export / Import** — Backup JSON atau ZIP, restore dengan **merge** atau **replace** mode
- 🎨 **Editorial Dark UI** — Warm-dark, serif display, monospace UI, sharp amber accent
- 🔐 **PIN Protection (PBKDF2)** — Hash 200K iterations + per-install salt, gate semua destructive action
- ⏱️ **Auto-lock Timeout** — Configurable PIN re-prompt window (every action / 1m / 5m / 15m / 1h)
- 🔄 **Smart Auto Refresh** — Keep session valid + sanity check, gak overwrite kalo logout
- ♿ **Accessible** — `role=dialog`, focus trap, `aria-live` announcements, reduced-motion safe
- 🚀 **Fast & Lightweight** — No framework, vanilla JS, MV3
- 🦊 **Cross-Browser** — Works on Chrome, Edge, Brave, dan Firefox 109+

---

## 🌐 Browser Support

| Browser | Min Version | Status |
|---|---|---|
| Chrome / Chromium | MV3 (any current) | ✅ Native |
| Edge | MV3 (any current) | ✅ Native |
| Brave / Opera / Vivaldi | MV3 (any current) | ✅ Native |
| Firefox | 109+ (115+ ESR recommended) | ✅ Native (event page fallback) |
| Firefox Stable | requires AMO signing | ⚠️ Pending submission

---

## 🖥️ Installation

> **TL;DR**: download release artifact dari [Releases](https://github.com/Erzambayu/sessionns-changerr/releases/latest), atau clone repo. Then load unpacked sesuai browser.

### 📥 Langkah 1: Download Source Code

**Opsi A - Download Release ZIP (Direkomendasikan):**
1. Buka [Releases](https://github.com/Erzambayu/sessionns-changerr/releases/latest)
2. Download artifact sesuai browser:
   - Chrome/Edge/Brave → `session-switcher2-vX.Y.Z-chrome.zip`
   - Firefox → `session-switcher2-vX.Y.Z-firefox.zip` (atau `.xpi` buat dev edition)
3. Extract ke folder yang mudah diakses (misal: `D:\Extensions\session-switcher2`)

**Opsi B - Download Source ZIP:**
1. Buka repository: https://github.com/Erzambayu/sessionns-changerr
2. Klik tombol hijau **`<> Code`** → **`Download ZIP`**
3. Extract file ZIP

**Opsi C - Clone dengan Git (Developer):**
```bash
git clone https://github.com/Erzambayu/sessionns-changerr.git
```

---

### 🔧 Langkah 2: Load Extension

#### Chrome / Edge / Brave / Chromium-based

1. Buka address bar: `chrome://extensions/` (Edge: `edge://extensions/`)
2. Aktifkan toggle **"Developer mode"** di pojok kanan atas
3. Klik **"Load unpacked"** → pilih folder hasil extract (yang berisi `manifest.json`)
4. Extension **"Session Switcher 2"** muncul di daftar — pastikan toggle ON

> 💡 **Tips**: Klik icon puzzle 🧩 di toolbar → pin extension biar selalu kelihatan

#### Firefox

**Cara 1 — Temporary Install (any Firefox, hilang saat restart):**
1. Address bar: `about:debugging#/runtime/this-firefox`
2. Klik **"Load Temporary Add-on..."**
3. Pilih file `manifest.json` dari folder extension
4. Extension aktif sampai Firefox di-close

**Cara 2 — Permanent (Firefox Developer Edition / Nightly / ESR Unbranded):**
1. Address bar: `about:config` → set `xpinstall.signatures.required` = `false`
2. Drag-and-drop file `.xpi` dari [Releases](https://github.com/Erzambayu/sessionns-changerr/releases/latest) ke window Firefox
3. Approve install prompt

**Cara 3 — Firefox Stable**: butuh AMO signing (pending submission ke addons.mozilla.org).

> ⚠️ **Firefox MV3 — Permission Banner**: saat pertama buka popup, akan muncul banner kuning minta akses `<all_urls>`. Ini wajib karena Firefox MV3 bikin host permissions jadi opt-in. Klik **"Grant access"** → approve di prompt native Firefox → done.

---

### ✅ Verifikasi Instalasi

- Icon Session Switcher muncul di toolbar
- Klik icon → popup terbuka tanpa error
- Buka site mana aja → coba Save Session

---

### 🔄 Update Extension

Jika ada update baru:
1. Download/pull versi terbaru
2. Buka halaman extensions browser-mu (`chrome://extensions/` atau `about:addons`)
3. Klik tombol **refresh** (🔄) pada Session Switcher 2
4. Atau **Remove** → **Load unpacked** lagi (Chrome) / **Load Temporary Add-on** lagi (Firefox)

---

## 🚀 Usage

### 💾 Menyimpan Session (Save Session)

1. **Login** ke akun Anda di website manapun (contoh: Instagram, Twitter, Gmail)
2. Klik icon **Session Switcher 🔄** di toolbar Chrome
3. Klik tombol menu **⋮** (titik tiga vertikal) di pojok kanan atas
4. Pilih **"💾 Save Session"**
5. Beri **nama** untuk session (contoh: "Akun Pribadi", "Akun Kerja")
6. Klik tombol **"Save Session"**

✅ Session berhasil disimpan!

---

### 🔀 Mengganti Session (Switch Session)

1. Klik icon **Session Switcher 🔄**
2. Anda akan melihat daftar session yang tersimpan
3. **Klik session** yang ingin digunakan
4. Halaman akan **reload otomatis** dengan akun yang dipilih

💡 Session yang aktif ditandai dengan **garis hijau** di sebelah kiri

---

### ➕ Membuat Session Baru (New Session)

Untuk logout dan login dengan akun berbeda:

1. Klik icon **Session Switcher 🔄**
2. Klik menu **⋮** → **"➕ New Session"**
3. Konfirmasi dengan klik **"Create Session"**
4. Halaman akan reload dalam keadaan logout
5. Login dengan akun baru, lalu simpan sebagai session baru

---

### ✏️ Edit & Hapus Session

- **Edit:** Hover session → Klik ✏️ → Ubah nama/urutan → Save
- **Duplikat:** Hover session → Klik 📋 → Session baru dibuat otomatis
- **Hapus:** Hover session → Klik 🗑️ → Konfirmasi delete

---

### 📤 Export & Import Session

**Export (Backup):**
1. Klik menu **⋮** → **"📤 Export/Import"**
2. Pilih data yang akan di-export (Current Site / All Data)
3. Pilih format:
   - **📄 JSON** - Format standar, ukuran lebih besar
   - **📦 ZIP** - Format terkompresi, ukuran lebih kecil
4. Klik **"Download Backup"**
5. File backup akan terdownload

**Import (Restore):**
1. Klik menu **⋮** → **"📤 Export/Import"**
2. Klik tab **"Import"**
3. Pilih file backup (**.json** atau **.zip**)
4. Klik **"Restore Data"**

---

## 🛠️ Tech Stack

- **Manifest V3** — Latest extension standard, dual-target Chromium + Firefox
- **Vanilla JavaScript** — No framework dependencies
- **Modern CSS** — Custom properties, no glassmorphism, semantic colors
- **Web Crypto API** — PBKDF2 (SHA-256, 200K iter) for PIN hashing
- **WebExtensions APIs** — `storage`, `cookies`, `tabs`, `scripting`, `action`, `permissions` (cross-browser via `chrome.*` namespace)

---

## 🧰 Development

```bash
# install lint deps
npm install

# validate manifest + syntax + lint
npm run check

# auto-fix lint issues
npm run lint:fix
```

CI runs on every push/PR via [`.github/workflows/lint.yml`](.github/workflows/lint.yml). Tagging `session-switcher2-vX.Y.Z` triggers [`release.yml`](.github/workflows/release.yml) which builds Chrome ZIP + Firefox ZIP + `.xpi` + AMO source bundle and attaches them to the GitHub Release automatically.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` / `⌘+K` | Open quick switcher (fuzzy search across all sites) |
| `Ctrl+Shift+S` / `⌘+Shift+S` | Open the popup itself |
| `/` | Focus search field |
| `1` – `9` | Switch to nth session in current list |
| `Esc` | Close any modal |
| `Enter` | Submit current modal action |

---

## ⚠️ Known Limitations

- **WhatsApp Web** - Disabled untuk mencegah performance issues (data terlalu besar)
- **Internal browser pages** - Extension tidak bisa digunakan di `chrome://`, `edge://`, `about:` pages
- **Incognito / Private Mode** - Perlu izin khusus di settings extension
- **Firefox `<all_urls>`** - Opt-in di MV3, user mesti grant manual via banner di popup atau `about:addons` → permissions tab
- **Firefox Stable signing** - Belum di-publish ke AMO, sementara pakai Developer Edition / Nightly atau temporary install

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guide
- Testing checklist
- AI-assisted workflows
- PR submission process

**Quick start:**
```bash
git clone https://github.com/Erzambayu/sessionns-changerr.git
cd sessionns-changerr
npm install
npm run check  # validate + lint
```

**Good first issues:** [Issues labeled `good-first-issue`](https://github.com/Erzambayu/sessionns-changerr/labels/good-first-issue)

---

## 🐛 Troubleshooting

### Popup tidak terbuka?
1. Buka halaman extensions browser-mu
2. Klik tombol **refresh** (🔄) pada extension
3. Jika masih error, **Remove** dan install ulang

### Session tidak tersimpan?
- Pastikan halaman sudah fully loaded sebelum save
- Beberapa website memiliki proteksi yang mencegah saving
- **Firefox**: cek banner permission di popup, mungkin `<all_urls>` belum di-grant

### Error saat switch session?
- Refresh halaman dan coba lagi
- Hapus session lama dan buat ulang

### Firefox: cookies kosong / restore gagal?
- Buka `about:addons` → klik Session Switcher 2 → tab **Permissions**
- Toggle **"Access your data for all websites"** ke ON
- Reload extension

---

## 📝 Changelog

### v1.10.1 (Current) — Audit Fixes & Privacy
- 🔒 **Self-hosted fonts** — Google Fonts (Fraunces, Inter, JetBrains Mono) kini dibundel lokal di `assets/fonts/`. Zero third-party request saat popup dibuka. Bonus: URL Google Fonts lama ternyata broken (sintaks axis `SOFT` salah) — font selama ini gagal load, sekarang beres.
- 🛡️ **Sender validation** — background `onMessage` sekarang cek `sender.id === chrome.runtime.id`; tolak pesan dari content script / web page (defense-in-depth).
- 🐛 **Fix: PIN modal hang** — tutup modal PIN via Escape / klik backdrop sekarang resolve gate `false` (sebelumnya `await requirePin()` gantung selamanya + `pendingSessionId` bocor → bisa switch ke session yang salah).
- 🐛 **Fix: badge ke-reset global** — update tab tanpa URL (mis. `chrome://`) nggak lagi ngapus badge di semua tab.
- 🐛 **Fix: cookie restore store mismatch** — cookie sekarang di-restore ke cookie store tab target, bukan store asal capture (benerin kasus incognito/berbeda profile).
- 🐛 **Fix: localhost quick-switch** — cross-domain switch ke `localhost`/`127.x.x.x` sekarang pakai `http://` (dev server jarang serve https).
- 🧹 **Fix: import validation** — session hasil import dengan domain invalid/junk di-drop (regex plausible-domain + cap 253 char).
- 🧹 **Cleanup** — hapus dead background handlers (import/export/clearSessions), hapus `escapeHtml` unused, `reject` → `_reject`. Lint 0 warning.

### v1.10.0 — Productivity & Polish
- 📝 **Session notes** — optional 280-char free text per session (e.g. "trial account, expires 2026-06-01"). Editable via Save / Edit modals, displayed inline under each session.
- 🔄 **Import modes** — choose **Merge** (add to existing, skip duplicates by domain+name) or **Replace** (wipe everything, restore only from backup, with native confirm). Default is Merge so a misclick can't wipe data.
- ⏱️ **Auto-lock timeout** — after a successful PIN verify, gated actions inside the same popup window skip the prompt for the configured timeout (Every action / 1 min / 5 min / 15 min / 1 hour). In-memory only, resets when popup re-opens.
- 🤖 **CI/CD** — GitHub Actions auto-builds Chrome ZIP + Firefox ZIP + `.xpi` + AMO source bundle on every tag push, attaches to release. No more manual zip dance.
- 🧹 **Code quality** — ESLint + EditorConfig + `package.json` scripts (`npm run check` validates manifest, JS syntax, and lints in one shot).

### v1.9.3
- 🐛 Fix Firefox UA detection that incorrectly matched Chrome (chrome's UA contains "like Gecko"). Now uses `Firefox/<digit>` token + `browser.runtime.getBrowserInfo` API check.

### v1.9.2
- 🆔 Unique extension ID for the fork: `session-switcher-2@erzambayu`.

### v1.9.1
- 🦊 Add `data_collection_permissions: { required: ["none"] }` for AMO compliance (effective Nov 3 2025).

### v1.9.0 — Firefox Support
- 🦊 **Dual-compat Chrome + Firefox** — manifest now has `service_worker` (Chrome) + `scripts` array (Firefox event page) → load native di kedua browser tanpa fork codebase
- 🔓 **Firefox permission banner** — runtime UA detect → kalo `<all_urls>` belum granted, popup tampilin banner kuning dengan CTA "Grant access" → klik → `chrome.permissions.request()` flow native FF prompt
- 📦 **Release artifacts** — `.zip` (Chrome/FF unpacked) + `.xpi` (FF dev edition) di-bundle di GitHub Releases
- 📚 **README** — install steps Firefox + browser support matrix + troubleshooting FF
- ⚙️ Min version: Firefox 109+ (115+ ESR recommended)

### v1.8.1
- 🐛 **Fix: stuck loading di Instagram (dan site berat lainnya)** — root cause: IndexedDB IG penuh blob cache (foto, story, video) sampai ratusan MB, `getAll()` recursive serialize ngabisin tab. Sekarang:
  - **Skip IDB total** untuk heavy hosts: instagram, facebook, messenger, twitter/x, tiktok, discord, youtube, linkedin, reddit, whatsapp. Cookies + localStorage cukup untuk restore auth di site-site ini.
  - Untuk site lain: skip cache-like stores by name regex (`cache|blob|media|attachment|thumbnail|...`), cap 800 records/store, skip blob >256KB, total IDB cap 8MB.
  - Per-operation timeout di tiap IDB call (open/count/getAll/getAllKeys).
- 🐛 **Fix: `chrome.scripting.executeScript` tanpa timeout** — wrap dengan `Promise.race`. Extract 15s, restore 15s, clear 10s. Sebelumnya kalo page hang → popup loading forever.
- 🐛 **Fix: total restore timeout cuma 2 detik** — naikin ke 15s. IG/site berat butuh 5–10s wajar. 2s gak realistic.
- 🐛 **Fix: clear cookies + clear storage sequential** — ganti ke `Promise.allSettled` paralel dengan timeout per-step. Kalo IDB clear hang, cookies tetep kelar.
- 🐛 **Fix: `clearStorage()` IDB delete bisa block** — kalo ada open connection di page, `deleteDatabase` nunggu forever. Sekarang per-DB hard cap 1.5s, lewat itu skip.
- 🐛 **Fix: popup sendMessage tanpa timeout** — popup-side hard cap 30s. User dapet error message instead of stuck loading.

### v1.8.0
- ⚡ **Quick Switcher** — Ctrl+K / Cmd+K fuzzy search lintas semua site, cross-domain switch otomatis buka tab baru
- 🔢 **Action Badge** — Jumlah session per domain tampil di icon toolbar (per-tab, auto-update)
- 🔐 **PBKDF2 PIN** — SHA-256 single-round → PBKDF2 200K iterations + per-install random salt. Backward compat: legacy v1 hash auto-upgrade saat verify pertama. Constant-time compare.
- 🔒 **PIN Gate Diperluas** — Sebelumnya cuma gating switch session. Sekarang juga: rename, delete, duplicate, replace, clear, export. PIN bukan lagi cosmetic.
- 🐛 **Fix Critical: Auto-refresh data loss** — Sanity check sebelum overwrite. Kalo cookie count drop > 70% atau kosong total padahal stored ada, refresh di-abort. Gak nge-wipe saved login lagi.
- 🐛 **Fix Critical: Cookie restore broken di Google/Microsoft** — Filter sekarang include parent-domain cookies (`.google.com` apply ke `accounts.google.com`). Sebelumnya banyak auth cookie ke-skip.
- 🐛 **Fix Security: HTML attribute injection** — Render session list pakai `createElement` + `setAttribute` (bukan template literal innerHTML). Imported data gak bisa lagi corrupt UI / hijack click.
- 🐛 **Fix Auto-refresh race** — Cek `tab.status === "complete"` sebelum capture, biar gak nangkap mid-redirect partial state.
- 🐛 **Fix `parseInt` NaN propagation** — Order priority dengan input ngaco fallback ke `autoNext`, gak bikin badge `#NaN`.
- 🐛 **Fix `formatDate(undefined)`** — Imported sessions tanpa `lastUsed` tampil `—` instead of "Invalid Date".
- ♿ **A11y pass** — Semua modal dapet `role=dialog` / `role=alertdialog`, `aria-modal`, `aria-labelledby`. Focus trap aktif. Toast pakai `aria-live` region. Search field punya label. `prefers-reduced-motion` dihormati.
- 🎨 **UI Redesign** — Ditch glassmorphism + Inter+Poppins+purple gradient. Aesthetic baru: editorial "developer journal" — Fraunces serif (display), JetBrains Mono (UI/numerik), Inter (body), warm-dark cream-on-charcoal, sharp amber accent (#f59e0b), crisp 1px borders, no over-animation.
- 🧹 **Cleanup** — Drop `viewMode` dead code, drop `clearServiceWorkersAndCache` duplicate, drop empty `web_accessible_resources`, hardcoded version → manifest. About modal sekarang baca version dari `chrome.runtime.getManifest()`.
- ⌨️ **Keyboard shortcuts** — `/` focus search, `1-9` switch nth session, `Ctrl+Shift+S` open popup. Modal Enter/Escape consistent.

### v1.7.0
- 🐛 Fix **#1 Cookie Restoration Race Condition** — tiap cookie kini punya timeout 5 detik via `Promise.race`, tidak bisa hang selamanya
- 🐛 Fix **#2 Incognito Cookie Leak** — `getCookiesForDomain` kini menggunakan `cookieStoreId` dari tab target, bukan iterate semua stores
- 🐛 Fix **#3 Storage Monitoring** — tambah fungsi `checkStorageUsage()` yang memantau penggunaan storage & warn jika > 50 MB
- ⚠️ `unlimitedStorage` tetap dipertahankan (dibutuhkan untuk menyimpan cookies + IndexedDB yang bisa multi-MB)

### v1.6.0
- 📋 Added **Duplicate Session** - Clone session dengan sekali klik
- 🐛 Fix `Clear All Sessions` tidak benar-benar menghapus semua data
- 🐛 Fix PIN modal tidak bisa Submit dengan tombol **Enter**
- 🐛 Fix Auto Refresh cooldown selalu terblokir karena cek field yang salah
- 🐛 Fix hover style tombol Delete tidak muncul (selector CSS salah)
- ♻️ Refactor: centralized `showToast()` helper, hapus kode duplikat
- 🗑️ Remove dead `viewModeBtn` dari header

### v1.5.0
- 🔐 Added PIN Security - Protect sessions with 4-6 digit PIN
- 🔄 Added Auto Session Refresh - Keep sessions valid automatically
- ⚙️ Security Settings menu for PIN management
- 🔒 SHA-256 hashed PIN storage for security

### v1.4.0
- 🔄 Added Auto Session Refresh feature
- ⏱️ 5-minute cooldown to prevent excessive refreshes
- 📝 Background session data update

### v1.3.2
- 📦 Added ZIP backup format support (export & import)
- 💾 Choose between JSON or ZIP for backups
- 📚 JSZip library integration

### v1.3.1
- 🐛 Fix null check bug pada SessionList
- 🛡️ Improved error handling saat inisialisasi
- 📝 Updated README dengan panduan lengkap

### v1.3.0
- 🎨 Complete UI/UX overhaul dengan dark mode
- 💎 Glassmorphism design
- ✨ Smooth animations & micro-interactions
- 🧹 Removed dead code & unused elements
- 📝 Added Google Fonts (Inter, Poppins)

### v1.2.0
- Initial optimized version
- Core session switching functionality

---

## 🙏 Credits

- **Original Project**: [session-switcher2](https://github.com/kuronekony4n/session-switcher2) by kuronekony4n
- **Modified by**: [Erzambayu](https://github.com/Erzambayu)
- **v1.8.0 Overhaul**: Editorial dark UI redesign, PBKDF2 PIN, quick switcher, badge counter, a11y pass, critical bug fixes
- **v1.9.0 Firefox Support**: Dual-compat MV3 build, runtime permission banner, release artifacts

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [Erzambayu](https://github.com/Erzambayu)**

⭐ Star this repo if you find it useful!

</div>

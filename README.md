# 🔄 Session Switcher 2

<div align="center">

![Version](https://img.shields.io/badge/version-1.8.1-f59e0b?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-84cc16?style=for-the-badge)

**Kelola multiple akun pada website yang sama. Local-first, keyboard-first, no telemetry.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Disclaimer](#%EF%B8%8F-disclaimer) • [Credits](#-credits)

</div>

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
- 💾 **Multi-Account Support** — Kelola banyak akun pada website yang sama
- 🍪 **Complete Data Backup** — Cookies, localStorage, sessionStorage, IndexedDB
- ⚡ **Quick Switcher** — `Ctrl+K` / `Cmd+K` fuzzy search lintas semua site
- 🔢 **Badge Counter** — Jumlah session per domain langsung di icon toolbar
- ⌨️ **Keyboard Shortcuts** — `/` focus search, `1-9` switch ke session ke-N, `Esc` close modal
- 🔒 **Local & Secure** — Semua data tersimpan lokal, no telemetry
- 📤 **Export / Import** — Backup JSON atau ZIP, restore lintas device
- 🎨 **Editorial Dark UI** — Warm-dark, serif display, monospace UI, sharp amber accent
- 🔐 **PIN Protection (PBKDF2)** — Hash 200K iterations + per-install salt, gate semua destructive action
- 🔄 **Smart Auto Refresh** — Keep session valid + sanity check, gak overwrite kalo logout
- ♿ **Accessible** — `role=dialog`, focus trap, `aria-live` announcements, reduced-motion safe
- 🚀 **Fast & Lightweight** — No framework, vanilla JS, MV3

---

## 🖥️ Installation

### 📥 Langkah 1: Download Source Code

**Opsi A - Download ZIP (Mudah):**
1. Buka repository: https://github.com/Erzambayu/sessionns-changerr
2. Klik tombol hijau **`<> Code`** di kanan atas
3. Pilih **`Download ZIP`**
4. Extract file ZIP ke folder yang mudah diakses (misal: `D:\Extensions\session-switcher2`)

**Opsi B - Clone dengan Git (Developer):**
```bash
git clone https://github.com/Erzambayu/sessionns-changerr.git
```

---

### 🔧 Langkah 2: Aktifkan Developer Mode di Chrome

1. Buka browser **Google Chrome**
2. Ketik di address bar: `chrome://extensions/` lalu tekan **Enter**
3. Di pojok **kanan atas**, aktifkan toggle **"Developer mode"** (geser ke ON)

---

### 📂 Langkah 3: Load Extension

1. Setelah Developer mode aktif, akan muncul 3 tombol baru di kiri atas
2. Klik tombol **"Load unpacked"**
3. Pilih folder hasil extract/clone tadi (folder yang berisi file `manifest.json`)
4. Klik **"Select Folder"**

---

### ✅ Langkah 4: Verifikasi Instalasi

1. Extension **"Session Switcher 2"** akan muncul di daftar extensions
2. Pastikan toggle di extension sudah **ON** (biru)
3. Icon extension (🔄) akan muncul di toolbar Chrome

**💡 Tips:** Jika tidak terlihat, klik icon puzzle 🧩 di toolbar → Pin extension Session Switcher

---

### 🔄 Update Extension

Jika ada update baru:
1. Download/pull versi terbaru
2. Buka `chrome://extensions/`
3. Klik tombol **refresh** (🔄) pada Session Switcher 2
4. Atau klik **"Remove"**, lalu **"Load unpacked"** lagi

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

- **Manifest V3** — Latest Chrome Extension standard
- **Vanilla JavaScript** — No framework dependencies
- **Modern CSS** — Custom properties, no glassmorphism, semantic colors
- **Web Crypto API** — PBKDF2 (SHA-256, 200K iter) for PIN hashing
- **Chrome APIs** — Storage, Cookies, Tabs, Scripting, Action

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
- **chrome:// pages** - Extension tidak bisa digunakan pada halaman internal Chrome
- **Incognito Mode** - Perlu izin khusus di settings extension

---

## 🐛 Troubleshooting

### Popup tidak terbuka?
1. Buka `chrome://extensions/`
2. Klik tombol **refresh** (🔄) pada extension
3. Jika masih error, **Remove** dan **Load unpacked** lagi

### Session tidak tersimpan?
- Pastikan halaman sudah fully loaded sebelum save
- Beberapa website memiliki proteksi yang mencegah saving

### Error saat switch session?
- Refresh halaman dan coba lagi
- Hapus session lama dan buat ulang

---

## 📝 Changelog

### v1.8.1 (Current)
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

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [Erzambayu](https://github.com/Erzambayu)**

⭐ Star this repo if you find it useful!

</div>

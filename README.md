# 🔄 Session Switcher 2

<div align="center">

![Version](https://img.shields.io/badge/version-1.6.0-8b5cf6?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)

**Kelola multiple akun pada website yang sama dengan mudah, aman, dan cepat.**

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

- 🔐 **Session Management** - Simpan dan switch antar session dengan sekali klik
- 💾 **Multi-Account Support** - Kelola banyak akun pada website yang sama
- 🍪 **Complete Data Backup** - Menyimpan cookies, localStorage, sessionStorage, dan IndexedDB
- 🔒 **Local & Secure** - Semua data tersimpan lokal di browser Anda
- 📤 **Export/Import** - Backup dan restore session data dengan mudah
- 🎨 **Modern UI** - Dark mode dengan glassmorphism dan animasi smooth
- 🔐 **PIN Security** - Lindungi session dengan PIN 4-6 digit
- 🔄 **Auto Session Refresh** - Jaga session tetap valid secara otomatis
- 🚀 **Fast & Lightweight** - Tidak memperlambat browsing experience

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

- **Manifest V3** - Latest Chrome Extension standard
- **Vanilla JavaScript** - No framework dependencies
- **Modern CSS** - Glassmorphism, gradients, animations
- **Chrome APIs** - Storage, Cookies, Tabs, Scripting

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

### v1.6.0 (Current)
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
- **UI/UX Modernization**: Dark mode, glassmorphism, modern animations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [Erzambayu](https://github.com/Erzambayu)**

⭐ Star this repo if you find it useful!

</div>

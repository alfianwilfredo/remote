# 🎮 WebMote - 8-Bit Pixel Android TV Remote

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Zero Build](https://img.shields.io/badge/Frontend-Zero--Build%20%3C%2030KB-success.svg)](#)
[![100% Ad-Free](https://img.shields.io/badge/Ads-100%25%20Bebas%20Iklan-brightgreen.svg)](#)
[![Multi-Runtime](https://img.shields.io/badge/Runtime-Node.js%20%7C%20Bun-orange.svg)](#)
[![Package Managers](https://img.shields.io/badge/Supports-NPM%20%7C%20PNPM%20%7C%20Yarn%20%7C%20Bun-blueviolet.svg)](#)

Aplikasi remote control web berkecepatan tinggi, **100% bebas iklan (*ad-free*)**, dan berukuran ultra-ringan dengan estetika retro **8-Bit NES / GameBoy** untuk mengontrol **Android TV** & **Google TV** langsung melalui browser laptop atau smartphone di jaringan Wi-Fi yang sama.

---

## 📑 Daftar Isi

- [⚡ Fitur Unggulan](#-fitur-unggulan)
- [📋 Persyaratan Sistem](#-persyaratan-sistem)
- [📶 Panduan Jaringan Wi-Fi: 2.4 GHz vs 5 GHz (Dual-Band)](#-panduan-jaringan-wi-fi-24-ghz-vs-5-ghz-dual-band)
  - [1. Mengapa TV di 2.4 GHz dan HP/Laptop di 5 GHz?](#1-mengapa-tv-di-24-ghz-dan-hplaptop-di-5-ghz)
  - [2. Bagaimana Komunikasi Berjalan (Subnet Bridging)](#2-bagaimana-komunikasi-berjalan-subnet-bridging)
  - [3. Masalah Umum Wi-Fi & Cara Mengatasinya](#3-masalah-umum-wi-fi--cara-mengatasinya)
- [🚀 Cara Instalasi & Menjalankan](#-cara-instalasi--menjalankan)
  - [1. Menggunakan NPM](#1-menggunakan-npm)
  - [2. Menggunakan PNPM](#2-menggunakan-pnpm)
  - [3. Menggunakan Yarn](#3-menggunakan-yarn)
  - [4. Menggunakan Bun](#4-menggunakan-bun)
  - [5. Build Standalone Single Binary](#5-build-standalone-single-binary)
- [📖 Panduan Penggunaan Lengkap (Step-by-Step)](#-panduan-penggunaan-lengkap-step-by-step)
  - [Langkah 1: Menghubungkan ke Android TV (Pairing PIN)](#langkah-1-menghubungkan-ke-android-tv-pairing-pin)
  - [Langkah 2: Navigasi & Kontrol TV](#langkah-2-navigasi--kontrol-tv)
  - [Langkah 3: Mengetik Cepat & Pencarian YouTube](#langkah-3-mengetik-cepat--pencarian-youtube)
  - [Langkah 4: 1-Klik Peluncuran Aplikasi (App Cartridges)](#langkah-4-1-klik-peluncuran-aplikasi-app-cartridges)
  - [Langkah 5: Mengatur Efek Retro (CRT & Sound SFX)](#langkah-5-mengatur-efek-retro-crt--sound-sfx)
- [📱 Akses dari HP & PWA (Install ke Home Screen)](#-akses-dari-hp--pwa-install-ke-home-screen)
- [⌨ Tabel Shortcut Keyboard Laptop](#-tabel-shortcut-keyboard-laptop)
- [🔧 Panduan Troubleshooting (Masalah Umum & Solusi)](#-panduan-troubleshooting-masalah-umum--solusi)
- [📁 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [🔒 Privasi & Keamanan](#-privasi--keamanan)

---

## ⚡ Fitur Unggulan

- **🚫 100% Bebas Iklan & Tanpa Pelacakan:** Tidak ada popup, banner iklan, analitik pihak ketiga, ataupun telemetri internet.
- **🪶 Ultra-Lightweight (< 30 KB):** Frontend dibangun dengan Pure HTML5, CSS kustom, dan Vanilla JS murni tanpa overhead framework berat (React, Vite, dan Tailwind dieliminasi untuk latensi nol).
- **⚡ Universal Multi-Runtime:** Berjalan lancar di **Node.js** (`npm`, `pnpm`, `yarn`) maupun **Bun** secara native melalui *Universal Hybrid Engine*.
- **🎮 Desain Nostalgia 8-Bit NES / GameBoy:**
  - Dot-Matrix LCD Screen interaktif dengan indikator status live, target IP, active app, dan volume visualizer (meter fosfor 10-blok).
  - Chunky NES D-Pad ✚ dengan efek tekan 3D stepped-pixel.
  - Web Audio API Retro SFX (efek suara sintetis retro tanpa file audio eksternal).
  - Filter garis layar TV tabung retro (CRT Scanlines) dengan tombol toggle On/Off.
- **⌨ Fast Text Typing & Deep Search:** Ketik teks panjang di laptop/HP dan kirim langsung ke input box aktif di TV, atau cari video langsung di YouTube TV (`▶ YT SEARCH`).
- **📦 Quick App Cartridges:** 1-klik untuk membuka aplikasi populer (YouTube, Netflix, Spotify, Disney+ Hotstar, Prime Video, Twitch).
- **📶 Auto-Discovery & Session Persistence:** Scanner Wi-Fi otomatis (mDNS/SSDP/ARP) dan penyimpanan sertifikat pairing X.509 lokal agar koneksi berikutnya terjadi instan.

---

## 📋 Persyaratan Sistem

Sebelum menjalankan WebMote, pastikan:
1. **Runtime:** Salah satu dari runtime berikut sudah terinstal di komputer Anda:
   - **Node.js** v18.0.0 atau lebih baru ([Unduh Node.js](https://nodejs.org/)), ATAU
   - **Bun** v1.0.0 atau lebih baru ([Unduh Bun](https://bun.sh/)).
2. **Jaringan:** Laptop/komputer dan Android TV terhubung ke **jaringan Wi-Fi / LAN yang sama**.
3. **Target Perangkat:** TV berbasis **Android TV** atau **Google TV** (Xiaomi TV, TCL, Sony Bravia, Realme, Chromecast with Google TV, Coocaa, Polytron, dll.).

---

## 📶 Panduan Jaringan Wi-Fi: 2.4 GHz vs 5 GHz (Dual-Band)

Banyak pengguna menggunakan router Wi-Fi modern (Dual-Band) di rumah (IndiHome, MyRepublic, Biznet, First Media, XL Home, TP-Link, ASUS, Huawei, ZTE, dll.). Memahami cara kerja frekuensi Wi-Fi sangat penting agar WebMote dapat terhubung ke TV dengan lancar.

```
                  +-------------------------------------------------+
                  |          ROUTER WI-FI DUAL-BAND RUMAH           |
                  |             (Subnet: 192.168.1.1/24)            |
                  +------------------------+------------------------+
                                           |
                 +-------------------------+-------------------------+
                 | (Jaringan 2.4 GHz)                                | (Jaringan 5 GHz)
                 v                                                   v
    +--------------------------+                        +--------------------------+
    |       Android TV         | <====================> |      Laptop / HP         |
    |   (IP: 192.168.1.25)     |   Komunikasi LAN /     |    (IP: 192.168.1.3)     |
    |  Modul Wi-Fi 2.4 GHz     |   WebSocket & TLS      |   Modul Wi-Fi 5 GHz      |
    +--------------------------+                        +--------------------------+
```

### 1. Mengapa TV di 2.4 GHz dan HP/Laptop di 5 GHz?
* **Smart TV (2.4 GHz):** Mayoritas Smart TV (terutama entry-level & mid-range) hanya memiliki modul Wi-Fi 2.4 GHz karena frekuensi 2.4 GHz memiliki daya tembus dinding yang lebih baik untuk posisi TV yang statis.
* **Laptop & Smartphone (5 GHz):** Laptop dan HP modern biasanya otomatis terhubung ke frekuensi 5 GHz untuk kecepatan transfer data yang lebih tinggi.

### 2. Bagaimana Komunikasi Berjalan (Subnet Bridging)
**Apakah Laptop di 5 GHz bisa mengontrol TV di 2.4 GHz?**
👉 **BISA 100%!** Pada router normal, frekuensi 2.4 GHz dan 5 GHz **dijembatani (*bridged*)** ke dalam subnet IP yang sama (misal sama-sama mendapat IP `192.168.1.xxx`). Selama kedua perangkat berada di subnet yang sama, WebMote dapat mengirimkan perintah kontrol tanpa masalah.

---

### 3. Masalah Umum Wi-Fi & Cara Mengatasinya

| Kondisi / Masalah | Penyebab | Solusi Praktis |
| :--- | :--- | :--- |
| **Router Memiliki 2 Nama Wi-Fi Berbeda** *(misal: `MyWiFi_2.4G` & `MyWiFi_5G`)* | Sebagian router membatasi komunikasi antar dua nama SSID ini jika fitur bridging tidak aktif. | **Solusi:** Sambungkan Laptop/HP ke nama Wi-Fi yang **sama persis** dengan yang dipakai oleh TV (misal: keduanya disambungkan ke `MyWiFi_2.4G`). |
| **Fitur "AP Isolation" / "Client Isolation" Aktif di Router** | Router sengaja mengunci setiap perangkat agar tidak bisa saling "melihat" satu sama lain (sering aktif di router kos/kantor/kafe). | **Solusi:** Masuk ke halaman admin router (biasanya `http://192.168.1.1`), cari menu **Wireless ➜ Advanced**, dan ubah **AP Isolation** atau **Client Isolation** menjadi **Disabled / Off**. |
| **Menggunakan Wi-Fi Tamu (*Guest Network*)** | Jaringan *Guest Wi-Fi* memang didesain hanya untuk akses internet dan memblokir seluruh koneksi lokal antar-perangkat. | **Solusi:** Pastikan Laptop, HP, dan Android TV terhubung ke **Wi-Fi Utama**, bukan ke Wi-Fi Tamu (*Guest*). |
| **mDNS Discovery Terblokir (Auto-Scan Tidak Muncul)** | Beberapa router memblokir paket multicast mDNS antar-frekuensi 2.4G dan 5G sehingga tombol "SCAN WI-FI" tidak menemukan TV. | **Solusi:** Buka menu **`DEVICES`** di WebMote, lalu masukkan alamat IP TV secara **Manual** di kolom input (misal: `192.168.1.20`) dan klik **`CONNECT DEVICE`**. |

---

## 🚀 Cara Instalasi & Menjalankan

Clone repositori ini dan masuk ke foldernya:
```bash
git clone https://github.com/alfianwilfredo/remote.git
cd remote
```

Pilih salah satu metode instalasi dan jalankan sesuai package manager favorit Anda:

### 1. Menggunakan NPM
```bash
# Install dependensi
npm install

# Jalankan mode development
npm run dev

# Atau jalankan mode produksi
npm start
```

### 2. Menggunakan PNPM
```bash
# Install dependensi
pnpm install

# Jalankan mode development
pnpm dev

# Atau jalankan mode produksi
pnpm start
```

### 3. Menggunakan Yarn
```bash
# Install dependensi
yarn install

# Jalankan mode development
yarn dev

# Atau jalankan mode produksi
yarn start
```

### 4. Menggunakan Bun
```bash
# Install dependensi
bun install

# Jalankan mode development (super cepat)
bun run dev:bun   # atau bun run dev

# Atau jalankan mode produksi
bun run start:bun # atau bun start
```

---

### 5. Build Standalone Single Binary
Jika Anda ingin membuat **1 file aplikasi mandiri (.exe / binary)** yang dapat langsung dijalankan di komputer lain tanpa perlu menginstal Node.js ataupun Bun:

```bash
bun run build:binary
```
Perintah ini akan meng-compile seluruh backend dan frontend ke dalam satu file executable `./webmote`. Cukup jalankan dengan:
```bash
./webmote
```

---

## 📖 Panduan Penggunaan Lengkap (Step-by-Step)

Setelah server berjalan, buka browser di alamat:
👉 **`http://localhost:3000`**

### Langkah 1: Menghubungkan ke Android TV (Pairing PIN)
1. Klik tombol **`📺 DEVICES`** di pojok kanan atas toolbar WebMote.
2. WebMote akan secara otomatis memindai (*scan*) jaringan Wi-Fi untuk mendeteksi Android TV Anda.
3. Klik tombol **`CONNECT`** pada perangkat TV yang ditemukan di daftar.
   > **Catatan:** Jika TV tidak muncul otomatis, Anda dapat memasukkan IP TV secara manual (misal: `192.168.1.20`) di kolom input bawah dan klik **`CONNECT DEVICE`**.
4. Di layar TV Anda akan muncul dialog **"Pairing Request"** dengan kode PIN 6-digit (misal: `471B6C` atau angka 6 digit).
5. Masukkan kode PIN tersebut ke dalam dialog WebMote di layar laptop/HP Anda, lalu klik **`VERIFY PIN`**.
6. Selesai! Indikator di layar LCD akan berubah menjadi **`ONLINE`** berwarna hijau dan sertifikat pairing akan tersimpan otomatis.

---

### Langkah 2: Navigasi & Kontrol TV
- **D-Pad ✚:** Gunakan tombol panah **▲ / ▼ / ◀ / ▶** untuk menggeser kursor di layar TV dan tombol tengah **`OK`** untuk memilih menu.
- **Tombol Sistem Utama:**
  - **`⏻ POWER`:** Menyalakan atau mematikan (*sleep/wake*) TV.
  - **`🏠 HOME`:** Kembali ke tampilan beranda Android TV.
  - **`↩ BACK`:** Kembali ke menu/layar sebelumnya.
- **Kontrol Audio:**
  - **`+` / `-`:** Menambah atau mengurangi volume suara.
  - **`🔇`:** Mematikan (*mute*) atau menyalakan kembali suara TV.
  - Layar LCD akan menampilkan visualisasi level volume dalam bentuk progress bar fosfor hijau.
- **Kontrol Media (Playback):**
  - **`⏯`:** Play / Pause video atau musik.
  - **`⏪` / `⏩`:** Rewind / Fast Forward media.

---

### Langkah 3: Mengetik Cepat & Pencarian YouTube
Mengetik judul video atau film menggunakan remote fisik TV sangat lambat. WebMote menyediakan fitur **Fast Text Input**:
1. Ketik kalimat pencarian di kotak teks (misal: *"Lofi Hip Hop Chill Beats"*).
2. **Opsi 1 - Ketik ke TV (`⌨ TYPE TEXT`):** Mengirim seluruh teks langsung ke kotak input yang sedang aktif di TV.
   - *Tips:* Aktifkan tombol **`AUTO-ENTER: ON`** jika Anda ingin WebMote otomatis menekan Enter setelah mengirim teks.
3. **Opsi 2 - Cari di YouTube (`▶ YT SEARCH`):** Otomatis membuka aplikasi YouTube TV dan langsung menampilkan hasil pencarian dari teks yang Anda ketik!

---

### Langkah 4: 1-Klik Peluncuran Aplikasi (App Cartridges)
Di bagian bawah terdapat tombol cartridge retro untuk meluncurkan aplikasi populer secara instan:
- **`YT` YOUTUBE** (`vnd.youtube.launch://`)
- **`NF` NETFLIX** (`netflix://`)
- **`SP` SPOTIFY** (`spotify://`)
- **`D+` DISNEY+** (`hotstar://`)
- **`PV` PRIME** (`https://app.primevideo.com`)
- **`TW` TWITCH** (`twitch://`)

---

### Langkah 5: Mengatur Efek Retro (CRT & Sound SFX)
Pada toolbar atas, Anda dapat menyesuaikan tampilan & efek audio:
- **`CRT:ON / OFF`:** Mengaktifkan atau mematikan efek filter garis scanline TV tabung retro.
- **`SFX:ON / OFF`:** Mengaktifkan atau membisukan efek suara sintetis 8-bit (*blip/bleep*) saat tombol ditekan.

---

## 📱 Akses dari HP & PWA (Install ke Home Screen)

WebMote dapat dibuka langsung melalui browser smartphone (iPhone / Android) yang terhubung ke jaringan Wi-Fi yang sama:

1. Saat server dijalankan di Mac/komputer, perhatikan baris alamat jaringan yang muncul di terminal, contoh:
   ```
   🎮 [WebMote] Server running via Bun
      ➜  Local:   http://localhost:3000
      ➜  Network (Akses dari HP): http://192.168.1.3:3000
   ```
2. Buka browser di HP Anda (Safari, Chrome, Firefox, dll.).
3. Masukkan alamat IP tersebut (misal: **`http://192.168.1.3:3000`**).
4. WebMote akan langsung terbuka dengan tampilan layar sentuh yang responsif.

### 💡 Pasang Sebagai Aplikasi Fullscreen (PWA):
- **Di iPhone (Safari):** Tekan tombol **Share** (ikon kotak panah ke atas) ➜ pilih **"Add to Home Screen"** (Tambah ke Layar Utama).
- **Di Android (Chrome):** Tekan menu **titik tiga (⋮)** di pojok kanan atas ➜ pilih **"Install app"** atau **"Add to Home screen"**.
- Sekarang Anda memiliki remote TV 8-bit tanpa iklan langsung di layar utama HP Anda tanpa address bar browser!

---

## ⌨ Tabel Shortcut Keyboard Laptop

Anda dapat mengontrol TV secara langsung menggunakan keyboard fisik laptop tanpa perlu mengklik mouse:

| Tombol Keyboard | Aksi Remote TV | Keterangan |
| :--- | :--- | :--- |
| `Panah Atas (↑)` | D-Pad UP | Navigasi kursor ke atas |
| `Panah Bawah (↓)` | D-Pad DOWN | Navigasi kursor ke bawah |
| `Panah Kiri (←)` | D-Pad LEFT | Navigasi kursor ke kiri |
| `Panah Kanan (→)` | D-Pad RIGHT | Navigasi kursor ke kanan |
| `Enter` atau `Space` | Select / OK | Memilih atau mengonfirmasi menu |
| `Escape` / `Backspace` / `B` | BACK | Kembali ke layar sebelumnya |
| `H` atau `h` | HOME | Kembali ke Beranda Android TV |
| `+` atau `=` | VOLUME UP | Menambah volume suara |
| `-` atau `_` | VOLUME DOWN | Mengurangi volume suara |
| `M` atau `m` | MUTE | Mematikan / menyalakan suara |
| `P` atau `p` | POWER | Menyalakan / mematikan TV (Sleep/Wake) |

> *Catatan:* Shortcut keyboard dinonaktifkan secara otomatis saat kursor sedang berada di dalam kolom input teks agar tidak mengganggu pengetikan.

---

## 🔧 Panduan Troubleshooting (Masalah Umum & Solusi)

### 1. TV Tidak Ditemukan Saat Menekan "SCAN WI-FI"
- **Penyebab:** Router Wi-Fi Anda mungkin memblokir paket mDNS/Multicast antar-frekuensi 2.4 GHz dan 5 GHz, atau fitur *AP Isolation* aktif.
- **Solusi:** 
  1. Cari tahu IP TV Anda melalui menu TV: **Settings ➜ Network & Internet ➜ Wi-Fi yang terhubung ➜ IP Address** (misal: `192.168.1.25`).
  2. Buka dialog **`DEVICES`** di WebMote.
  3. Masukkan IP tersebut ke form **"IP OR MAC ADDRESS"** dan klik **`CONNECT DEVICE`**.
  4. Periksa apakah Laptop dan TV terhubung ke Wi-Fi yang sama (lihat [Panduan Wi-Fi Dual-Band](#-panduan-jaringan-wi-fi-24-ghz-vs-5-ghz-dual-band)).

### 2. Kode PIN Salah atau Sesi Pairing Kedaluwarsa
- **Penyebab:** Kode PIN di TV memiliki batas waktu (biasanya 30-60 detik).
- **Solusi:**
  1. Klik tombol **`🔄 MINTA PIN BARU`** yang ada di dalam dialog PIN.
  2. TV akan memunculkan kode PIN baru.
  3. Masukkan kode baru tersebut dan tekan **`VERIFY PIN`**.

### 3. TV Pernah Terhubung Tapi Sekarang Gagal Konek (Reset Sertifikat)
- **Penyebab:** Data sertifikat lama di TV telah kedaluwarsa atau terhapus di salah satu sisi.
- **Solusi:**
  1. Buka menu **`DEVICES`** ➜ klik **`⚙ BRIDGE SERVER SETTINGS`**.
  2. Klik tombol merah **`🗑 HAPUS KREDENSIAL PAIRING`**.
  3. Lakukan koneksi ulang dan masukkan PIN baru dari layar TV.

### 4. Port 3000 Sedang Digunakan (Port in Use)
- Jika port 3000 sudah dipakai oleh aplikasi lain, Anda dapat menentukan port lain dengan mudah melalui environment variable `PORT`:
  ```bash
  # Menjalankan di port 3005
  PORT=3005 npm run dev
  # atau
  PORT=3005 bun run dev
  ```

---

## 📁 Struktur Direktori Proyek

```
remote/
├── public/                 # Zero-Build Static Frontend (< 30 KB)
│   ├── index.html          # Markup semantik 8-bit NES remote chassis & modal dialog
│   ├── style.css           # Desain CSS token NES, border pixel 3D, & CRT scanlines
│   ├── app.js              # WebSocket client, Web Audio SFX synth, & event handlers
│   ├── favicon.svg         # Favicon retro pixel
│   └── manifest.json       # PWA manifest untuk instalasi di smartphone
├── server/                 # Universal Hybrid Backend
│   ├── index.ts            # Server tunggal (Bun.serve & Node http/ws dual-engine)
│   ├── androidRemote.ts    # Engine Android TV Remote Protocol v2 (TLS socket)
│   ├── adbController.ts    # Controller Wireless ADB fallback (Port 5555)
│   ├── discovery.ts        # Scanner subnet otomatis (mDNS, SSDP, & probe ARP)
│   ├── certs.ts            # Manajer sertifikat TLS X.509 (.webmote-certs.json)
│   ├── keycodes.ts         # Pemetaan keycode Android TV
│   └── types.ts            # Definisi TypeScript server
├── PRD.md                  # Dokumen Product Requirement Document
├── README.md               # Dokumentasi resmi proyek
└── package.json            # Konfigurasi dependensi & script multi-runtime
```

---

## 🔒 Privasi & Keamanan

- **Zero-Telemetry:** WebMote tidak mengirimkan satu byte data pun ke server cloud pihak ketiga.
- **Direct LAN Communication:** Seluruh komunikasi berjalan langsung secara lokal antara komputer/HP Anda dan TV melalui port aman TLS v2 (`6467`/`6466`) atau socket WebSocket lokal (`:3000/ws`).
- **Open Source & Auditable:** Kode sumber 100% transparan dan dapat diaudit secara bebas.

---

<p align="center">
  Dibuat dengan ❤️ untuk pengalaman menonton TV yang bebas gangguan dan berkecepatan tinggi.
</p>
